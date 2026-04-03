import axios from 'axios';

const getHomeScreen = async (req, res) => {
  try {
    const { userId } = req.params;
    const authHeader = req.headers['authorization'];
    const headers = { Authorization: authHeader };

    const [chatsRes, socialRes, appsRes, notifRes] = await Promise.allSettled([
      axios.get(`${process.env.CHAT_SERVICE_URL}/chats?userId=${userId}`, { headers }),
      axios.get(`${process.env.SOCIAL_SERVICE_URL}/explore`, { headers }),
      axios.get(`${process.env.ADVANCED_MINI_APP_SERVICE_URL}/pinned/${userId}`, { headers }),
      axios.get(`${process.env.NOTIFICATION_SERVICE_URL}/${userId}`, { headers }),
    ]);

    res.json({
      recentChats: chatsRes.status === 'fulfilled' ? chatsRes.value.data.slice(0, 5) : [],
      trendingPosts: socialRes.status === 'fulfilled' ? socialRes.value.data.slice(0, 10) : [],
      pinnedApps: appsRes.status === 'fulfilled' ? appsRes.value.data : [],
      notificationsPreview: notifRes.status === 'fulfilled' ? notifRes.value.data.slice(0, 3) : [],
      quickActions: [
        { label: 'Book Ride', route: '/rides' },
        { label: 'Order Food', route: '/food' },
        { label: 'Sell Item', route: '/marketplace/sell' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getHomeScreen };
