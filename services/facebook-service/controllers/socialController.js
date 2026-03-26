import FriendRequest from '../models/FriendRequest.js';
import TimelinePost from '../models/TimelinePost.js';
import Page from '../models/Page.js';
import Group from '../models/Group.js';
import SocialEvent from '../models/SocialEvent.js';

// Friend System
const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, recipientId } = req.body;
    const existing = await FriendRequest.findOne({ senderId, recipientId });
    if (existing) return res.status(400).json({ error: 'Request already sent' });
    
    const request = new FriendRequest({ senderId, recipientId });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body; // 'accepted' or 'rejected'
    const request = await FriendRequest.findByIdAndUpdate(requestId, { status }, { new: true });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Timeline
const createTimelinePost = async (req, res) => {
  try {
    const { authorId, targetId, targetType, content, media } = req.body;
    const post = new TimelinePost({ authorId, targetId, targetType, content, media });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTimeline = async (req, res) => {
  try {
    const { targetId } = req.params;
    const posts = await TimelinePost.find({ targetId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pages & Groups
const createPage = async (req, res) => {
  try {
    const page = new Page(req.body);
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Events
const createEvent = async (req, res) => {
  try {
    const event = new SocialEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rsvpToEvent = async (req, res) => {
  try {
    const { eventId, userId, status } = req.body;
    const event = await SocialEvent.findByIdAndUpdate(
      eventId,
      { $pull: { rsvps: { userId } } }, // remove existing
      { new: true }
    );
    event.rsvps.push({ userId, status });
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { 
  sendFriendRequest, respondToFriendRequest, 
  createTimelinePost, getTimeline, 
  createPage, createGroup, 
  createEvent, rsvpToEvent 
};
