const tagRepository = require('./tag.repository');

class TagService {
  async getAll() {
    return tagRepository.findAll();
  }

  async getById(id) {
    return tagRepository.findById(id);
  }

  async create(data) {
    // simple unique check by name
    const existing = await tagRepository.findByName(data.name);
    if (existing) {
      const err = new Error('Tag already exists');
      err.statusCode = 409;
      throw err;
    }
    return tagRepository.create(data);
  }

  async update(id, data) {
    return tagRepository.update(id, data);
  }

  async delete(id) {
    return tagRepository.delete(id);
  }
}

module.exports = new TagService();
