import mongoose from 'mongoose';

const funnelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true },
  steps: [{
    name: { type: String, required: true },
    eventType: { type: String, required: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    order: { type: Number }
  }],
  isActive: { type: Boolean, default: true },
  results: [{
    date: { type: String }, // YYYY-MM-DD
    stepResults: [{
      step: { type: Number },
      entered: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      dropOff: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 }
    }],
    overallConversion: { type: Number, default: 0 }
  }]
}, { timestamps: true });

export default mongoose.model('Funnel', funnelSchema);
