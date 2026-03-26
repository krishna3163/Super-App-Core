import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  posterId: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String },
  salaryRange: { type: String },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], default: 'full-time' },
  experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'executive'], default: 'entry' },
  requirements: [String],
  benefits: [String],
  applicationDeadline: { type: Date },
  status: { type: String, enum: ['open', 'closed', 'paused'], default: 'open' },
  tags: [String],
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
