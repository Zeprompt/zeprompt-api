const { Tag } = require("../../models");

class TagRepository {
  async findAll() {
    return await Tag.findAll();
  }

  async findById(id) {
    return await Tag.findByPk(id);
  }

  async findByName(name) {
    return await Tag.findOne({ where: { name } });
  }

  async create(data) {
    return await Tag.create(data);
  }

  async update(tag, data) {
    return await tag.update(data);
  }

  async delete(tag) {
    return await tag.destroy();
  }
}

module.exports = new TagRepository();
