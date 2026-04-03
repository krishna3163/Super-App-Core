import UserLocation from '../models/UserLocation.js';
import { AppError } from '../utils/errors.js';

export const updateLocation = async (req, res, next) => {
  try {
    const { userId, latitude, longitude, ghostMode, visibility, selectedFriendIds } = req.body;
    
    let userLoc = await UserLocation.findOne({ userId });
    if (!userLoc) {
      userLoc = new UserLocation({ userId });
    }

    if (latitude !== undefined && longitude !== undefined) {
      userLoc.location = {
        latitude,
        longitude,
        updatedAt: new Date()
      };
    }

    if (ghostMode !== undefined) userLoc.ghostMode = ghostMode;
    if (visibility) userLoc.visibility = visibility;
    if (selectedFriendIds) userLoc.selectedFriendIds = selectedFriendIds;

    await userLoc.save();

    res.status(200).json({
      success: true,
      data: userLoc,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
};

export const getMapLocations = async (req, res, next) => {
  try {
    const { viewerId } = req.query;
    
    // Logic to find locations visible to viewerId
    // 1. Not in ghost mode
    // 2. Visibility matches viewerId
    // Simplified for now: return all non-ghosted locations
    const locations = await UserLocation.find({ 
      ghostMode: false,
      userId: { $ne: viewerId }
    }).select('userId location visibility selectedFriendIds');

    // Filter by visibility (everyone or friends - would need friend service call)
    // For now, assume mutual-only is default for 'friends'
    const visibleLocations = locations.filter(loc => {
      if (loc.visibility === 'everyone') return true;
      if (loc.visibility === 'selected_friends') return loc.selectedFriendIds.includes(viewerId);
      return true; // Default friends visibility
    });

    res.status(200).json({
      success: true,
      data: visibleLocations,
      correlationId: req.correlationId
    });
  } catch (err) {
    next(err);
  }
};
