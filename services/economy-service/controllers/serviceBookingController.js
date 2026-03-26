import ServiceBooking from '../models/ServiceBooking.js';
import axios from 'axios';

export const createBooking = async (req, res) => {
  try {
    const { customerId, providerId, description, date, agreedPrice } = req.body;

    // Phase E6: Chat Integration
    // When a booking is made, automatically create a chat room between customer and provider for negotiation
    const provider = await axios.get(`http://localhost:5030/service-providers/${providerId}`).then(r => r.data).catch(() => null);
    
    let chatId = null;
    if (provider) {
      // Internal call to chat service to create a chat room (Simulated integration)
      // const chatRes = await axios.post('http://localhost:5003/chats', { userId: customerId, targetUserId: provider.userId });
      // chatId = chatRes.data._id;
      chatId = `chat_${customerId}_${provider.userId}`; // Mock Chat ID
    }

    const booking = new ServiceBooking({ customerId, providerId, description, date, agreedPrice, chatId });
    await booking.save();

    // Phase E9: Notification System
    // Trigger notification to provider
    // await axios.post('http://localhost:5013/notifications', { userId: provider.userId, type: 'service', title: 'New Service Request', message: description });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await ServiceBooking.findByIdAndUpdate(bookingId, { status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    // Find bookings where user is either customer or provider
    const bookings = await ServiceBooking.find({ customerId: userId }).populate('providerId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
