const { Tag } = require("../../models");

class TagRepository {
  async findAll() {
    return await Tag.findAll();
  }

  async findById(id) {
    return await Tag.findByPk(id);
  }

  async findByName(name, options = {}) {
    return await Tag.findOne({ where: { name }, ...options });
  }

  async create(data, options = {}) {
    return await Tag.create(data, options);
  }

  async update(tag, data) {
    return await tag.update(data);
  }

  async delete(tag) {
    return await tag.destroy();
  }
}

module.exports = new TagRepository();
