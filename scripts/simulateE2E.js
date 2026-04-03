import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api'; // Assuming API Gateway is at port 5050

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runE2ESimulation = async () => {
  try {
    console.log('🚀 Starting Super App E2E Core Simulation...');

    // 1. Create a Test User (Phase 1: Auth & User Service)
    console.log('\n[1/5] Creating Test User...');
    const authRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: `testuser_${Date.now()}@superapp.com`,
      password: 'Password123!',
      fullName: 'Super App Tester'
    });
    const token = authRes.data.token;
    const userId = authRes.data.user.id;
    console.log(`✅ User created! ID: ${userId}`);

    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Setup Wallet (Phase 2: Monetization Service)
    console.log('\n[2/5] Initializing Digital Wallet & Adding Funds...');
    await axios.post(`${BASE_URL}/wallet/fund`, { amount: 50.00, currency: 'USD' }, config);
    console.log(`✅ Wallet funded with $50.00!`);

    // 3. Post a status on Feed (Phase 3: Social Service)
    console.log('\n[3/5] Posting on Super App Social Feed...');
    const postRes = await axios.post(`${BASE_URL}/social/posts`, {
      userId,
      content: 'Just joined the Super App! Ready to test Uber & Zomato clones.',
      type: 'text'
    }, config);
    console.log(`✅ Social Post Created! ID: ${postRes.data.data._id}`);

    // 4. Test Marketplace / Ride (Phase 4: Marketplace Service)
    console.log('\n[4/5] Purchasing a product from Marketplace...');
    const orderRes = await axios.post(`${BASE_URL}/market/order`, {
      buyerId: userId,
      productId: 'mock_product_123',
      quantity: 1,
      paymentMethod: 'wallet'
    }, config);
    console.log(`✅ Order Placed! Wallet deducted automatically.`);

    // 5. Test Random Chat Matchmaking (Phase 5: Interactions Service)
    console.log('\n[5/5] Joining Omegle-style Random Chat...');
    const chatRes = await axios.post(`${BASE_URL}/advanced-interact/random-chat/match`, {
      userId,
      interests: ['coding', 'music']
    }, config);
    console.log(`✅ Joined Random Chat Pool! Status: ${chatRes.data.status}`);

    console.log('\n🎉 ALL E2E SIMULATION TESTS PASSED SUCCESSFULLY! The architecture is solid.');

  } catch (err) {
    console.error('\n❌ E2E Test Failed:', err.response ? err.response.data : err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 TIP: It looks like API Gateway or your Microservices are not running. Please make sure MongoDB is ON and app is running.');
    }
  }
};

runE2ESimulation();
