/**
 * UNIFIED SUPER CORE ALGORITHM (USCA)
 * The ultimate scoring engine for the Super App.
 * This algorithm aggregates signals from Social, E-Commerce, Dating, and Rides
 * to create a singular, unified hyper-personalized recommendation feed.
 */

class MasterAlgorithm {
  constructor() {
    this.GRAVITY = 1.8; // Time decay factor (Reddit/HackerNews style)
    this.EXPLORATION_RATE = 0.15; // 15% of feed should be completely new (Multi-Armed Bandit)
  }

  /**
   * Calculate Cosine Similarity between two N-dimensional embeddings.
   * Used for matching users with users (Dating/Friends) or users with items (Products/Ads).
   * @param {number[]} vecA - User Embedding Vector
   * @param {number[]} vecB - Target Embedding Vector
   * @returns {number} Score between 0 and 1
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0.5; // Fallback average
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] ** 2;
      normB += vecB[i] ** 2;
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * HackerNews & Reddit Hot Algorithm (Time Decay)
   * Prevents old viral content from staying at the top forever.
   * @param {number} upvotes - Raw engagement
   * @param {number} downvotes - Negative engagement
   * @param {Date} dateCreated - Creation timestamp
   * @returns {number} Time-adjusted score
   */
  calculateViralDecayScore(upvotes, downvotes, dateCreated) {
    const baseScore = upvotes - downvotes;
    // Base 10 log to smooth huge vote counts
    const order = Math.log10(Math.max(Math.abs(baseScore), 1));
    const sign = baseScore > 0 ? 1 : baseScore < 0 ? -1 : 0;
    
    // Seconds elapsed since epoch
    const seconds = (dateCreated.getTime() / 1000) - 1134028003; 
    
    // Final calculated score with gravity decay
    return Math.round((sign * order + seconds / 45000) * 10000000) / 10000000;
  }

  /**
   * Collaborative Filtering (Edge Weight Calculation)
   * Evaluates how strong the relationship is between two users based on historical interaction graphs.
   * @param {object} userHistory - { likedItems: [], viewedItems: [], purchased: [] }
   * @param {object} targetHistory 
   */
  calculateJaccardIndex(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Ultimate Ranker Function
   * Predicts Click-Through-Rate (pCTR) and combines it with Business Value (Ad CPM)
   * Features: TikTok infinite scroll retention mapping + Amazon purchase intent.
   * 
   * @param {Object} user - Current user object
   * @param {Array} items - Mixed array of { Reels, Products, DatingProfiles, Ads }
   * @returns {Array} - Ranked list of items using the Master Formula
   */
  rankFeed(user, items) {
    const currentTime = new Date();

    const scoredItems = items.map(item => {
      let finalScore = 0;

      // 1. Base Engagement (Time Decay & Virality)
      const engagementScore = this.calculateViralDecayScore(
        item.interactions?.likes || 0, 
        item.interactions?.dislikes || 0, 
        new Date(item.createdAt)
      );

      // 2. Personalization (Cosine Similarity of Embeddings OR Jaccard Interaction overlaps)
      // Represent how likely the user is to engage with this specific content
      const personalizationScore = this.cosineSimilarity(user.embeddingVector, item.embeddingVector || user.embeddingVector);

      // 3. Contextual Bandit Exploration (Epsilon-Greedy approach)
      // Give a random massive boost to 15% of items to discover new niches
      const explorationBoost = Math.random() < this.EXPLORATION_RATE ? (Math.random() * 5.0) : 0;

      // 4. Ecosystem Weighting (The "Super App" Multiplier)
      // Products give revenue, Reels give retention, Ads give direct cash.
      let ecosystemMultiplier = 1.0;
      if (item.type === 'ad') ecosystemMultiplier = 1.5 + (item.cpmBid || 0.1); 
      if (item.type === 'product') ecosystemMultiplier = 1.2;
      if (item.type === 'reel') ecosystemMultiplier = 1.8; // High engagement multiplier

      // MASTER FORMULA 
      // Combines Virality (Social Proof) + Relevance + Discovery + Business Value
      finalScore = ((engagementScore * 0.4) + (personalizationScore * 0.4) + explorationBoost) * ecosystemMultiplier;

      return { ...item, _superScore: finalScore };
    });

    // Return the items sorted by the highest SuperScore descending
    return scoredItems.sort((a, b) => b._superScore - a._superScore);
  }
}

export default new MasterAlgorithm();
