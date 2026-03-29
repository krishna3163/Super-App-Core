import Invoice from '../models/Invoice.js';
import crypto from 'crypto';

export const generateInvoice = async (req, res) => {
  try {
    const { businessId, customerId, transactionId, items, taxRate = 0.18 } = req.body;
    
    // Auto Calculate
    let subtotal = 0;
    items.forEach(i => {
      i.total = i.quantity * i.unitPrice;
      subtotal += i.total;
    });

    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const grandTotal = subtotal + taxAmount;
    
    // Enterprise ID generation
    const invoiceNumber = `INV-${businessId.substring(0,3).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Here we would use 'pdfkit' or 'puppeteer' to render an aesthetic PDF Invoice and upload to S3.
    // We mock that step and record the data.
    const pdfUrl = `https://cdn.superapp.com/invoices/${invoiceNumber}.pdf`;

    const invoice = new Invoice({
      businessId, customerId, transactionId, invoiceNumber, items, subtotal, taxRate, taxAmount, grandTotal,
      status: 'paid', pdfUrl, dueDate: new Date(Date.now() + 15 * 86400000) // 15 days net
    });

    await invoice.save();

    res.status(201).json({ status: 'success', data: invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBusinessInvoices = async (req, res) => {
    try {
        const { businessId } = req.params;
        const invoices = await Invoice.find({ businessId }).sort({ createdAt: -1 });
        res.json({ status: 'success', data: invoices });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default { generateInvoice, getBusinessInvoices };
