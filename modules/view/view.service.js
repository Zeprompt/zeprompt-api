const viewRepository = require('./view.repository');
const promptRepository = require('../prompts/prompt.repository');

class ViewService {
  // Record a view and increment view counter if it's a new view (>1h since last view)
  async recordView(promptId, user = null, anonymousId = null) {
    // Verify prompt exists
    const prompt = await promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Create identifier based on authentication status
    const identifier = user 
      ? { userId: user.id }
      : { anonymousId };

    // Record the view (repository handles hourly rate limiting)
    const { view, isNewView } = await viewRepository.recordView(promptId, identifier);

    return {
      view,
      isNewView,
      // Return the updated view count from the prompt record
      // This is more efficient than counting all views each time
      viewCount: prompt.views + (isNewView ? 1 : 0)
    };
  }

  // Get view stats for a prompt
  async getViewStats(promptId) {
    // Verify prompt exists
    const prompt = await promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error('Prompt not found');
    }

    // Get the actual count from the views table (more precise than the counter)
    const totalViews = await viewRepository.countViews(promptId);
    const uniqueViewers = await viewRepository.countUniqueViewers(promptId);

    return {
      totalViews,
      uniqueViewers,
      // Also return the counter value from the prompt record
      counterValue: prompt.views
    };
  }
}

module.exports = new ViewService();
