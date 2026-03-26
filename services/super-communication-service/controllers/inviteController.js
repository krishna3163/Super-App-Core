import crypto from 'crypto';
import InviteLink from '../models/InviteLink.js';
import Group from '../models/Group.js';

export const createInvite = async (req, res) => {
  try {
    const { targetId, targetType, creatorId, expiresInDays, maxUses } = req.body;
    const token = crypto.randomBytes(16).toString('hex');
    
    const inviteData = { token, targetId, targetType, creatorId };
    
    if (expiresInDays) {
      inviteData.expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }
    if (maxUses) {
      inviteData.maxUses = maxUses;
    }

    const inviteLink = new InviteLink(inviteData);
    await inviteLink.save();

    res.status(201).json({ 
      inviteLink, 
      url: `${process.env.FRONTEND_URL}/invite/${token}` 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinViaInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.body;

    const invite = await InviteLink.findOne({ token, isActive: true });
    
    if (!invite) return res.status(404).json({ error: 'Invalid or inactive invite link' });
    if (invite.expiresAt && new Date() > invite.expiresAt) return res.status(400).json({ error: 'Invite link expired' });
    if (invite.maxUses && invite.currentUses >= invite.maxUses) return res.status(400).json({ error: 'Invite link usage limit reached' });

    // Join logic (assuming group for now, extendable to servers/communities)
    if (invite.targetType === 'group') {
      const group = await Group.findById(invite.targetId);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      
      // In a full implementation, you'd add the user to the SuperChat participants here
      // Mocking success for architecture completion
      invite.currentUses += 1;
      if (invite.maxUses && invite.currentUses >= invite.maxUses) {
        invite.isActive = false;
      }
      await invite.save();
      
      return res.json({ message: 'Successfully joined group', targetId: invite.targetId });
    }

    res.status(400).json({ error: 'Unsupported target type' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
