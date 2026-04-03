import AnonymousSession from '../models/AnonymousSession.js';

// Request or create a match
export const requestMatch = async (req, res) => {
  try {
    const { userId, mode = 'random_chat', interests = [] } = req.body;
    
    let matchQuery = { status: 'waiting', mode, 'users.userId': { $ne: userId } };
    
    if (interests.length > 0) {
      matchQuery['users.interests'] = { $in: interests };
    }
    
    let session = await AnonymousSession.findOne(matchQuery);
    
    if (!session && interests.length > 0) {
      matchQuery = { status: 'waiting', mode, 'users.userId': { $ne: userId } };
      session = await AnonymousSession.findOne(matchQuery);
    }
    
    if (session) {
      const partnerInterests = session.users[0].interests || [];
      const commonInterests = interests.filter(x => partnerInterests.includes(x));
      
      session.users.push({ userId, tempName: 'Stranger 2', interests });
      session.commonInterests = commonInterests;
      session.status = 'active';
      session.startedAt = new Date();
      session.webrtcReady = true; // Unlock WebRTC once matched
      
      if (mode === 'micro_dating') session.expiresAt = new Date(Date.now() + 180000); 
      
      await session.save();
      return res.json({ status: 'success', data: session });
    } else {
      session = new AnonymousSession({
        mode,
        users: [{ userId, tempName: 'Stranger 1', interests }],
        status: 'waiting'
      });
      await session.save();
      return res.json({ status: 'queued', data: session });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AnonymousSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ status: 'success', data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send message with Auto-Translate & AI NSFW Mock
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, userId, message, targetLang, hasImage } = req.body;
    
    const session = await AnonymousSession.findById(sessionId);
    if (!session || session.status !== 'active') {
      return res.status(400).json({ error: 'Chat is not active' });
    }
    
    const isParticipant = session.users.some(u => u.userId === userId);
    if (!isParticipant) return res.status(403).json({ error: 'Unauthorized' });
    
    // Feature: Auto Language Translator & AI NSFW Check (Mocked logic for Super App)
    let isBlurred = false;
    let translatedText = new Map();
    
    // Simulate AI check
    if (hasImage && (message.includes('explicit') || message.includes('nsfw'))) {
      isBlurred = true;
    }
    
    if (targetLang) {
      // Mock translator logic via AI service
      translatedText.set(targetLang, `${message} (Translated to ${targetLang})`);
    }
    
    session.chatHistory.push({ senderId: userId, message, isBlurred, translatedText });
    await session.save();
    
    res.json({ status: 'success', data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Feature: Interactive Icebreaker
export const triggerIcebreaker = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await AnonymousSession.findById(sessionId);
    
    const questions = [
      "What's the craziest thing you've ever done?",
      "If you could have any superpower, what would it be?",
      "What was your most embarrassing moment?",
      "What is your biggest fear?"
    ];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];
    
    session.chatHistory.push({
      senderId: 'SYSTEM',
      message: `🧊 Icebreaker: ${randomQ}`,
      isIcebreaker: true
    });
    
    await session.save();
    res.json({ status: 'success', data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Feature: Mini Games (Start Tic-Tac-Toe)
export const startMiniGame = async (req, res) => {
  try {
    const { sessionId, gameType } = req.body;
    const session = await AnonymousSession.findById(sessionId);
    
    if (gameType === 'tictactoe') {
      session.activeGame = {
        type: 'tictactoe',
        state: { board: Array(9).fill(null), winner: null },
        turn: session.users[0].userId
      };
      
      session.chatHistory.push({
        senderId: 'SYSTEM',
        message: `🎮 A game of Tic-Tac-Toe has started!`,
        isIcebreaker: false
      });
    }
    
    await session.save();
    res.json({ status: 'success', data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Feature: Reveal Identity / Add Friend
export const revealIdentity = async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    const session = await AnonymousSession.findById(sessionId);
    
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const userIndex = session.users.findIndex(u => u.userId === userId);
    if (userIndex !== -1) {
      session.users[userIndex].wantsToReveal = true;
    }
    
    // Check if both want to reveal
    const bothWantReveal = session.users.length === 2 && session.users.every(u => u.wantsToReveal);
    
    if (bothWantReveal) {
      session.chatHistory.push({
        senderId: 'SYSTEM',
        message: '🎉 Both of you requested to reveal! You are now friends.',
        isIcebreaker: false
      });
      // In a real flow, this would trigger an Axios call to social-service/user-service to add as friend
    } else {
      session.chatHistory.push({
        senderId: 'SYSTEM',
        message: `👀 ${session.users[userIndex].tempName} requested to reveal identities!`,
        isIcebreaker: false
      });
    }
    
    await session.save();
    res.json({ status: 'success', bothRevealed: bothWantReveal, session });
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
    res.json({ status: 'success', message: 'Chat disconnected. Stranger left.', data: session });
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

    const bothDecided = session.users.every(u => u.liked !== null);
    let mutualLike = false;

    if (bothDecided) {
      session.status = 'finished';
      mutualLike = session.users.every(u => u.liked === true);
      await session.save();
    }

    res.json({ status: 'success', data: { session, bothDecided, mutualLike } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { 
  requestMatch, checkSessionStatus, sendMessage, skipSession, 
  submitMicroDatingChoice, revealIdentity, triggerIcebreaker, startMiniGame 
};
