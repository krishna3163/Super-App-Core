import DiscordMessage from '../models/DiscordMessage.js';

const sendMessage = async (req, res) => {
  try {
    const { channelId, authorId, content, mentions } = req.body;
    const message = new DiscordMessage({ channelId, authorId, content, mentions });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await DiscordMessage.find({ channelId }).sort({ createdAt: -1 }).limit(50);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { messageId, emoji, userId } = req.body;
    const message = await DiscordMessage.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const reaction = message.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      if (!reaction.users.includes(userId)) reaction.users.push(userId);
    } else {
      message.reactions.push({ emoji, users: [userId] });
    }
    
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { sendMessage, getMessages, addReaction };
