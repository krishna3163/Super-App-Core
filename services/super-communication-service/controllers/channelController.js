import Channel from '../models/Channel.js';
import SuperMessage from '../models/SuperMessage.js';
import crypto from 'crypto';

export const createChannel = async (req, res) => {
  try {
    const { name, description, avatar, ownerId, type, isNsfw, slowmodeSeconds, parentId, isThread } = req.body;
    const inviteCode = crypto.randomBytes(4).toString('hex');
    const channel = new Channel({ 
      name, description, avatar, ownerId, type, isNsfw, slowmodeSeconds,
      parentId, isThread, admins: [ownerId], subscribers: [ownerId], inviteCode 
    });
    await channel.save();
    res.status(201).json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const { userId } = req.params;
    const channels = await Channel.find({ subscribers: userId, isThread: false }).sort({ lastMessageAt: -1, createdAt: -1 });
    res.json({ status: 'success', data: channels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const subscribeToChannel = async (req, res) => {
  try {
    const { channelId, userId } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { subscribers: userId } }, { new: true });
    
    // Optional: send welcome message
    if (channel && channel.welcomeMessage) {
      const welcomeMsg = new SuperMessage({
        chatId: channel._id,
        senderId: 'system',
        content: channel.welcomeMessage.replace('{user}', userId), // Basic template replacement
        type: 'system'
      });
      await welcomeMsg.save();
    }
    
    res.json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChannelSettings = async (req, res) => {
  try {
    const { channelId } = req.params;
    const updates = req.body; // Allows updating topic, slowmode, permissions, etc.
    const channel = await Channel.findByIdAndUpdate(channelId, updates, { new: true });
    res.json({ status: 'success', data: channel });
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
    
    // Check broadcast channel admin restriction
    if (channel.type === 'broadcast' && !channel.admins.includes(senderId)) {
      return res.status(403).json({ error: 'Only admins can post in broadcast channels' });
    }

    const message = new SuperMessage({ chatId: channelId, senderId, content, attachments: attachments || [] });
    await message.save();
    
    channel.lastMessageAt = new Date();
    await channel.save();
    
    res.status(201).json({ status: 'success', data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const messages = await SuperMessage.find({ chatId: channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    res.json({ status: 'success', data: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { admins: userId, subscribers: userId } }, { new: true });
    res.json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userIds } = req.body;
    const channel = await Channel.findByIdAndUpdate(channelId, { $addToSet: { subscribers: { $each: userIds } } }, { new: true });
    res.json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- NEW DISCORD-LIKE FEATURES ---

export const pinMessage = async (req, res) => {
  try {
    const { channelId, messageId } = req.params;
    await Channel.findByIdAndUpdate(channelId, { $addToSet: { pinnedMessages: messageId } });
    await SuperMessage.findByIdAndUpdate(messageId, { isPinned: true });
    res.json({ status: 'success', message: 'Message pinned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unpinMessage = async (req, res) => {
  try {
    const { channelId, messageId } = req.params;
    await Channel.findByIdAndUpdate(channelId, { $pull: { pinnedMessages: messageId } });
    await SuperMessage.findByIdAndUpdate(messageId, { isPinned: false });
    res.json({ status: 'success', message: 'Message unpinned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPinnedMessages = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    const messages = await SuperMessage.find({ _id: { $in: channel.pinnedMessages } });
    res.json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createThread = async (req, res) => {
  try {
    const { channelId, messageId } = req.params; // The message we're branching off
    const { name, ownerId, threadArchiveDuration } = req.body;
    
    const parentChannel = await Channel.findById(channelId);
    if (!parentChannel) return res.status(404).json({ error: 'Parent channel not found' });
    
    const inviteCode = crypto.randomBytes(4).toString('hex');
    const thread = new Channel({
      name, ownerId,
      type: 'text',
      parentId: channelId,
      isThread: true,
      threadArchiveDuration: threadArchiveDuration || 1440,
      admins: [ownerId],
      subscribers: [ownerId],
      inviteCode
    });
    
    await thread.save();
    
    // Optional: Reference the thread in the parent message
    await SuperMessage.findByIdAndUpdate(messageId, { $set: { threadId: thread._id } });
    
    res.status(201).json({ status: 'success', data: thread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChannelThreads = async (req, res) => {
  try {
    const threads = await Channel.find({ parentId: req.params.channelId, isThread: true });
    res.json({ status: 'success', data: threads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePermissions = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { roleId, allow, deny } = req.body; // e.g. { roleId: 'member', allow: ['SEND_MESSAGES'], deny: ['ATTACH_FILES'] }
    
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    
    const existingOverride = channel.permissionOverrides.find(p => p.roleId === roleId);
    if (existingOverride) {
      existingOverride.allow = allow;
      existingOverride.deny = deny;
    } else {
      channel.permissionOverrides.push({ roleId, allow, deny });
    }
    
    await channel.save();
    res.json({ status: 'success', data: channel.permissionOverrides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
