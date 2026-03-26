import UserProfileControl from '../models/UserProfileControl.js';

export const disableProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const control = await UserProfileControl.findOneAndUpdate(
      { userId },
      { isDisabled: true, disabledAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ message: 'Profile disabled successfully', control });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reactivateProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const control = await UserProfileControl.findOneAndUpdate(
      { userId },
      { isDisabled: false, disabledAt: null },
      { new: true }
    );
    res.json({ message: 'Profile reactivated successfully', control });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    // In a microservice architecture, this would typically publish an event 
    // to a message broker (e.g., Kafka/RabbitMQ) for all services to scrub user data.
    const control = await UserProfileControl.findOneAndUpdate(
      { userId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ message: 'Profile marked for permanent deletion', control });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
