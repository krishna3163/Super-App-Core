import Channel from '../models/Channel.js';

const createChannel = async (req, res) => {
  try {
    const { serverId, name, type, permissions } = req.body;
    const channel = new Channel({ serverId, name, type, permissions });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getChannels = async (req, res) => {
  try {
    const { serverId } = req.params;
    const channels = await Channel.find({ serverId });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createChannel, getChannels };
