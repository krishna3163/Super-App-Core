import ProfessionalProfile from '../models/ProfessionalProfile.js';

const updateProfile = async (req, res) => {
  try {
    const { userId, headline, summary, skills, experience, education } = req.body;
    let profile = await ProfessionalProfile.findOne({ userId });
    if (!profile) {
      profile = new ProfessionalProfile({ userId, headline, summary, skills, experience, education });
    } else {
      profile.headline = headline || profile.headline;
      profile.summary = summary || profile.summary;
      profile.skills = skills || profile.skills;
      profile.experience = experience || profile.experience;
      profile.education = education || profile.education;
    }
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await ProfessionalProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { updateProfile, getProfile };
