import Payment from '../models/Payment.js';

export const initiatePayment = async (req, res) => {
  try {
    const { userId, targetId, targetType, amount } = req.body;
    
    // Simulate UPI QR generation
    const upiId = 'superapp@upi';
    const qrCodeUrl = `upi://pay?pa=${upiId}&pn=SuperApp&am=${amount}&cu=INR`; // Standard UPI string format

    const payment = new Payment({
      userId,
      targetId,
      targetType,
      amount,
      upiId,
      qrCodeUrl
    });
    
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentId, transactionRef } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'success', transactionRef },
      { new: true }
    );
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
