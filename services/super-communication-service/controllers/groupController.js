import SuperChat from '../models/SuperChat.js';
import Group from '../models/Group.js';
import crypto from 'crypto';

export const createGroup = async (req, res) => {
  try {
    const { name, participants, adminId, description, avatar } = req.body;
    const chat = new SuperChat({ participants: [...new Set([...participants, adminId])], isGroup: true, chatName: name, groupAdmin: adminId });
    await chat.save();
    const inviteCode = crypto.randomBytes(4).toString('hex');
    const group = new Group({ chatId: chat._id, description, avatar, admins: [adminId], inviteCode });
    await group.save();
    res.status(201).json({ chat, group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('chatId');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGroupSettings = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.groupId, req.body, { new: true });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDescription = async (req, res) => {
  try {
    const { description, name } = req.body;
    const group = await Group.findByIdAndUpdate(req.params.groupId, { description }, { new: true });
    if (name) await SuperChat.findByIdAndUpdate(group.chatId, { chatName: name });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { userIds } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    await SuperChat.findByIdAndUpdate(group.chatId, { $addToSet: { participants: { $each: userIds } } });
    res.json({ message: 'Members added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    await SuperChat.findByIdAndUpdate(group.chatId, { $pull: { participants: userId } });
    await Group.findByIdAndUpdate(groupId, { $pull: { admins: userId } });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await SuperChat.find({ participants: userId, isGroup: true }).populate('latestMessage');
    const results = [];
    for (const chat of chats) {
      const group = await Group.findOne({ chatId: chat._id });
      results.push({ chat, group });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findByIdAndUpdate(req.params.groupId, { $addToSet: { admins: userId } }, { new: true });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeAdmin = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const group = await Group.findByIdAndUpdate(groupId, { $pull: { admins: userId } }, { new: true });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
