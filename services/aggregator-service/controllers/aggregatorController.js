import axios from 'axios';

const getUnifiedProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const authHeader = req.headers['authorization'] || '';
    const headers = { Authorization: authHeader };

    const [userRes, socialRes, profRes, datingRes, discordRes, facebookRes, walletRes] = await Promise.allSettled([
      axios.get(`${process.env.USER_SERVICE_URL}/profile/${userId}`, { headers }).catch(() => null),
      axios.post(`${process.env.SOCIAL_SERVICE_URL}/feed`, { followingIds: [userId] }, { headers }).catch(() => null),
      axios.get(`${process.env.PROFESSIONAL_SERVICE_URL}/profile/${userId}`, { headers }).catch(() => null),
      axios.get(`${process.env.DATING_SERVICE_URL}/matches/${userId}`, { headers }).catch(() => null),
      axios.get(`http://localhost:5016/servers/${userId}`, { headers }).catch(() => null), 
      axios.get(`http://localhost:5017/timeline/${userId}`, { headers }).catch(() => null), 
      axios.get(`http://localhost:5026/wallet/${userId}`, { headers }).catch(() => null), 
    ]);

    res.json({
      status: 'success',
      data: {
        user: userRes.status === 'fulfilled' && userRes.value ? userRes.value.data : null,
        social: socialRes.status === 'fulfilled' && socialRes.value ? { postsCount: socialRes.value.data.data?.length || 0 } : null,
        professional: profRes.status === 'fulfilled' && profRes.value ? profRes.value.data : null,
        dating: datingRes.status === 'fulfilled' && datingRes.value ? { matchesCount: datingRes.value.data.data?.length || 0 } : null,
        discord: discordRes.status === 'fulfilled' && discordRes.value ? { serversCount: discordRes.value.data.data?.length || 0 } : null,
        facebook: facebookRes.status === 'fulfilled' && facebookRes.value ? { timelinePosts: facebookRes.value.data.data?.length || 0 } : null,
        wallet: walletRes.status === 'fulfilled' && walletRes.value ? walletRes.value.data : null,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const authHeader = req.headers['authorization'] || '';
    const headers = { Authorization: authHeader };

    const [posts, products] = await Promise.allSettled([
      axios.get(`${process.env.SOCIAL_SERVICE_URL}/explore?hashtag=${q}`, { headers }).catch(() => null),
      axios.get(`${process.env.MARKETPLACE_SERVICE_URL}/products?search=${q}`, { headers }).catch(() => null),
    ]);

    res.json({
      status: 'success',
      data: {
        social: posts.status === 'fulfilled' && posts.value ? posts.value.data.data : [],
        marketplace: products.status === 'fulfilled' && products.value ? products.value.data.data : [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modular Home Dashboard Endpoint
// Frontend sends a list of requested modules based on user preferences.
const getHomeDashboard = async (req, res) => {
  try {
    const { userId, modules = ['feed', 'friend_suggestions', 'trending_tags'] } = req.body;
    const authHeader = req.headers['authorization'] || '';
    const headers = { Authorization: authHeader };
    
    const dashboardData = {};
    
    const promises = [];
    
    if (modules.includes('feed')) {
      promises.push(
        axios.post(`${process.env.SOCIAL_SERVICE_URL}/feed`, { followingIds: [] }, { headers })
          .then(res => { dashboardData.feed = res.data.data; })
          .catch(() => { dashboardData.feed = []; })
      );
    }
    
    if (modules.includes('reddit_feed')) {
      promises.push(
        axios.post(`${process.env.SOCIAL_SERVICE_URL}/feed`, { filterType: 'reddit', sort: 'hot' }, { headers })
          .then(res => { dashboardData.reddit_feed = res.data.data; })
          .catch(() => { dashboardData.reddit_feed = []; })
      );
    }
    
    if (modules.includes('friend_suggestions')) {
      promises.push(
        axios.get(`${process.env.USER_SERVICE_URL}/suggestions/${userId || 'public'}`, { headers })
          .then(res => { dashboardData.friend_suggestions = res.data; })
          .catch(() => { 
            // Fallback mock suggestions for demo
            dashboardData.friend_suggestions = [
              { name: 'Alice Smith', avatar: '', commonFriends: 3 },
              { name: 'Bob Jones', avatar: '', commonFriends: 1 }
            ]; 
          })
      );
    }
    
    if (modules.includes('trending_tags')) {
      // Mocked trending tags logic (usually computed by analytics/social service)
      dashboardData.trending_tags = ['#tech', '#superapp', '#nature', '#gaming', '#music'];
    }
    
    if (modules.includes('todo')) {
      promises.push(
        axios.get(`${process.env.PRODUCTIVITY_SERVICE_URL}/workspace/${userId}`, { headers })
          .then(res => { dashboardData.todo = res.data.recentTodos || []; })
          .catch(() => { dashboardData.todo = [{ title: 'Try out new Reddit feed', isCompleted: false }]; })
      );
    }

    if (modules.includes('marketplace_deals')) {
      promises.push(
        axios.get(`${process.env.MARKETPLACE_SERVICE_URL}/listings?sort=cheap`, { headers })
          .then(res => { dashboardData.marketplace_deals = res.data.slice(0, 5); })
          .catch(() => { dashboardData.marketplace_deals = []; })
      );
    }

    await Promise.allSettled(promises);

    res.json({
      status: 'success',
      message: 'Modular dashboard loaded',
      data: dashboardData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getUnifiedProfile, globalSearch, getHomeDashboard };
