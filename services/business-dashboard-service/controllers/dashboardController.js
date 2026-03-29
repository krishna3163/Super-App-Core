import axios from 'axios';
import BusinessStats from '../models/BusinessStats.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    let stats = await BusinessStats.findOne({ userId });
    if (!stats) {
      stats = new BusinessStats({ userId, businessMode: true, roles: ['seller'] });
      await stats.save();
    }
    if (!stats.businessMode) return res.status(403).json({ error: 'Business mode not enabled' });

    const activeData = {
      orders: [],
      rides: [],
      tableBookings: [],
      hotelBookings: []
    };

    // Aggregate based on roles
    if (stats.roles.includes('seller')) {
      try {
        const res = await axios.get(`${process.env.ORDER_SERVICE_URL}/vendor/${userId}`);
        activeData.orders = res.data.data || res.data || [];
      } catch (e) {}
    }
    if (stats.roles.includes('rider')) {
      try {
        const res = await axios.get(`${process.env.RIDE_SERVICE_URL}/pending`);
        activeData.rides = res.data || [];
      } catch (e) {}
    }
    if (stats.roles.includes('restaurant')) {
      try {
        // We'd need to find the restaurantId for this userId first
        const foodOrders = await axios.get(`${process.env.FOOD_SERVICE_URL}/orders/restaurant/${userId}`);
        activeData.orders = [...activeData.orders, ...(foodOrders.data.data || [])];
        
        const tableBookings = await axios.get(`${process.env.FOOD_SERVICE_URL}/restaurants/table-bookings/${userId}`);
        activeData.tableBookings = tableBookings.data.data || [];
      } catch (e) {}
    }
    if (stats.roles.includes('hotel')) {
      try {
        const hotelBookings = await axios.get(`${process.env.HOTEL_SERVICE_URL}/bookings/owner/${userId}`);
        activeData.hotelBookings = hotelBookings.data || [];
      } catch (e) {}
    }

    res.json({ status: 'success', data: {
      profile: {
        businessName: stats.businessName,
        businessType: stats.businessType,
        roles: stats.roles,
        rating: stats.rating,
        reviewCount: stats.reviewCount
      },
      revenue: stats.revenue,
      orders: stats.orders,
      customers: stats.customers,
      inventory: stats.inventory,
      dailyStats: stats.dailyStats.slice(-30),
      topProducts: stats.topProducts.slice(0, 10),
      notifications: stats.notifications.filter(n => !n.isRead).slice(0, 20),
      settings: stats.settings,
      activeData
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleBusinessMode = async (req, res) => {
  try {
    const { userId, enabled, businessName, businessType, roles } = req.body;
    const stats = await BusinessStats.findOneAndUpdate(
      { userId },
      { businessMode: enabled, businessName, businessType, roles },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const stats = await BusinessStats.findOneAndUpdate(
      { userId: req.params.userId },
      { settings: req.body },
      { new: true }
    );
    res.json({ status: 'success', data: stats.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const recordSale = async (req, res) => {
  try {
    const { userId, amount, productName, orderId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const stats = await BusinessStats.findOne({ userId });
    if (!stats) return res.status(404).json({ error: 'Business profile not found' });

    stats.revenue.today += amount;
    stats.revenue.thisWeek += amount;
    stats.revenue.thisMonth += amount;
    stats.revenue.total += amount;
    stats.orders.completed += 1;
    stats.orders.total += 1;

    // Update daily stats
    const dayEntry = stats.dailyStats.find(d => d.date === today);
    if (dayEntry) {
      dayEntry.revenue += amount;
      dayEntry.orders += 1;
    } else {
      stats.dailyStats.push({ date: today, revenue: amount, orders: 1 });
    }

    // Update top products
    if (productName) {
      const prod = stats.topProducts.find(p => p.name === productName);
      if (prod) {
        prod.sold += 1;
        prod.revenue += amount;
      } else {
        stats.topProducts.push({ name: productName, sold: 1, revenue: amount });
      }
      stats.topProducts.sort((a, b) => b.revenue - a.revenue);
    }

    // Add notification
    stats.notifications.push({ type: 'order', message: `New sale: ₹${amount} for ${productName || 'item'}` });

    await stats.save();
    res.json({ status: 'success', data: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRevenueChart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    const stats = await BusinessStats.findOne({ userId });
    if (!stats) return res.status(404).json({ error: 'Not found' });

    const chartData = stats.dailyStats.slice(-parseInt(days));
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);

    res.json({ status: 'success', data: {
      chart: chartData,
      summary: { totalRevenue, totalOrders, avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0, days: parseInt(days) }
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    const stats = await BusinessStats.findOne({ userId: req.params.userId });
    stats.notifications.forEach(n => n.isRead = true);
    await stats.save();
    res.json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const stats = await BusinessStats.findOne({ userId: req.params.userId });
    if (!stats) return res.status(404).json({ error: 'Not found' });
    res.json({ status: 'success', data: stats.topProducts.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
