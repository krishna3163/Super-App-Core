import Snap from '../models/Snap.js';
import Streak from '../models/Streak.js';
import ScreenshotEvent from '../models/ScreenshotEvent.js';
import { AppError } from '../utils/errors.js';

export const sendSnap = async (req, res, next) => {
  try {
    const { senderId, receiverId, mediaUrl, mediaType, duration, ttlSeconds } = req.body;
    
    if (!senderId || !receiverId || !mediaUrl) {
      return next(new AppError('Missing required fields', 400, 'MISSING_FIELDS'));
    }

    const snap = new Snap({
      senderId,
      receiverId,
      mediaUrl,
      mediaType: mediaType || 'image',
      duration: duration || 10,
      ttlSeconds: ttlSeconds || duration || 10,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    await snap.save();

    // Update Streak logic
    let streak = await Streak.findOne({
      users: { $all: [senderId, receiverId] }
    });

    if (!streak) {
      streak = new Streak({
        users: [senderId, receiverId],
        count: 1,
        lastInteraction: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } else {
      const now = new Date();
      const last = new Date(streak.lastInteraction);
      const hoursDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

      if (hoursDiff >= 24 && hoursDiff < 48) {
        streak.count += 1;
        streak.lastInteraction = now;
      } else if (hoursDiff >= 48) {
        streak.count = 1;
        streak.lastInteraction = now;
      } else {
        streak.lastInteraction = now;
      }
      streak.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    await streak.save();

    res.status(201).json({ 
      success: true, 
      data: { snap, streak },
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};

export const viewSnap = async (req, res, next) => {
  try {
    const snapId = req.params.id || req.params.snapId;
    const snap = await Snap.findById(snapId);
    
    if (!snap) return next(new AppError('Snap not found or expired', 404, 'SNAP_NOT_FOUND'));
    
    if (snap.isViewed && snap.viewOnce && snap.replayCount >= 1) {
      return next(new AppError('Snap already viewed and removed', 403, 'SNAP_EXPIRED'));
    }

    // First time viewing
    if (!snap.isViewed) {
      snap.isViewed = true;
      snap.viewedAt = new Date();
      // Schedule disappearance if viewOnce
      if (snap.viewOnce) {
        snap.expiresAt = new Date(Date.now() + (snap.ttlSeconds * 1000));
      }
      await snap.save();
    }

    res.status(200).json({ 
      success: true, 
      data: snap, 
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};

export const replaySnap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const snap = await Snap.findById(id);

    if (!snap) return next(new AppError('Snap not found', 404, 'SNAP_NOT_FOUND'));
    if (snap.replayCount >= 1) return next(new AppError('Replay limit reached', 403, 'REPLAY_LIMIT_REACHED'));

    snap.replayCount += 1;
    // Extend expiry slightly for the replay
    snap.expiresAt = new Date(Date.now() + (snap.ttlSeconds * 1000) + 5000);
    await snap.save();

    res.status(200).json({
      success: true,
      data: snap,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
};

export const markScreenshot = async (req, res, next) => {
  try {
    const snapId = req.params.snapId || req.params.id;
    const { userId } = req.body;

    const snap = await Snap.findByIdAndUpdate(
      snapId, 
      { isScreenshotted: true }, 
      { new: true }
    );
    
    if (!snap) return next(new AppError('Snap not found', 404, 'SNAP_NOT_FOUND'));

    // Log event
    const event = new ScreenshotEvent({
      snapId: snap._id,
      byUserId: userId || 'unknown',
      eventType: 'screenshot'
    });
    await event.save();

    res.status(200).json({ 
      success: true, 
      message: 'Screenshot detected and logged', 
      data: { snap, event }, 
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};

export const getSnaps = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || req.params.userId;
    if (!userId) return next(new AppError('User ID is required', 400, 'USER_ID_REQUIRED'));

    const snaps = await Snap.find({ 
      receiverId: userId, 
      $or: [
        { isViewed: false },
        { isViewed: true, viewOnce: true, expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      results: snaps.length, 
      data: snaps, 
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};
