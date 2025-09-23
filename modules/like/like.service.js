const likeRepository = require('./like.repository');
const promptRepository = require('../prompts/prompt.repository');

class LikeService {
  // Process a like request from a user or anonymous visitor
  async likePrompt(promptId, user = null, anonymousId = null) {
    // Verify prompt exists
    const prompt = await promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Create identifier based on authentication status
    const identifier = user 
      ? { userId: user.id }
      : { anonymousId };

    // Check if already liked in last 24h
    const existingLike = await likeRepository.findExistingLike(promptId, identifier);
    if (existingLike) {
      const nextAllowedAt = new Date(existingLike.lastLikedAt.getTime() + 24 * 60 * 60 * 1000);
      return {
        error: 'Rate limit exceeded',
        message: 'You can only like a prompt once every 24 hours',
        nextLikeAllowedAt: nextAllowedAt,
        status: 429
      };
    }

    // Remove any old likes (> 24h)
    await likeRepository.removeOldLikes(promptId, identifier);

    // Create the like
    await likeRepository.createLike(promptId, identifier);

    // Get updated count
    const likesCount = await likeRepository.countActiveLikes(promptId);

    return {
      message: 'Prompt liked',
      liked: true,
      likesCount,
      status: 200
    };
  }

  // Get active likes count for a prompt
  async getLikesCount(promptId) {
    // Verify prompt exists
    const prompt = await promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    return likeRepository.countActiveLikes(promptId);
  }

  // Get popular prompts by likes
  async getPopularByLikes(limit = 10) {
    return likeRepository.findPopularByLikes(limit);
  }
}

module.exports = new LikeService();
