import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

const createBooking = async (req, res) => {
  try {
    const { userId, hotelId, hotelOwnerId, roomId, roomType, checkIn, checkOut, guestName, phone, guests, paymentMethod, totalPrice } = req.body;
    const room = await Room.findById(roomId).catch(() => null);
    if (room && room.availableRooms <= 0) return res.status(400).json({ error: 'Room not available' });

    const booking = new Booking({ userId, hotelId, hotelOwnerId, roomId, roomType, checkIn, checkOut, guestName, phone, guests: guests || 2, paymentMethod, totalPrice });
    await booking.save();
    if (room) await Room.findByIdAndUpdate(roomId, { $inc: { availableRooms: -1 } });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User: get own bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).populate('hotelId').populate('roomId').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vendor: get all bookings for their hotel
const getHotelBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ hotelId: req.params.hotelId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.bookingId, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    // Free up room if cancelled
    if (status === 'cancelled') await Room.findByIdAndUpdate(booking.roomId, { $inc: { availableRooms: 1 } });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.bookingId, { status: 'cancelled' }, { new: true });
    if (booking) await Room.findByIdAndUpdate(booking.roomId, { $inc: { availableRooms: 1 } });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendBookingChat = async (req, res) => {
  try {
    const { senderId, senderName, message } = req.body;
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.bookingChat.push({ senderId, senderName, message });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createBooking, getMyBookings, getHotelBookings, updateBookingStatus, cancelBooking, sendBookingChat };
