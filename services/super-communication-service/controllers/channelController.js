import Channel from '../models/Channel.js';
import SuperMessage from '../models/SuperMessage.js';
import SuperChat from '../models/SuperChat.js';
import crypto from 'crypto';

export const createChannel = async (req, res) => {
  try {
    const { name, description, avatar, ownerId } = req.body;
    const inviteCode = crypto.randomBytes(4).toString('hex');
    const channel = new Channel({ name, description, avatar, ownerId, admins: [ownerId], subscribers: [ownerId], inviteCode });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const { userId } = req.params;
    const channels = await Channel.find({ subscribers: userId });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const subscribeToChannel = async (req, res) => {
  try {
    const { channelId, userId } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { subscribers: userId } }, { new: true });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description, avatar } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { name, description, avatar }, { new: true });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendChannelMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { senderId, content, attachments } = req.body;
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    if (!channel.admins.includes(senderId)) return res.status(403).json({ error: 'Only admins can post in channels' });

    // Use a virtual chatId based on channelId for message storage
    const message = new SuperMessage({ chatId: channelId, senderId, content, attachments: attachments || [] });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await SuperMessage.find({ chatId: channelId }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { admins: userId, subscribers: userId } }, { new: true });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userIds } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { subscribers: { $each: userIds } } }, { new: true });
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
