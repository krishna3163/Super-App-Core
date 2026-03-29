import Server from '../models/Server.js';
import Role from '../models/Role.js';
import Channel from '../models/Channel.js';
import crypto from 'crypto';

const createServer = async (req, res) => {
  try {
    const { name, ownerId, icon, description, isPublic } = req.body;
    const server = new Server({ name, ownerId, icon, description, isPublic, members: [{ userId: ownerId, roles: [], joinedAt: new Date() }], memberCount: 1 });
    await server.save();

    const adminRole = new Role({ serverId: server._id, name: 'Admin', color: '#ff0000', permissions: ['ADMINISTRATOR'], position: 1, hoist: true });
    const everyoneRole = new Role({ serverId: server._id, name: '@everyone', permissions: ['VIEW_CHANNELS', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'CONNECT', 'SPEAK'], position: 0, isDefault: true });
    await Promise.all([adminRole.save(), everyoneRole.save()]);

    server.members[0].roles.push(adminRole._id);
    await server.save();

    const generalChannel = new Channel({ serverId: server._id, name: 'general', type: 'text' });
    const announceChannel = new Channel({ serverId: server._id, name: 'announcements', type: 'announcement' });
    const voiceChannel = new Channel({ serverId: server._id, name: 'General Voice', type: 'voice' });
    await Promise.all([generalChannel.save(), announceChannel.save(), voiceChannel.save()]);

    server.categories.push({ name: 'Text Channels', position: 0, channels: [generalChannel._id, announceChannel._id] });
    server.categories.push({ name: 'Voice Channels', position: 1, channels: [voiceChannel._id] });
    await server.save();

    res.status(201).json({ status: 'success', data: { server, channels: [generalChannel, announceChannel, voiceChannel] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getServers = async (req, res) => {
  try {
    const { userId } = req.params;
    const servers = await Server.find({ 'members.userId': userId }).select('-bans -invites');
    res.json({ status: 'success', data: servers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getServerDetails = async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId).populate('members.roles');
    if (!server) return res.status(404).json({ error: 'Server not found' });
    const channels = await Channel.find({ serverId: server._id }).sort({ position: 1 });
    const roles = await Role.find({ serverId: server._id }).sort({ position: -1 });
    res.json({ status: 'success', data: { server, channels, roles } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndUpdate(req.params.serverId, req.body, { new: true });
    res.json({ status: 'success', data: server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const joinServer = async (req, res) => {
  try {
    const { serverId, userId } = req.body;
    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ error: 'Server not found' });
    
    const isBanned = server.bans.some(b => b.userId === userId);
    if (isBanned) return res.status(403).json({ error: 'You are banned from this server' });

    const isMember = server.members.some(m => m.userId === userId);
    if (isMember) return res.status(400).json({ error: 'Already a member' });

    server.members.push({ userId, roles: [], joinedAt: new Date() });
    server.memberCount += 1;
    await server.save();
    res.json({ status: 'success', data: server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const leaveServer = async (req, res) => {
  try {
    const { serverId, userId } = req.body;
    const server = await Server.findById(serverId);
    if (server.ownerId === userId) return res.status(400).json({ error: 'Owner cannot leave. Transfer ownership first.' });

    server.members = server.members.filter(m => m.userId !== userId);
    server.memberCount = Math.max(0, server.memberCount - 1);
    await server.save();
    res.json({ status: 'success', message: 'Left server' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const kickMember = async (req, res) => {
  try {
    const { serverId, userId, reason } = req.body;
    const server = await Server.findById(serverId);
    server.members = server.members.filter(m => m.userId !== userId);
    server.memberCount = Math.max(0, server.memberCount - 1);
    await server.save();
    res.json({ status: 'success', message: `Kicked user: ${reason || 'No reason'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const banMember = async (req, res) => {
  try {
    const { serverId, userId, reason, bannedBy } = req.body;
    const server = await Server.findById(serverId);
    server.members = server.members.filter(m => m.userId !== userId);
    server.memberCount = Math.max(0, server.memberCount - 1);
    server.bans.push({ userId, reason, bannedBy, bannedAt: new Date() });
    await server.save();
    res.json({ status: 'success', message: 'User banned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unbanMember = async (req, res) => {
  try {
    const { serverId, userId } = req.body;
    await Server.findByIdAndUpdate(serverId, { $pull: { bans: { userId } } });
    res.json({ status: 'success', message: 'User unbanned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createInvite = async (req, res) => {
  try {
    const { serverId, createdBy, maxUses, expiresInHours, channel } = req.body;
    const code = crypto.randomBytes(4).toString('hex');
    const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 3600000) : null;
    
    const server = await Server.findById(serverId);
    server.invites.push({ code, createdBy, maxUses: maxUses || 0, uses: 0, expiresAt, channel });
    await server.save();
    res.json({ status: 'success', data: { code, expiresAt } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const joinByInvite = async (req, res) => {
  try {
    const { code, userId } = req.body;
    const server = await Server.findOne({ 'invites.code': code });
    if (!server) return res.status(404).json({ error: 'Invalid invite code' });

    const invite = server.invites.find(i => i.code === code);
    if (invite.expiresAt && invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite expired' });
    if (invite.maxUses > 0 && invite.uses >= invite.maxUses) return res.status(400).json({ error: 'Invite max uses reached' });

    const isMember = server.members.some(m => m.userId === userId);
    if (isMember) return res.status(400).json({ error: 'Already a member' });

    invite.uses += 1;
    server.members.push({ userId, roles: [], joinedAt: new Date() });
    server.memberCount += 1;
    await server.save();
    res.json({ status: 'success', data: server });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const discoverServers = async (req, res) => {
  try {
    const { q, tags, page = 1, limit = 20 } = req.query;
    const filter = { isPublic: true };
    if (q) filter.name = new RegExp(q, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const servers = await Server.find(filter).select('name icon description memberCount tags boostLevel').sort({ memberCount: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: servers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createServer, getServers, getServerDetails, updateServer, joinServer, leaveServer, kickMember, banMember, unbanMember, createInvite, joinByInvite, discoverServers };
