import GigRequest from '../models/GigRequest.js';
import Proposal from '../models/Proposal.js';

// Post a gig request (buyer side)
export const postGigRequest = async (req, res) => {
  try {
    const request = new GigRequest(req.body);
    await request.save();
    res.status(201).json({ status: 'success', data: request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all open gig requests
export const getOpenRequests = async (req, res) => {
  try {
    const { category, minBudget, maxBudget, page = 1, limit = 20 } = req.query;
    const filter = { status: 'open' };
    if (category) filter.category = category;
    if (minBudget) filter['budget.min'] = { $gte: parseInt(minBudget) };
    if (maxBudget) filter['budget.max'] = { $lte: parseInt(maxBudget) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [requests, total] = await Promise.all([
      GigRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      GigRequest.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: requests, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get client's requests
export const getClientRequests = async (req, res) => {
  try {
    const requests = await GigRequest.find({ clientId: req.params.clientId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit proposal
export const submitProposal = async (req, res) => {
  try {
    const { gigRequestId, providerId, providerName, clientId, coverLetter, proposedPrice, deliveryDays, attachments } = req.body;
    
    const existing = await Proposal.findOne({ gigRequestId, providerId });
    if (existing) return res.status(400).json({ error: 'Already submitted a proposal' });

    const proposal = new Proposal({ gigRequestId, providerId, providerName, clientId, coverLetter, proposedPrice, deliveryDays, attachments });
    await proposal.save();

    await GigRequest.findByIdAndUpdate(gigRequestId, { $inc: { proposalCount: 1 } });

    res.status(201).json({ status: 'success', data: proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get proposals for a request
export const getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ gigRequestId: req.params.requestId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: proposals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept proposal
export const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(req.params.proposalId, { status: 'accepted' }, { new: true });
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    // Close the request, reject other proposals
    await Promise.all([
      GigRequest.findByIdAndUpdate(proposal.gigRequestId, { status: 'in_progress', selectedProviderId: proposal.providerId }),
      Proposal.updateMany({ gigRequestId: proposal.gigRequestId, _id: { $ne: proposal._id } }, { status: 'rejected' })
    ]);

    res.json({ status: 'success', data: proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get provider's proposals
export const getProviderProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ providerId: req.params.providerId }).populate('gigRequestId').sort({ createdAt: -1 });
    res.json({ status: 'success', data: proposals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
