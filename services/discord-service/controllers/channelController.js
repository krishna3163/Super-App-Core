import Channel from '../models/Channel.js';
import Role from '../models/Role.js';

// Channels
const createChannel = async (req, res) => {
  try {
    const channel = new Channel(req.body);
    await channel.save();
    res.status(201).json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ serverId: req.params.serverId }).sort({ position: 1 });
    res.json({ status: 'success', data: channels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findByIdAndUpdate(req.params.channelId, req.body, { new: true });
    res.json({ status: 'success', data: channel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteChannel = async (req, res) => {
  try {
    await Channel.findByIdAndDelete(req.params.channelId);
    res.json({ status: 'success', message: 'Channel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Roles
const createRole = async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json({ status: 'success', data: role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ serverId: req.params.serverId }).sort({ position: -1 });
    res.json({ status: 'success', data: roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.roleId, req.body, { new: true });
    res.json({ status: 'success', data: role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.roleId);
    res.json({ status: 'success', message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createChannel, getChannels, updateChannel, deleteChannel, createRole, getRoles, updateRole, deleteRole };
