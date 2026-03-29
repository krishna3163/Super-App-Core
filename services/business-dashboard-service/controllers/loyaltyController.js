import LoyaltyProgram from '../models/LoyaltyProgram.js';

export const setupLoyaltyProgram = async (req, res) => {
  try {
    const { businessId, programName, pointsPerDollar, tiers } = req.body;
    
    const program = await LoyaltyProgram.findOneAndUpdate(
      { businessId },
      { programName, pointsPerDollar, tiers },
      { new: true, upsert: true }
    );
    
    res.status(201).json({ status: 'success', data: program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addPointsToCustomer = async (req, res) => {
  try {
    const { businessId, userId, amountSpent } = req.body;
    
    let program = await LoyaltyProgram.findOne({ businessId });
    if (!program) return res.status(404).json({ error: 'Loyalty program not found for this business' });

    const pointsEarned = Math.floor(amountSpent * program.pointsPerDollar);
    
    const customerIndex = program.customers.findIndex(c => c.userId === userId);
    
    if (customerIndex !== -1) {
      program.customers[customerIndex].points += pointsEarned;
      // Recalculate tier (checking highest pointsRequired they satisfy)
      const eligibleTiers = program.tiers.filter(t => program.customers[customerIndex].points >= t.pointsRequired);
      if (eligibleTiers.length > 0) {
        program.customers[customerIndex].currentTier = eligibleTiers[eligibleTiers.length - 1].name;
      }
    } else {
      // New loyalty member
      let initialTier = program.tiers.length > 0 ? program.tiers[0].name : 'Base';
      program.customers.push({
        userId,
        points: pointsEarned,
        currentTier: initialTier
      });
    }

    await program.save();
    res.json({ status: 'success', message: `${pointsEarned} points added!`, data: program });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { setupLoyaltyProgram, addPointsToCustomer };
