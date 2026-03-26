import Server from '../models/Server.js';
import Role from '../models/Role.js';
import Channel from '../models/Channel.js';

const createServer = async (req, res) => {
  try {
    const { name, ownerId, icon } = req.body;
    
    // 1. Create Server
    const server = new Server({ name, ownerId, icon, members: [{ userId: ownerId, roles: [] }] });
    await server.save();

    // 2. Create Default Roles (@everyone and admin)
    const adminRole = new Role({ serverId: server._id, name: 'Admin', color: '#ff0000', permissions: ['ADMINISTRATOR'], position: 1 });
    const everyoneRole = new Role({ serverId: server._id, name: '@everyone', permissions: ['VIEW_CHANNELS', 'SEND_MESSAGES'], position: 0 });
    
    await Promise.all([adminRole.save(), everyoneRole.save()]);

    // 3. Update Owner with Admin Role
    server.members[0].roles.push(adminRole._id);
    await server.save();

    // 4. Create Default Channels
    const generalChannel = new Channel({ serverId: server._id, name: 'general', type: 'text' });
    const voiceChannel = new Channel({ serverId: server._id, name: 'General Voice', type: 'voice' });
    
    await Promise.all([generalChannel.save(), voiceChannel.save()]);

    res.status(201).json({ server, channels: [generalChannel, voiceChannel] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getServers = async (req, res) => {
  try {
    const { userId } = req.params;
    const servers = await Server.find({ 'members.userId': userId }).populate('members.roles');
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const joinServer = async (req, res) => {
  try {
    const { serverId, userId } = req.body;
    const server = await Server.findByIdAndUpdate(
      serverId,
      { $addToSet: { members: { userId, roles: [] } } },
      { new: true }
    );
    res.json(server);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createServer, getServers, joinServer };
