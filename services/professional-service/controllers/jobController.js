import Job from '../models/Job.js';
import Application from '../models/Application.js';

const postJob = async (req, res) => {
  try {
    const { posterId, title, company, description, location, salaryRange, tags } = req.body;
    const job = new Job({ posterId, title, company, description, location, salaryRange, tags });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const applyToJob = async (req, res) => {
  try {
    const { jobId, applicantId, resumeUrl, coverLetter } = req.body;
    const existing = await Application.findOne({ jobId, applicantId });
    if (existing) return res.status(400).json({ error: 'Already applied' });

    const application = new Application({ jobId, applicantId, resumeUrl, coverLetter });
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { postJob, applyToJob, getJobs, getApplications };
