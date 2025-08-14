const { Prompt, User, Tag, Sequelize } = require('../../models');

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

    // If tags are provided, add an include with a WHERE clause on tag names (case-insensitive) and required join.
    // Note: Included Tags in the result will reflect the filtered join; for full tag lists, a second alias would be needed.
    const tagFilterInclude = tagNames.length > 0
      ? [{
          model: Tag,
          through: { attributes: [] },
          required: true,
          where: Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('Tags.name')),
            { [Sequelize.Op.in]: tagNames.map((n) => n.toLowerCase()) }
          ),
        }]
      : [{ model: Tag, through: { attributes: [] } }];

    const findOptions = {
      where,
      include: [...baseIncludes, ...tagFilterInclude],
      limit: pageSize,
      offset,
      order: orderBy,
      distinct: true,
    };

    if (tagNames.length > 0) {
      findOptions.group = ['Prompt.id', 'User.id'];
      findOptions.having = Sequelize.literal(`COUNT(DISTINCT("Tags"."id")) = ${tagNames.length}`);
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
