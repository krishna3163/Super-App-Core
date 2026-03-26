import UnifiedPost from '../models/UnifiedPost.js';

export const createPost = async (req, res) => {
  try {
    const post = new UnifiedPost(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnifiedFeed = async (req, res) => {
  try {
    const { userId, limit = 20, page = 1 } = req.query;
    
    // Fetch posts
    const posts = await UnifiedPost.find()
      .limit(Number(limit) * 5) // Fetch more to rank
      .lean();

    // EdgeRank Calculation
    const rankedPosts = posts.map(post => {
      // 1. Weight (W)
      const wLikes = (post.likes?.length || 0) * 1;
      const wUpvotes = (post.upvotes?.length || 0) * 1.5;
      const wComments = (post.commentsCount || 0) * 2;
      const wRetweets = (post.retweets?.length || 0) * 3;
      const totalWeight = 1 + wLikes + wUpvotes + wComments + wRetweets;

      // 2. Time Decay (D)
      const hoursPassed = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
      const decay = Math.pow(hoursPassed + 2, 1.8); // D = (T+2)^1.8

      // 3. Affinity / Interest Score (I)
      // Mock affinity (in real app, use user preferences or following status)
      const affinity = 1.0; 

      post.rankScore = (affinity * totalWeight) / decay;
      return post;
    });

    // Sort by rankScore
    rankedPosts.sort((a, b) => b.rankScore - a.rankScore);

    // Paginate
    const pagedPosts = rankedPosts.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    res.json(pagedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const interactWithPost = async (req, res) => {
  try {
    const { postId, userId, action } = req.body; // action: like, retweet, upvote, downvote
    const post = await UnifiedPost.findById(postId);
    
    if (!post) return res.status(404).json({ error: 'Post not found' });

    switch(action) {
      case 'like':
        post.likes.includes(userId) ? post.likes = post.likes.filter(id => id !== userId) : post.likes.push(userId);
        break;
      case 'upvote':
        post.upvotes.push(userId);
        post.downvotes = post.downvotes.filter(id => id !== userId);
        break;
      case 'retweet':
        post.retweets.push(userId);
        break;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
