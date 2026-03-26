import axios from 'axios';

const getUnifiedProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const authHeader = req.headers['authorization'];
    const headers = { Authorization: authHeader };

    const [userRes, socialRes, profRes, datingRes, discordRes, facebookRes, walletRes] = await Promise.allSettled([
      axios.get(`${process.env.USER_SERVICE_URL}/profile/${userId}`, { headers }),
      axios.post(`${process.env.SOCIAL_SERVICE_URL}/feed`, { followingIds: [userId] }, { headers }),
      axios.get(`${process.env.PROFESSIONAL_SERVICE_URL}/profile/${userId}`, { headers }),
      axios.get(`${process.env.DATING_SERVICE_URL}/matches/${userId}`, { headers }),
      axios.get(`http://localhost:5016/servers/${userId}`, { headers }), // Discord
      axios.get(`http://localhost:5017/timeline/${userId}`, { headers }), // Facebook
      axios.get(`http://localhost:5026/wallet/${userId}`, { headers }), // Monetization
    ]);

    res.json({
      user: userRes.status === 'fulfilled' ? userRes.value.data : null,
      social: socialRes.status === 'fulfilled' ? { postsCount: socialRes.value.data.length } : null,
      professional: profRes.status === 'fulfilled' ? profRes.value.data : null,
      dating: datingRes.status === 'fulfilled' ? { matchesCount: datingRes.value.data.length } : null,
      discord: discordRes.status === 'fulfilled' ? { serversCount: discordRes.value.data.length } : null,
      facebook: facebookRes.status === 'fulfilled' ? { timelinePosts: facebookRes.value.data.length } : null,
      wallet: walletRes.status === 'fulfilled' ? walletRes.value.data : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const authHeader = req.headers['authorization'];
    const headers = { Authorization: authHeader };

    const [posts, products, jobs, communities] = await Promise.allSettled([
      axios.get(`${process.env.SOCIAL_SERVICE_URL}/explore?hashtag=${q}`, { headers }),
      axios.get(`${process.env.MARKETPLACE_SERVICE_URL}/products?search=${q}`, { headers }),
      axios.get(`${process.env.PROFESSIONAL_SERVICE_URL}/jobs`, { headers }), // Jobs service currently lacks full-text, but we fetch all
      axios.get(`${process.env.COMMUNITY_SERVICE_URL}/`, { headers }),
    ]);

    res.json({
      social: posts.status === 'fulfilled' ? posts.value.data : [],
      marketplace: products.status === 'fulfilled' ? products.value.data : [],
      professional: jobs.status === 'fulfilled' ? jobs.value.data.filter(j => j.title.includes(q)) : [],
      community: communities.status === 'fulfilled' ? communities.value.data.filter(c => c.name.includes(q)) : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getUnifiedProfile, globalSearch };
