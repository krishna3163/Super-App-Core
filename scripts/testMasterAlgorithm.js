import MasterAlgorithm from '../services/ai-service/utils/MasterAlgorithm.js';

console.log('🚀 INITIALIZING UNIFIED SUPER CORE ALGORITHM (USCA) TEST...');
console.log('----------------------------------------------------------');

// 1. DUMMY USER WITH EMBEDDINGS
const mockUser = {
  id: 'user_001',
  name: 'Krish',
  // Represents vectors of [Tech, Comedy, Music, Cars, Fashion]
  embeddingVector: [0.9, 0.8, 0.4, 0.1, 0.2] 
};

// 2. MIXED ITEMS FROM ALL OVER THE SUPER APP
const mockItems = [
  {
    id: 'post_1',
    type: 'reel',
    title: 'Funny cat video',
    interactions: { likes: 50000, dislikes: 2000 },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day old
    embeddingVector: [0.1, 0.9, 0.2, 0.0, 0.1] 
  },
  {
    id: 'product_1',
    type: 'product',
    title: 'Mechanical Keyboard Sale',
    interactions: { likes: 300, dislikes: 10 },
    createdAt: new Date().toISOString(), // fresh
    embeddingVector: [0.95, 0.1, 0.1, 0.1, 0.0] 
  },
  {
    id: 'ad_1',
    type: 'ad',
    title: 'Learn Artificial Intelligence - Course',
    cpmBid: 1.5, // High paying ad
    interactions: { likes: 50, dislikes: 5 },
    createdAt: new Date().toISOString(),
    embeddingVector: [0.8, 0.2, 0.1, 0.0, 0.0]
  },
  {
    id: 'dating_match_1',
    type: 'dating',
    title: 'Alice (Match Profile)',
    interactions: { likes: 10, dislikes: 0 },
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days old
    embeddingVector: [0.85, 0.7, 0.5, 0.1, 0.4] // Very similar to Krish!
  },
  {
    id: 'post_2',
    type: 'text',
    title: 'Political News Update',
    interactions: { likes: 1000000, dislikes: 900000 }, // Controversial
    createdAt: new Date(Date.now() - 31536000000).toISOString(), // 1 year old
    embeddingVector: [0.0, 0.0, 0.0, 0.0, 0.0] // Complete mismatch
  }
];

// 3. RUN ALGORITHM
const start = performance.now();
const rankedFeed = MasterAlgorithm.rankFeed(mockUser, mockItems);
const end = performance.now();

// 4. PRINT RESULTS
console.log(`⏱️ Algorithm execution time: ${(end - start).toFixed(4)} ms`);
console.log('\n🌟 FINAL RANKED SUPER FEED 🌟');
console.log('----------------------------------------------------------');

rankedFeed.forEach((item, index) => {
  console.log(`#${index + 1} | Type: [${item.type.toUpperCase()}] | Title: "${item.title}"`);
  console.log(`    ↳ SuperScore: ${item._superScore.toFixed(3)}`);
});

console.log('\n==========================================================');
console.log('💡 OBSERVATIONS:');
console.log('- Ad_1 is boosted by business ecosystem multiplier.');
console.log('- Product_1 matches user Tech embedding perfectly.');
console.log('- Post_2 is dead despite 1M+ likes because of Time Decay Gravity.');
console.log('- Dating Profile matched user interests.');
console.log('----------------------------------------------------------');
