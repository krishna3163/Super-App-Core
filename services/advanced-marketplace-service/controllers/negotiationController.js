import NegotiationChat from '../models/NegotiationChat.js';

const startNegotiation = async (req, res) => {
  try {
    const { listingId, buyerId, sellerId } = req.body;
    let chat = await NegotiationChat.findOne({ listingId, participants: { $all: [buyerId, sellerId] } });
    
    if (!chat) {
      chat = new NegotiationChat({ listingId, participants: [buyerId, sellerId], messages: [] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, text, offerAmount } = req.body;
    const chat = await NegotiationChat.findByIdAndUpdate(
      chatId,
      { $push: { messages: { senderId, text, offerAmount } } },
      { new: true }
    );
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNegotiations = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await NegotiationChat.find({ participants: userId }).populate('listingId');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { startNegotiation, sendMessage, getNegotiations };
