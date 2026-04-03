import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  creatorId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fields: [{
    label: String,
    type: { type: String, enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'date'], default: 'text' },
    options: [String], // for radio, checkbox, select
    required: { type: Boolean, default: false },
    logic: {
      action: { type: String, enum: ['show', 'hide', 'jump'], default: 'show' },
      condition: String, // e.g., "value === 'Yes'"
      target: String, // field ID or section ID to jump to
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: true },
    collectEmails: { type: Boolean, default: false },
    limitOneResponse: { type: Boolean, default: false },
  },
  responsesCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Form', formSchema);
