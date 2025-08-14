const { Tag } = require('../../models');

class TagRepository {
  async findAll() {
    return Tag.findAll();
  }

  async findById(id) {
    return Tag.findByPk(id);
  }

  async findByName(name) {
    return Tag.findOne({ where: { name } });
  }

  async create(data) {
    return Tag.create(data);
  }

  async update(id, data) {
    const tag = await this.findById(id);
    if (!tag) return null;
    return tag.update(data);
  }

  async delete(id) {
    const tag = await this.findById(id);
    if (!tag) return null;
    await tag.destroy();
    return tag;
  }
}

module.exports = new TagRepository();
