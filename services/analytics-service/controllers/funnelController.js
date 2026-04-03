import Funnel from '../models/Funnel.js';
import Event from '../models/Event.js';

// Create a funnel
export const createFunnel = async (req, res) => {
  try {
    const { name, description, steps, createdBy } = req.body;
    const funnel = new Funnel({ name, description, steps, createdBy });
    await funnel.save();
    res.status(201).json({ status: 'success', data: funnel });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// List funnels
export const listFunnels = async (req, res) => {
  try {
    const funnels = await Funnel.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: funnels });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Analyze a funnel
export const analyzeFunnel = async (req, res) => {
  try {
    const { funnelId } = req.params;
    const { days = 7 } = req.query;
    
    const funnel = await Funnel.findById(funnelId);
    if (!funnel) return res.status(404).json({ status: 'fail', message: 'Funnel not found' });

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const stepResults = [];
    let previousUsers = null;

    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const filter = { eventType: step.eventType, timestamp: { $gte: since } };
      
      // Apply step-specific filters
      if (step.filters && Object.keys(step.filters).length > 0) {
        Object.entries(step.filters).forEach(([key, value]) => {
          filter[`properties.${key}`] = value;
        });
      }

      const users = await Event.distinct('userId', filter);
      
      let enteredUsers = users;
      if (previousUsers) {
        enteredUsers = users.filter(u => previousUsers.includes(u));
      }

      const entered = i === 0 ? users.length : previousUsers.length;
      const completed = enteredUsers.length;
      const dropOff = entered - completed;
      const conversionRate = entered > 0 ? ((completed / entered) * 100).toFixed(1) : 0;

      stepResults.push({
        step: i + 1,
        name: step.name,
        eventType: step.eventType,
        entered,
        completed,
        dropOff,
        conversionRate: parseFloat(conversionRate)
      });

      previousUsers = enteredUsers;
    }

    const overallConversion = stepResults.length > 0 && stepResults[0].entered > 0
      ? ((stepResults[stepResults.length - 1].completed / stepResults[0].entered) * 100).toFixed(1)
      : 0;

    res.json({ 
      status: 'success', 
      data: { 
        funnel: { name: funnel.name, id: funnel._id },
        stepResults,
        overallConversion: parseFloat(overallConversion),
        period: { days: parseInt(days) }
      } 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Delete funnel
export const deleteFunnel = async (req, res) => {
  try {
    await Funnel.findByIdAndUpdate(req.params.funnelId, { isActive: false });
    res.json({ status: 'success', message: 'Funnel deactivated' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
