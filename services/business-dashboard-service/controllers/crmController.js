import Booking from '../models/Booking.js';
import Employee from '../models/Employee.js';
import AiBotContext from '../models/AiBotContext.js';

// CRM Booking System
export const createBooking = async (req, res) => {
  try {
    const { businessId, customerId, serviceName, employeeId, startTime, endTime, price } = req.body;
    const booking = new Booking({ businessId, customerId, serviceName, employeeId, startTime, endTime, price });
    await booking.save();
    res.status(201).json({ status: 'success', data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBusinessBookings = async (req, res) => {
  try {
    const { businessId } = req.params;
    const bookings = await Booking.find({ businessId }).sort({ startTime: 1 }).populate('employeeId');
    res.json({ status: 'success', data: bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Employee / Staff Roster
export const addEmployee = async (req, res) => {
  try {
    const { businessId, userId, role, shiftStart, shiftEnd, salaryType, salaryAmount } = req.body;
    const employee = new Employee({ 
      businessId, userId, role, shiftStart, shiftEnd, 
      salaryConfig: { type: salaryType, amount: salaryAmount } 
    });
    await employee.save();
    res.status(201).json({ status: 'success', data: employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBusinessStaff = async (req, res) => {
  try {
    const { businessId } = req.params;
    const staff = await Employee.find({ businessId });
    res.json({ status: 'success', data: staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Auto AI Customer Support Bot Config
export const updateAiBotConfig = async (req, res) => {
  try {
    const { businessId, isActive, knowledgeBase, tone, autoReplyEnabled } = req.body;
    const config = await AiBotContext.findOneAndUpdate(
      { businessId },
      { isActive, knowledgeBase, tone, autoReplyEnabled },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const simulateAiReply = async (req, res) => {
  try {
    const { businessId, customerMessage } = req.body;
    const config = await AiBotContext.findOne({ businessId });
    
    if (!config || !config.isActive) {
      return res.status(400).json({ status: 'fail', message: 'AI Bot is offline' });
    }

    // In a real scenario, we send customerMessage + config.knowledgeBase to ai-service (OpenAI mock).
    const botReply = `🤖 (Auto Reply): Hello! Based on our rules: "${config.knowledgeBase}". How can I help you further with "${customerMessage}"?`;
    
    res.json({ status: 'success', reply: botReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createBooking, getBusinessBookings, addEmployee, getBusinessStaff, updateAiBotConfig, simulateAiReply };
