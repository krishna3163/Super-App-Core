import FriendRequest from '../models/FriendRequest.js';
import TimelinePost from '../models/TimelinePost.js';
import Page from '../models/Page.js';
import Group from '../models/Group.js';
import SocialEvent from '../models/SocialEvent.js';

// =========== FRIEND SYSTEM ===========
const sendFriendRequest = async (req, res) => {
  try {
    const { senderId, recipientId } = req.body;
    if (senderId === recipientId) return res.status(400).json({ error: 'Cannot send request to yourself' });
    const existing = await FriendRequest.findOne({ $or: [{ senderId, recipientId }, { senderId: recipientId, recipientId: senderId }] });
    if (existing) return res.status(400).json({ error: 'Request already exists' });
    const request = new FriendRequest({ senderId, recipientId });
    await request.save();
    res.status(201).json({ status: 'success', data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const request = await FriendRequest.findByIdAndUpdate(requestId, { status }, { new: true });
    res.json({ status: 'success', data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    const friends = await FriendRequest.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
      status: 'accepted'
    });
    const friendIds = friends.map(f => f.senderId === userId ? f.recipientId : f.senderId);
    res.json({ status: 'success', data: friendIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ recipientId: req.params.userId, status: 'pending' });
    res.json({ status: 'success', data: requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========== TIMELINE ===========
const createTimelinePost = async (req, res) => {
  try {
    const post = new TimelinePost(req.body);
    await post.save();
    res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTimeline = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await TimelinePost.find({ $or: [{ authorId: targetId }, { targetId }], isHidden: false }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNewsFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    // Get friends
    const friends = await FriendRequest.find({ $or: [{ senderId: userId }, { recipientId: userId }], status: 'accepted' });
    const friendIds = friends.map(f => f.senderId === userId ? f.recipientId : f.senderId);
    friendIds.push(userId);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await TimelinePost.find({ authorId: { $in: friendIds }, isHidden: false, privacy: { $in: ['public', 'friends'] } }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reactToPost = async (req, res) => {
  try {
    const { userId, type } = req.body; // type: like, love, haha, wow, sad, angry
    const post = await TimelinePost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existing = post.reactions.findIndex(r => r.userId === userId);
    if (existing > -1) {
      const oldType = post.reactions[existing].type;
      post.reactionCounts[oldType] = Math.max(0, (post.reactionCounts[oldType] || 0) - 1);
      post.reactions.splice(existing, 1);
    }
    
    if (type) {
      post.reactions.push({ userId, type });
      post.reactionCounts[type] = (post.reactionCounts[type] || 0) + 1;
    }
    await post.save();
    res.json({ status: 'success', data: { reactionCounts: post.reactionCounts } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { userId, userName, userAvatar, content } = req.body;
    const post = await TimelinePost.findById(req.params.postId);
    post.comments.push({ userId, userName, userAvatar, content });
    post.commentCount = post.comments.length;
    await post.save();
    res.json({ status: 'success', data: post.comments[post.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sharePost = async (req, res) => {
  try {
    const { userId, userName, content } = req.body;
    const original = await TimelinePost.findById(req.params.postId);
    if (!original) return res.status(404).json({ error: 'Post not found' });

    const shared = new TimelinePost({
      authorId: userId, authorName: userName, content,
      isSharedPost: true, originalPostId: original._id,
      media: original.media
    });
    await shared.save();

    original.shares.push({ userId, shareType: 'share', sharedAt: new Date() });
    original.shareCount += 1;
    await original.save();

    res.status(201).json({ status: 'success', data: shared });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========== PAGES ===========
const createPage = async (req, res) => {
  try { const page = new Page(req.body); await page.save(); res.status(201).json({ status: 'success', data: page }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getPages = async (req, res) => {
  try { const pages = await Page.find({ ownerId: req.params.userId }); res.json({ status: 'success', data: pages }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

// =========== GROUPS ===========
const createGroup = async (req, res) => {
  try { const group = new Group(req.body); await group.save(); res.status(201).json({ status: 'success', data: group }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const getGroups = async (req, res) => {
  try { const groups = await Group.find({ 'members': req.params.userId }); res.json({ status: 'success', data: groups }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

// =========== EVENTS ===========
const createEvent = async (req, res) => {
  try { const event = new SocialEvent(req.body); await event.save(); res.status(201).json({ status: 'success', data: event }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

const rsvpToEvent = async (req, res) => {
  try {
    const { userId, userName, status } = req.body;
    const event = await SocialEvent.findById(req.params.eventId);
    event.rsvps = event.rsvps.filter(r => r.userId !== userId);
    event.rsvps.push({ userId, userName, status, respondedAt: new Date() });
    event.goingCount = event.rsvps.filter(r => r.status === 'going').length;
    event.interestedCount = event.rsvps.filter(r => r.status === 'interested').length;
    await event.save();
    res.json({ status: 'success', data: event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const events = await SocialEvent.find({ startDate: { $gte: new Date() }, privacy: 'public' }).sort({ startDate: 1 }).limit(20);
    res.json({ status: 'success', data: events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { 
  sendFriendRequest, respondToFriendRequest, getFriends, getPendingRequests,
  createTimelinePost, getTimeline, getNewsFeed, reactToPost, addComment, sharePost,
  createPage, getPages, createGroup, getGroups,
  createEvent, rsvpToEvent, getUpcomingEvents
};
