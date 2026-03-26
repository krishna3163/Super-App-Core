import Role from '../models/Role.js';
import UserRole from '../models/UserRole.js';
import AuditLog from '../models/AuditLog.js';

export const createRole = async (req, res) => {
  try {
    const { targetId, targetType, name, level, permissions, color, actorId } = req.body;
    
    const role = new Role({ targetId, targetType, name, level, permissions, color });
    await role.save();

    await new AuditLog({
      targetId,
      actorId,
      action: 'CREATE_ROLE',
      details: { roleId: role._id, roleName: role.name }
    }).save();

    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { targetId, targetType, userId, roleId, actorId } = req.body;
    
    const userRole = await UserRole.findOneAndUpdate(
      { userId, targetId },
      { targetType, roleId },
      { new: true, upsert: true }
    );

    await new AuditLog({
      targetId,
      actorId,
      action: 'ASSIGN_ROLE',
      details: { userId, roleId }
    }).save();

    res.json(userRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRoles = async (req, res) => {
  try {
    const { targetId } = req.params;
    const roles = await Role.find({ targetId }).sort({ level: 1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { targetId } = req.params;
    const logs = await AuditLog.find({ targetId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
