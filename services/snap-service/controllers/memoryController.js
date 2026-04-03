import Memory from '../models/Memory.js';
import { AppError } from '../utils/errors.js';

// Server-side stores ENCRYPTED data. Encryption/Decryption happens on client.
export const saveMemory = async (req, res, next) => {
  try {
    const { userId, encryptedBlob, iv, tag, title, tags, locationMeta } = req.body;
    
    if (!userId || !encryptedBlob || !iv) {
      return next(new AppError('Missing required encrypted fields', 400));
    }

    const memory = new Memory({
      userId,
      encryptedBlob,
      iv,
      tag,
      title,
      tags,
      locationMeta
    });

    await memory.save();

    res.status(201).json({ 
      status: 'success', 
      memoryId: memory._id, 
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};

export const getMemories = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const memories = await Memory.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ 
      status: 'success', 
      results: memories.length, 
      memories, 
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMemory = async (req, res, next) => {
  try {
    const { memoryId } = req.params;
    const { userId } = req.body; // In production, get from req.user

    const memory = await Memory.findOneAndDelete({ _id: memoryId, userId });
    
    if (!memory) return next(new AppError('Memory not found or unauthorized', 404));

    res.status(200).json({ 
      status: 'success', 
      message: 'Memory deleted', 
      correlationId: req.correlationId 
    });
  } catch (err) {
    next(err);
  }
};
