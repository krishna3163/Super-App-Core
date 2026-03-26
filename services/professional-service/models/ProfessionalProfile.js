import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  headline: { type: String },
  summary: { type: String },
  skills: [String],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String,
  }],
  education: [{
    school: String,
    degree: String,
    year: String,
  }],
}, { timestamps: true });

export default mongoose.model('ProfessionalProfile', profileSchema);
