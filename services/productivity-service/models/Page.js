import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'header', 'checkbox', 'image', 'file'], default: 'text' },
  content: { type: String, default: '' },
  properties: {
    checked: { type: Boolean },
    url: { type: String },
    caption: { type: String }
  }
});

const pageSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  title: { type: String, default: 'Untitled' },
  icon: { type: String },
  cover: { type: String },
  blocks: [blockSchema],
  parentPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);
