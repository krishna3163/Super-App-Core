import TableBooking from '../models/TableBooking.js';

export const createTableBooking = async (req, res) => {
  try {
    const booking = new TableBooking(req.body);
    await booking.save();
    res.status(201).json({ status: 'success', data: booking });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getMyTableBookings = async (req, res) => {
  try {
    const bookings = await TableBooking.find({ userId: req.params.userId }).populate('restaurantId');
    res.json({ status: 'success', data: bookings });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getRestaurantTableBookings = async (req, res) => {
  try {
    const bookings = await TableBooking.find({ restaurantId: req.params.restaurantId });
    res.json({ status: 'success', data: bookings });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateTableBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TableBooking.findByIdAndUpdate(req.params.bookingId, { status }, { new: true });
    res.json({ status: 'success', data: booking });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
