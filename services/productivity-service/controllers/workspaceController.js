import Workspace from '../models/Workspace.js';
import Page from '../models/Page.js';
import Form from '../models/Form.js';

const createWorkspace = async (req, res) => {
  try {
    const { name, userId } = req.body;
    const workspace = new Workspace({ name, ownerId: userId, members: [{ userId, role: 'admin' }] });
    await workspace.save();

    // Create a default first page
    const firstPage = new Page({ workspaceId: workspace._id, title: 'Get Started' });
    await firstPage.save();

    res.status(201).json({ workspace, firstPage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const { userId } = req.params;
    const workspaces = await Workspace.find({ 'members.userId': userId });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { workspaceId, userId, role } = req.body;
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $addToSet: { members: { userId, role: role || 'viewer' } } },
      { new: true }
    );
    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createForm = async (req, res) => {
  try {
    const { creatorId, title, description, fields } = req.body;
    const form = new Form({ creatorId, title, description, fields });
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserForms = async (req, res) => {
  try {
    const forms = await Form.find({ creatorId: req.params.userId });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitResponse = async (req, res) => {
  try {
    const { responses } = req.body;
    const formId = req.params.id;
    await Form.findByIdAndUpdate(formId, { $inc: { responsesCount: 1 } });
    res.json({ success: true, message: 'Response submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createWorkspace, getWorkspaces, addMember, createForm, getUserForms, getFormById, submitResponse };

