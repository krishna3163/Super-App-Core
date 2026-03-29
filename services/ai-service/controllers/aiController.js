import { GoogleGenAI } from '@google/genai';
import AILog from '../models/AILog.js';
import dotenv from 'dotenv';
import MasterAlgorithm from '../utils/MasterAlgorithm.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No messages provided to summarize' });
    }

    const chatText = messages.map(m => `${m.senderName || 'User'}: ${m.content}`).join('\n');
    const prompt = `Summarize the following chat conversation concisely, highlighting the key points and any action items:\n\n${chatText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const summary = response.text;
    await logUsage(userId, 'summarize', prompt, summary);

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const suggestReplies = async (req, res) => {
  try {
    const { userId, contextMessages } = req.body;
    
    const chatText = contextMessages.map(m => `${m.senderName || 'User'}: ${m.content}`).join('\n');
    const prompt = `Based on this recent chat context:\n\n${chatText}\n\nProvide exactly 3 short, distinct, and natural reply suggestions for me to send next. Format them as a JSON array of strings. Do not include markdown formatting like \`\`\`json. Just the array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let suggestions = [];
    try {
        const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(text);
    } catch (e) {
        suggestions = ["Okay", "I see", "Let me check"];
    }

    await logUsage(userId, 'reply', prompt, JSON.stringify(suggestions));

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const askAI = async (req, res) => {
  try {
    const { userId, question } = req.body;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
    });

    const answer = response.text;
    await logUsage(userId, 'ask', question, answer);

    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { userId, userHistory, availableItems } = req.body;
    
    const historyText = JSON.stringify(userHistory);
    const itemsText = JSON.stringify(availableItems);
    const prompt = `Based on the user's interaction history: ${historyText}\n\nPick the top 5 most relevant items from this list: ${itemsText}\n\nReturn ONLY a JSON array of item IDs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let recommendedIds = [];
    try {
        const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        recommendedIds = JSON.parse(text);
    } catch (e) {
        recommendedIds = availableItems.slice(0, 5).map(i => i._id || i.id);
    }

    await logUsage(userId, 'recommend', prompt, JSON.stringify(recommendedIds));

    res.json({ recommendedIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

