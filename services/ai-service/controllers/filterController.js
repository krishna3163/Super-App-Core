export const getArFilters = async (req, res) => {
  try {
    const filters = [
      { id: 'f1', name: 'Puppy Face', category: 'fun', url: 'https://cdn.superapp.com/filters/puppy.dat' },
      { id: 'f2', name: 'Cyberpunk Neon', category: 'aesthetic', url: 'https://cdn.superapp.com/filters/cyber.dat' },
      { id: 'f3', name: 'Beauty Smooth', category: 'beauty', url: 'https://cdn.superapp.com/filters/beauty.dat' },
      { id: 'f4', name: 'Face Swap', category: 'interactive', url: 'https://cdn.superapp.com/filters/swap.dat' },
      { id: 'f5', name: 'Demon Horns', category: 'halloween', url: 'https://cdn.superapp.com/filters/demon.dat' },
      { id: 'f6', name: 'Glitch Core', category: 'aesthetic', url: 'https://cdn.superapp.com/filters/glitch.dat' }
    ];

    res.json({ status: 'success', data: filters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const applyFilterMock = async (req, res) => {
  try {
    const { videoData, filterId } = req.body;
    // In production, an AI C++ OpenCV service would process the WebRTC stream or uploaded video buffer.
    res.json({ status: 'success', message: 'Filter applied successfully', processedVideoUrl: 'https://cdn.superapp.com/videos/mock_processed.mp4' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getArFilters, applyFilterMock };
