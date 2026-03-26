import AnonymousSession from '../models/AnonymousSession.js';

export const requestMatch = async (req, res) => {
  try {
    const { userId, mode } = req.body; // mode: 'random_chat' or 'micro_dating'
    
    // In a real high-scale app, we'd use Redis or a message queue for matching.
    // For this architecture, we look for a 'waiting' session of the same mode.
    let session = await AnonymousSession.findOneAndUpdate(
      { status: 'waiting', mode, 'users.userId': { $ne: userId } },
      { 
        $push: { users: { userId, tempName: `Stranger_${Math.floor(Math.random() * 1000)}` } },
        $set: { status: 'active', startedAt: new Date(), expiresAt: new Date(Date.now() + 60000) } // 60 seconds
      },
      { new: true }
    );

    if (!session) {
      // Create a new waiting session
      session = new AnonymousSession({
        mode,
        users: [{ userId, tempName: `Stranger_${Math.floor(Math.random() * 1000)}` }],
        status: 'waiting'
      });
      await session.save();
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const skipSession = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    const session = await AnonymousSession.findByIdAndUpdate(
      sessionId,
      { status: 'finished' },
      { new: true }
    );
    res.json({ message: 'Session skipped successfully', session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitMicroDatingChoice = async (req, res) => {
  try {
    const { sessionId, userId, liked } = req.body;
    
    const session = await AnonymousSession.findOneAndUpdate(
      { _id: sessionId, 'users.userId': userId },
      { $set: { 'users.$.liked': liked } },
      { new: true }
    );

    // Check if both users have made a choice
    const bothDecided = session.users.every(u => u.liked !== null);
    let mutualLike = false;

    if (bothDecided) {
      session.status = 'finished';
      mutualLike = session.users.every(u => u.liked === true);
      await session.save();
    }

    res.json({ session, bothDecided, mutualLike });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
