import UserRole from '../models/UserRole.js';
import Role from '../models/Role.js';

export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'] || req.body.actorId; // Assuming passed down from Gateway
      const targetId = req.params.targetId || req.body.targetId;

      if (!userId || !targetId) {
        return res.status(400).json({ error: 'Missing userId or targetId for authorization' });
      }

      const userRole = await UserRole.findOne({ userId, targetId }).populate('roleId');
      
      if (!userRole || !userRole.roleId) {
        return res.status(403).json({ error: 'Access denied: No role assigned in this context.' });
      }

      if (userRole.roleId.level === 0 || userRole.roleId.permissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({ error: `Access denied: Requires ${requiredPermission} permission.` });
    } catch (err) {
      res.status(500).json({ error: 'Authorization error' });
    }
  };
};
