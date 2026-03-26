import Group from '../models/Group.js';
import Channel from '../models/Channel.js';
import SuperChat from '../models/SuperChat.js';
import SuperMessage from '../models/SuperMessage.js';

export const getGroupInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ chatId: id });
    const chat = await SuperChat.findById(id);
    
    if (!group || !chat) return res.status(404).json({ error: 'Group not found' });

    // Fetch media messages for the media section
    const mediaMessages = await SuperMessage.find({ 
      chatId: id, 
      'attachments.0': { $exists: true } 
    }).sort({ createdAt: -1 }).limit(20);

    const media = mediaMessages.map(m => m.attachments).flat();

    res.json({
      groupDetails: group,
      chatDetails: chat,
      memberCount: chat.participants.length,
      media
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChannelInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findById(id);
    
    if (!channel) return res.status(404).json({ error: 'Channel not found' });

    res.json({
      channelDetails: channel,
      subscriberCount: channel.subscribers.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
