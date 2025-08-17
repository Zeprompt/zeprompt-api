const { Prompt, User, Tag, Sequelize, sequelize } = require('../../models');

class PromptRepository {
  async findAllPublic({ search, page, limit, sort, order, tags }) {
    const pageNumber = parseInt(page || 1, 10);
    const pageSize = parseInt(limit || 10, 10);
    const offset = (pageNumber - 1) * pageSize;

    const where = { isPublic: true };
    const orderBy = sort === 'createdAt' ? [['createdAt', order || 'DESC']] : [[sort || 'createdAt', order || 'DESC']];

    if (search) {
      where[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.iLike]: `%${search}%` } },
        { content: { [Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    // Tag-based filtering: expect comma-separated tag names in query (?tags=ai,seo)
    // We implement an "ALL tags" match using include + GROUP BY + HAVING COUNT(DISTINCT Tag.id) = tags.length
    const tagNames = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : [];

    // Base includes always include User and Tags (when no filtering).
    const baseIncludes = [
      { model: User, attributes: ['id', 'username', 'email'] },
    ];

  // Always include Tags for output. We'll do filtering via a subquery in WHERE to avoid alias issues.
  const tagInclude = [{ model: Tag, through: { attributes: [] } }];

    const findOptions = {
      where,
      include: [...baseIncludes, ...tagInclude],
      limit: pageSize,
      offset,
      order: orderBy,
      distinct: true,
    };

    if (tagNames.length > 0) {
      const normalized = tagNames.map((n) => n.toLowerCase());
      const escapedList = normalized.map((n) => sequelize.escape(n)).join(', ');
      const subQuery = `(
        SELECT pt.prompt_id
        FROM prompt_tags pt
        JOIN tags t ON t.id = pt.tag_id
        WHERE t.name IN (${escapedList})
        GROUP BY pt.prompt_id
        HAVING COUNT(DISTINCT t.id) = ${normalized.length}
      )`;
      findOptions.where = {
        ...where,
        [Sequelize.Op.and]: Sequelize.literal(`"Prompt"."id" IN ${subQuery}`),
      };
    }

    const { count, rows } = await Prompt.findAndCountAll(findOptions);

    // When using GROUP BY, Sequelize returns count as an array; use its length as total groups (prompts)
    const total = Array.isArray(count) ? count.length : count;

    return { count: total, rows, pageNumber, pageSize };
  }

  async findByIdPublic(id) {
    return Prompt.findOne({
      where: { id, isPublic: true },
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Tag, through: { attributes: [] } },
      ],
    });
  }

  async findById(id) {
    return Prompt.findOne({
      where: { id },
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Tag, through: { attributes: [] } },
      ],
    });
  }

  async findMine(userId) {
    return Prompt.findAll({
      where: { userId },
      include: [{ model: Tag, through: { attributes: [] } }],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateOwned(id, userId, data) {
    const prompt = await Prompt.findOne({ where: { id } });
    if (!prompt) return null;
    if (prompt.userId !== userId) return 'forbidden';
    return prompt.update(data);
  }

  async create(userId, data) {
    return Prompt.create({ ...data, userId });
  }

  async deleteOwned(id, userId) {
    const prompt = await Prompt.findOne({ where: { id } });
    if (!prompt) return null;
    if (prompt.userId !== userId) return 'forbidden';
    await prompt.destroy();
    return prompt;
  }

  // Upsert tags and set associations for a prompt
  async upsertTagsForPrompt(promptId, tagNames = []) {
    const prompt = await Prompt.findByPk(promptId);
    if (!prompt) return null;

    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      await prompt.setTags([]);
      return prompt;
    }

  const normalized = tagNames.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
    const tags = await Promise.all(
      normalized.map(async (name) => {
        const [tag] = await Tag.findOrCreate({ where: { name } });
        return tag;
      })
    );
    await prompt.setTags(tags);
    return prompt;
  }

  async findPopular(limit = 10) {
    const limitValue = parseInt(limit, 10) || 10;
    return Prompt.findAll({
      where: { isPublic: true },
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Tag, through: { attributes: [] } },
      ],
      order: [['views', 'DESC']],
      limit: limitValue,
    });
  }
}

module.exports = new PromptRepository();
