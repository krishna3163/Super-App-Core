import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantId: { type: String, required: true },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  status: { type: String, enum: ['applied', 'interview', 'rejected', 'hired'], default: 'applied' },
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);
