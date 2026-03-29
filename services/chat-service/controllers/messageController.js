import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

const sendMessage = async (req, res) => {
  const { content, chatId, senderId, messageType, type, replyTo, replyToId } = req.body;
  if (!content || !chatId) return res.sendStatus(400);

  const newMessage = {
    sender: senderId,
    content: content,
    chat: chatId,
    messageType: messageType || type || 'text',
    replyTo: replyTo || replyToId || null,
  };

  try {
    let message = await Message.create(newMessage);
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender')
      .populate('chat')
      .populate('replyTo');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const reactToMessage = async (req, res) => {
  const { messageId, userId, emoji } = req.body;
  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { reactions: { user: userId, emoji } } },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default { sendMessage, allMessages, reactToMessage };
