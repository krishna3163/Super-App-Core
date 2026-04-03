import SuperChat from '../models/SuperChat.js';
import SuperMessage from '../models/SuperMessage.js';
import { parseMessage } from '../utils/commandParser.js';

export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, content, attachments, replyTo, viewOnce } = req.body;
    
    // Parse for entities
    const { commands, mentions, hashtags } = parseMessage(content);

    // Check if chat has disappearing messages enabled
    const chat = await SuperChat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    let expiryTime = null;
    if (chat.disappearingMessagesTime && chat.disappearingMessagesTime > 0) {
      expiryTime = new Date(Date.now() + chat.disappearingMessagesTime * 1000);
    }

    const message = new SuperMessage({
      chatId,
      senderId,
      content,
      attachments: attachments || [],
      replyTo: replyTo || null,
      mentions,
      hashtags,
      viewOnce: viewOnce || false,
      expiryTime
    });
    
    await message.save();
    chat.latestMessage = message._id;
    await chat.save();

    // Handle special command triggers (e.g., /pay)
    let commandResponse = null;
    if (commands.length > 0) {
      const { cmd, args } = commands[0];
      if (cmd === 'help') {
        commandResponse = "Available commands: /pay, /poll, /event, /reminder, /help";
      }
    }

    res.status(201).json({ ...message.toObject(), commandResponse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleDisappearingMessages = async (req, res) => {
  try {
    const { chatId, timeInSeconds } = req.body; // e.g., 86400 (24h) or 0 (off)
    const chat = await SuperChat.findByIdAndUpdate(
      chatId,
      { disappearingMessagesTime: timeInSeconds },
      { new: true }
    );
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const consumeViewOnce = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await SuperMessage.findById(messageId);
    
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (!message.viewOnce) return res.status(400).json({ error: 'Not a view-once message' });

    // Permanently destroy the attachment data
    message.attachments = [];
    message.content = '📷 Media viewed';
    message.isDeletedEveryone = true; // Effectively deleted
    await message.save();

    res.json({ message: 'View once media destroyed securely' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId, newContent } = req.body;
    const message = await SuperMessage.findByIdAndUpdate(
      messageId,
      { content: newContent, isEdited: true },
      { new: true }
    );
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId, userId, emoji } = req.body;
    const message = await SuperMessage.findById(messageId);
    
    // Remove existing reaction from same user if any
    message.reactions = message.reactions.filter(r => r.userId !== userId);
    message.reactions.push({ userId, emoji });
    
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId, type } = req.body; // type: 'everyone' | 'me'
    if (type === 'everyone') {
      await SuperMessage.findByIdAndUpdate(messageId, { 
        content: 'This message was deleted', 
        isDeletedEveryone: true,
        attachments: []
      });
    } else {
      // In a real app, you'd track 'deletedFor' array per user
      // For now we just return success for local deletion simulation
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await SuperMessage.find({ chatId })
      .populate('replyTo')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    await SuperMessage.updateMany(
      { chatId, senderId: { $ne: userId }, status: { $ne: 'read' } },
      { $set: { status: 'read' }, $addToSet: { readBy: { userId } } }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const accessChat = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;
    if (!userId || !targetUserId) return res.status(400).json({ error: 'User IDs are required' });

    // Check if chat between these two already exists
    let chat = await SuperChat.findOne({
      isGroup: false,
      participants: { $all: [userId, targetUserId] }
    });

    if (chat) {
      return res.json(chat);
    } else {
      const newChat = new SuperChat({
        participants: [userId, targetUserId],
        isGroup: false,
        unreadCount: {}
      });
      await newChat.save();
      return res.status(201).json(newChat);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

