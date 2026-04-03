import BusinessProfile from '../models/BusinessProfile.js';
import BusinessCatalog from '../models/BusinessCatalog.js';

export const createOrUpdateBusiness = async (req, res) => {
  try {
    const { userId, businessName, description, logo, category, address, workingHours } = req.body;
    
    let business = await BusinessProfile.findOne({ userId });
    
    if (business) {
      business = await BusinessProfile.findOneAndUpdate(
        { userId },
        { businessName, description, logo, category, address, workingHours },
        { new: true }
      );
    } else {
      business = new BusinessProfile({ userId, businessName, description, logo, category, address, workingHours });
      await business.save();
    }
    
    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBusinessProfile = async (req, res) => {
  try {
    const { id } = req.params; // Can be userId or businessId
    let business = await BusinessProfile.findOne({ userId: id });
    if (!business) business = await BusinessProfile.findById(id);
    
    if (!business) return res.status(404).json({ error: 'Business profile not found' });
    
    const catalog = await BusinessCatalog.find({ businessId: business._id });
    res.json({ business, catalog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToCatalog = async (req, res) => {
  try {
    const { businessId, name, description, price, images, inStock } = req.body;
    const catalogItem = new BusinessCatalog({ businessId, name, description, price, images, inStock });
    await catalogItem.save();
    res.status(201).json(catalogItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
