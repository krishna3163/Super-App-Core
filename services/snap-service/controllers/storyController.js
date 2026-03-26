import StoryAudience from '../models/StoryAudience.js';
import Snap from '../models/Snap.js';
import { AppError } from '../utils/errors.js';

export const updateStoryAudience = async (req, res, next) => {
  try {
    const { userId, blockedUserIds, trustedUserIds, defaultVisibility } = req.body;
    
    let audience = await StoryAudience.findOne({ userId });
    if (!audience) {
      audience = new StoryAudience({ userId });
    }

    if (blockedUserIds) audience.blockedUserIds = blockedUserIds;
    if (trustedUserIds) audience.trustedUserIds = trustedUserIds;
    if (defaultVisibility) audience.defaultVisibility = defaultVisibility;

    await audience.save();

    res.status(200).json({
      success: true,
      data: audience,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
};

export const checkStoryAccess = async (req, res, next) => {
  try {
    const { storyOwnerId, viewerId } = req.query;
    
    const audience = await StoryAudience.findOne({ userId: storyOwnerId });
    if (!audience) {
      return res.status(200).json({ success: true, hasAccess: true }); // Default public-ish
    }

    if (audience.blockedUserIds.includes(viewerId)) {
      return res.status(200).json({ success: true, hasAccess: false, reason: 'BLOCKED' });
    }

    if (audience.defaultVisibility === 'trusted_only' && !audience.trustedUserIds.includes(viewerId)) {
      return res.status(200).json({ success: true, hasAccess: false, reason: 'NOT_IN_TRUSTED' });
    }

    if (audience.defaultVisibility === 'private' && storyOwnerId !== viewerId) {
      return res.status(200).json({ success: true, hasAccess: false, reason: 'PRIVATE' });
    }

    res.status(200).json({
      success: true,
      hasAccess: true,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
};
