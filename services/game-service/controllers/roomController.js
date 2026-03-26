import Room from '../models/Room.js';

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const createRoom = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const roomCode = generateRoomCode();
    
    const room = new Room({
      roomCode,
      players: [{ userId, name, score: 0 }],
      status: 'waiting'
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomCode, userId, name } = req.body;
    const room = await Room.findOne({ roomCode });
    
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.players.length >= room.maxPlayers) return res.status(400).json({ error: 'Room is full' });
    if (room.status !== 'waiting') return res.status(400).json({ error: 'Game already started' });

    room.players.push({ userId, name });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomCode: req.params.roomCode });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createRoom, joinRoom, getRoom };
