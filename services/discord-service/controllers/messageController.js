import DiscordMessage from '../models/DiscordMessage.js';

const sendMessage = async (req, res) => {
  try {
    const msg = new DiscordMessage(req.body);
    await msg.save();
    res.status(201).json({ status: 'success', data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { before, limit = 50 } = req.query;
    const filter = { channelId, isDeleted: false };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await DiscordMessage.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit)).populate('replyTo');
    res.json({ status: 'success', data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const msg = await DiscordMessage.findByIdAndUpdate(req.params.messageId, { content, isEdited: true, editedAt: new Date() }, { new: true });
    res.json({ status: 'success', data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await DiscordMessage.findByIdAndUpdate(req.params.messageId, { isDeleted: true });
    res.json({ status: 'success', message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { emoji, userId } = req.body;
    const msg = await DiscordMessage.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    const reaction = msg.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      if (reaction.users.includes(userId)) {
        reaction.users = reaction.users.filter(u => u !== userId);
        reaction.count = Math.max(0, reaction.count - 1);
        if (reaction.count === 0) msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
      } else {
        reaction.users.push(userId);
        reaction.count += 1;
      }
    } else {
      msg.reactions.push({ emoji, count: 1, users: [userId] });
    }
    await msg.save();
    res.json({ status: 'success', data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const pinMessage = async (req, res) => {
  try {
    const msg = await DiscordMessage.findByIdAndUpdate(req.params.messageId, { isPinned: true }, { new: true });
    res.json({ status: 'success', data: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPinnedMessages = async (req, res) => {
  try {
    const messages = await DiscordMessage.find({ channelId: req.params.channelId, isPinned: true, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchMessages = async (req, res) => {
  try {
    const { serverId, q, authorId, channelId, hasAttachment, page = 1 } = req.query;
    const filter = { serverId, isDeleted: false };
    if (q) filter.content = new RegExp(q, 'i');
    if (authorId) filter.authorId = authorId;
    if (channelId) filter.channelId = channelId;
    if (hasAttachment === 'true') filter['attachments.0'] = { $exists: true };

    const skip = (parseInt(page) - 1) * 25;
    const messages = await DiscordMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(25);
    res.json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { sendMessage, getMessages, editMessage, deleteMessage, addReaction, pinMessage, getPinnedMessages, searchMessages };
