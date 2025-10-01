const { View } = require("../../models");

class ViewRepository {
  async recordView(promptId, identifier, options = {}) {
    const view = await View.create({
      ...identifier,
      promptId,
      lastViewedAt: new Date(),
      ...options,
    });

    return view;
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
        [
          View.sequelize.fn(
            "COUNT",
            View.sequelize.fn(
              "DISTINCT",
              View.sequelize.fn(
                "COALESCE",
                View.sequelize.col("user_id"),
                View.sequelize.col("anonymous_id")
              )
            )
          ),
          "uniqueViewers",
        ],
      ],
      raw: true,
    });

    return result[0]?.uniqueViewers || 0;
  }
}

module.exports = new ViewRepository();
