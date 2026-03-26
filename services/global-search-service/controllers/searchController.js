import axios from 'axios';

const globalSearch = async (req, res) => {
  try {
    const { q, category } = req.query;
    const authHeader = req.headers['authorization'];
    const headers = { Authorization: authHeader };

    const searchTasks = [];

    if (!category || category === 'users') {
      searchTasks.push(axios.get(`${process.env.USER_SERVICE_URL}/profile/${q}`, { headers }).catch(() => null));
    }
    if (!category || category === 'posts') {
      searchTasks.push(axios.get(`${process.env.SOCIAL_SERVICE_URL}/explore?hashtag=${q}`, { headers }).catch(() => null));
    }
    if (!category || category === 'marketplace') {
      searchTasks.push(axios.get(`${process.env.ADVANCED_MARKETPLACE_SERVICE_URL}/listings?search=${q}`, { headers }).catch(() => null));
    }
    if (!category || category === 'hotels') {
      searchTasks.push(axios.get(`${process.env.HOTEL_SERVICE_URL}/search?q=${q}`, { headers }).catch(() => null));
    }
    if (!category || category === 'jobs') {
      searchTasks.push(axios.get(`${process.env.PROFESSIONAL_SERVICE_URL}/jobs?q=${q}`, { headers }).catch(() => null));
    }

    const results = await Promise.all(searchTasks);

    res.json({
      users: results[0] ? results[0].data : [],
      posts: results[1] ? results[1].data : [],
      marketplace: results[2] ? results[2].data : [],
      hotels: results[3] ? results[3].data : [],
      jobs: results[4] ? results[4].data : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTrending = async (req, res) => {
  try {
    const headers = { Authorization: req.headers['authorization'] };
    const socialRes = await axios.get(`${process.env.SOCIAL_SERVICE_URL}/explore`, { headers });
    res.json(socialRes.data.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { globalSearch, getTrending };
