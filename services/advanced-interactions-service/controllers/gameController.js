import ChatGame from '../models/ChatGame.js';

export const startGame = async (req, res) => {
  try {
    const { chatId, gameType, players } = req.body;
    
    // Initialize specific game states based on type
    let initialGameState = {};
    if (gameType === 'truth_or_dare') {
      initialGameState = { currentTurn: players[0] };
    } else if (gameType === 'werewolf') {
      initialGameState = { phase: 'night', rolesAssigned: false };
    }

    const game = new ChatGame({
      chatId,
      gameType,
      players,
      status: 'active',
      gameState: initialGameState
    });

    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGameState = async (req, res) => {
  try {
    const { gameId, newState } = req.body;
    const game = await ChatGame.findByIdAndUpdate(
      gameId,
      { $set: { gameState: newState } },
      { new: true }
    );
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const endGame = async (req, res) => {
  try {
    const { gameId, winnerId } = req.body;
    const game = await ChatGame.findByIdAndUpdate(
      gameId,
      { status: 'finished', winnerId },
      { new: true }
    );
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
