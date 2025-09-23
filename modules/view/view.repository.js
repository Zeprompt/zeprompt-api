const { View, Prompt } = require('../../models');

class ViewRepository {
  // Record a view for a prompt (anonymous or authenticated)
  async recordView(promptId, identifier) {
    // Check if this user/anonymous has viewed the prompt in the last hour
    const existingView = await View.findOne({
      where: {
        ...identifier,
        promptId,
      },
      order: [['lastViewedAt', 'DESC']],
    });

    // Don't record the view if the last view was less than 1 hour ago
    if (existingView) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (existingView.lastViewedAt > oneHourAgo) {
        return { view: existingView, isNewView: false };
      }
    }

    // Update the views counter on the prompt
    await Prompt.increment('views', { where: { id: promptId } });

    // Create a new view record
    const view = await View.create({
      ...identifier,
      promptId,
      lastViewedAt: new Date(),
    });

    return { view, isNewView: true };
  }

  // Get view count for a prompt (total)
  async countViews(promptId) {
    return View.count({
      where: { promptId },
    });
  }

  // Get unique viewers count (based on userId or anonymousId)
  async countUniqueViewers(promptId) {
    // Count unique viewers by taking either userId (if exists) or anonymousId
    const result = await View.findAll({
      where: { promptId },
      attributes: [
        [View.sequelize.fn('COUNT', View.sequelize.fn('DISTINCT', 
          View.sequelize.fn('COALESCE', 
            View.sequelize.col('user_id'), 
            View.sequelize.col('anonymous_id')
          )
        )), 'uniqueViewers'],
      ],
      raw: true,
    });

    return result[0]?.uniqueViewers || 0;
  }
}

module.exports = new ViewRepository();
