import UserRoleMode from '../models/UserRoleMode.js';

export const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    let userRole = await UserRoleMode.findOne({ userId });
    
    if (!userRole) {
      userRole = new UserRoleMode({ userId, roles: ['buyer', 'customer'], activeRole: 'buyer' });
      await userRole.save();
    }
    res.json(userRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const switchActiveRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const userRole = await UserRoleMode.findOneAndUpdate(
      { userId },
      { activeRole: role },
      { new: true }
    );
    res.json(userRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const userRole = await UserRoleMode.findOneAndUpdate(
      { userId },
      { $addToSet: { roles: role } },
      { new: true }
    );
    res.json(userRole);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
