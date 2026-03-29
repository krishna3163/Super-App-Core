import Server from '../models/Server.js';
import Channel from '../models/Channel.js';
import crypto from 'crypto';

export const createServer = async (req, res) => {
  try {
    const { name, description, icon, ownerId, isPublic } = req.body;
    const inviteCode = crypto.randomBytes(4).toString('hex');
    
    const server = new Server({
      name, description, icon, ownerId, isPublic, inviteCode,
      members: [{ userId: ownerId, roles: ['admin'] }],
      roles: [{ name: 'admin', color: '#ff0000', permissions: ['ADMINISTRATOR'] }, { name: 'member', color: '#99aab5', permissions: ['SEND_MESSAGES', 'VIEW_CHANNELS'] }],
      categories: [{ name: 'Text Channels', position: 0 }, { name: 'Voice Channels', position: 1 }]
    });
    
    await server.save();

    // Create default general channel
    const defaultChannel = new Channel({
      name: 'general', type: 'text', ownerId, serverId: server._id, admins: [ownerId]
    });
    await defaultChannel.save();

    res.status(201).json({ status: 'success', data: { server, defaultChannel } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getServer = async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    
    const channels = await Channel.find({ serverId: server._id });
    res.json({ status: 'success', data: { server, channels } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinServer = async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;
    const server = await Server.findOne({ inviteCode });
    if (!server) return res.status(404).json({ error: 'Invalid invite' });
    
    if (server.members.some(m => m.userId === userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }
    
    server.members.push({ userId, roles: ['member'] });
    await server.save();
    res.json({ status: 'success', data: server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const leaveServer = async (req, res) => {
  try {
    const { userId } = req.body;
    const server = await Server.findByIdAndUpdate(req.params.serverId, { $pull: { members: { userId } } }, { new: true });
    res.json({ status: 'success', data: server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserServers = async (req, res) => {
  try {
    const { userId } = req.params;
    const servers = await Server.find({ 'members.userId': userId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: servers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Roles & Categories ---
export const addRole = async (req, res) => {
  try {
    const { name, color, permissions } = req.body;
    const server = await Server.findByIdAndUpdate(req.params.serverId, { $push: { roles: { name, color, permissions } } }, { new: true });
    res.json({ status: 'success', data: server.roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;
    const server = await Server.findOneAndUpdate(
      { _id: req.params.serverId, 'members.userId': userId },
      { $addToSet: { 'members.$.roles': roleName } },
      { new: true }
    );
    res.json({ status: 'success', data: server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, position } = req.body;
    const server = await Server.findByIdAndUpdate(req.params.serverId, { $push: { categories: { name, position } } }, { new: true });
    res.json({ status: 'success', data: server.categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createServerChannel = async (req, res) => {
  try {
    const { name, type, isNsfw, slowmodeSeconds, ownerId } = req.body;
    const channel = new Channel({
      name, type, isNsfw, slowmodeSeconds, ownerId, serverId: req.params.serverId, admins: [ownerId]
    });
    await channel.save();
    res.status(201).json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createServer, getServer, joinServer, leaveServer, getUserServers, addRole, assignRole, addCategory, createServerChannel };
