import Group from '../models/Group.js';
import Message from '../models/Message.js';
import { AppError } from '../utils/errors.js';

export const createGroup = async (req, res, next) => {
  try {
    const { name, description, createdBy, members } = req.body;

    if (!name || !createdBy) {
      return next(new AppError('Group name and creator are required', 400));
    }

    const initialMembers = members ? [...members] : [];
    if (!initialMembers.some(m => m.userId === createdBy)) {
      initialMembers.push({ userId: createdBy, role: 'admin' });
    }

    const group = new Group({
      name,
      description,
      createdBy,
      members: initialMembers
    });

    await group.save();

    res.status(201).json({ status: 'success', group, correlationId: req.correlationId });
  } catch (err) {
    next(err);
  }
};

export const getGroupsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const groups = await Group.find({ 'members.userId': userId });

    res.status(200).json({ status: 'success', results: groups.length, groups, correlationId: req.correlationId });
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId, role } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return next(new AppError('Group not found', 404));

    if (group.members.some(m => m.userId === userId)) {
      return next(new AppError('User already in group', 400));
    }

    group.members.push({ userId, role: role || 'member' });
    await group.save();

    res.status(200).json({ status: 'success', group, correlationId: req.correlationId });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { senderId, content, mediaUrls, messageType } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return next(new AppError('Group not found', 404));

    const message = new Message({
      groupId,
      senderId,
      content,
      mediaUrls,
      messageType
    });

    await message.save();

    res.status(201).json({ status: 'success', message, correlationId: req.correlationId });
  } catch (err) {
    next(err);
  }
};

export const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ groupId }).sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: messages.length, messages, correlationId: req.correlationId });
  } catch (err) {
    next(err);
  }
};
