import { GoogleGenAI } from '@google/genai';
import AILog from '../models/AILog.js';
import dotenv from 'dotenv';
import MasterAlgorithm from '../utils/MasterAlgorithm.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// INPUT SANITIZATION / PROMPT INJECTION GUARD
// ==========================================

const MAX_INPUT_LENGTH = 4000;

// Patterns that indicate prompt injection / jailbreak attempts
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|prior|above|system)\s+(instructions?|prompts?|rules?|context)/i,
  /forget\s+(previous|all|prior|above|system)\s+(instructions?|prompts?|rules?|context)/i,
  /disregard\s+(previous|all|prior|above|system)\s+(instructions?|prompts?|rules?|context)/i,
  /override\s+(previous|all|prior|above|system)\s+(instructions?|prompts?|rules?|context)/i,
  /reveal\s+(hidden|secret|internal|system|confidential)\s*(data|info|prompt|key|password|token|instructions?)?/i,
  /show\s+(hidden|secret|internal|system|confidential)\s*(data|info|prompt|key|password|token|api|instructions?)?/i,
  /print\s+(hidden|secret|internal|system|confidential)\s*(data|info|prompt|key|password|token|api|instructions?)?/i,
  /\bapi[_\s-]?key\b/i,
  /\bsystem\s+prompt\b/i,
  /act\s+as\s+(an?\s+)?(admin|root|superuser|developer|system|god|unrestricted|jailbroken)/i,
  /you\s+(are|were)\s+now\s+(free|unrestricted|jailbroken|a\s+different)/i,
  /\bdanmode\b|\bjailbreak\b|\bDAN\b/,
];

/**
 * Sanitizes and validates user-supplied AI input text.
 * Returns { safe: boolean, reason?: string, sanitized?: string }
 */
const sanitizeAIInput = (text) => {
  if (typeof text !== 'string') return { safe: false, reason: 'Input must be a string' };
  if (text.trim().length === 0) return { safe: false, reason: 'Input cannot be empty' };
  if (text.length > MAX_INPUT_LENGTH) {
    return { safe: false, reason: `Input exceeds maximum allowed length of ${MAX_INPUT_LENGTH} characters` };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Input contains disallowed patterns' };
    }
  }

  return { safe: true, sanitized: text.trim() };
};

/**
 * Sanitizes an array of chat messages before sending to AI.
 * Strips sender names / content that look like injection attempts.
 */
const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return { safe: false, reason: 'Messages must be an array' };
  if (messages.length === 0) return { safe: false, reason: 'Messages array cannot be empty' };
  if (messages.length > 100) return { safe: false, reason: 'Too many messages (max 100)' };

  const sanitized = [];
  for (const m of messages) {
    const contentCheck = sanitizeAIInput(m.content || '');
    if (!contentCheck.safe) return contentCheck;
    sanitized.push({
      senderName: typeof m.senderName === 'string' ? m.senderName.substring(0, 100) : 'User',
      content: contentCheck.sanitized,
    });
  }
  return { safe: true, sanitized };
};

const logUsage = async (userId, action, prompt, response) => {
  try {
    const log = new AILog({
      userId,
      action,
      promptLength: prompt?.length || 0,
      responseLength: response?.length || 0,
    });
    await log.save();
  } catch (err) {
    console.error('Failed to log AI usage', err);
  }
};

export const summarizeChat = async (req, res) => {
  try {
    const { userId, messages } = req.body;

    const msgCheck = sanitizeMessages(messages);
    if (!msgCheck.safe) {
      return res.status(400).json({ error: msgCheck.reason });
    }

    const chatText = msgCheck.sanitized.map(m => `${m.senderName}: ${m.content}`).join('\n');
    const prompt = `Summarize the following chat conversation concisely, highlighting the key points and any action items:\n\n${chatText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const summary = response.text;
    await logUsage(userId, 'summarize', prompt, summary);

    res.json({ summary });
  } catch (err) {
    console.error('AI summarize error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const suggestReplies = async (req, res) => {
  try {
    const { userId, contextMessages } = req.body;

    const msgCheck = sanitizeMessages(contextMessages);
    if (!msgCheck.safe) {
      return res.status(400).json({ error: msgCheck.reason });
    }

    const chatText = msgCheck.sanitized.map(m => `${m.senderName}: ${m.content}`).join('\n');
    const prompt = `Based on this recent chat context:\n\n${chatText}\n\nProvide exactly 3 short, distinct, and natural reply suggestions for me to send next. Format them as a JSON array of strings. Do not include markdown formatting like \`\`\`json. Just the array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let suggestions = [];
    try {
        const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(text);
        if (!Array.isArray(suggestions)) suggestions = ["Okay", "I see", "Let me check"];
    } catch (e) {
        suggestions = ["Okay", "I see", "Let me check"];
    }

    await logUsage(userId, 'reply', prompt, JSON.stringify(suggestions));

    res.json({ suggestions });
  } catch (err) {
    console.error('AI reply error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const askAI = async (req, res) => {
  try {
    const { userId, question } = req.body;

    const check = sanitizeAIInput(question);
    if (!check.safe) {
      return res.status(400).json({ error: check.reason });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: check.sanitized,
    });

    const answer = response.text;
    await logUsage(userId, 'ask', check.sanitized, answer);

    res.json({ answer });
  } catch (err) {
    console.error('AI ask error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { userId, userHistory, availableItems } = req.body;
    
    if (!Array.isArray(userHistory) || !Array.isArray(availableItems)) {
      return res.status(400).json({ error: 'userHistory and availableItems must be arrays' });
    }
    if (availableItems.length > 200) {
      return res.status(400).json({ error: 'availableItems exceeds maximum of 200 items' });
    }

    const historyText = JSON.stringify(userHistory.slice(0, 50));
    const itemsText = JSON.stringify(availableItems.slice(0, 200).map(i => ({ id: i._id || i.id, name: i.name })));
    const prompt = `Based on the user's interaction history: ${historyText}\n\nPick the top 5 most relevant items from this list: ${itemsText}\n\nReturn ONLY a JSON array of item IDs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let recommendedIds = [];
    try {
        const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        recommendedIds = JSON.parse(text);
        if (!Array.isArray(recommendedIds)) recommendedIds = [];
    } catch (e) {
        recommendedIds = availableItems.slice(0, 5).map(i => i._id || i.id);
    }

    await logUsage(userId, 'recommend', prompt, JSON.stringify(recommendedIds));

    res.json({ recommendedIds });
  } catch (err) {
    console.error('AI recommend error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const rankFeed = async (req, res) => {
  try {
    const { user, items } = req.body;
    
    if (!user || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'User and Items array are required' });
    }

    // Pass the raw data through the Ultimate Unified Super Core Algorithm
    const rankedFeed = MasterAlgorithm.rankFeed(user, items);

    res.json({ status: 'success', data: rankedFeed });
  } catch (err) {
    console.error('AI rankFeed error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

