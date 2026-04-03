import Page from '../models/Page.js';

const createPage = async (req, res) => {
  try {
    const { workspaceId, title, parentPageId } = req.body;
    const page = new Page({ workspaceId, title, parentPageId });
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { title, icon, cover, blocks, isPublic } = req.body;
    
    const page = await Page.findByIdAndUpdate(
      pageId,
      { title, icon, cover, blocks, isPublic },
      { new: true }
    );
    
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWorkspacePages = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const pages = await Page.find({ workspaceId }).select('title icon parentPageId');
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createPage, updatePage, getPage, getWorkspacePages };
