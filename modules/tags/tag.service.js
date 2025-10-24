const tagRepository = require("./tag.repository");
const Errors = require("./tag.errors");

class TagService {
  async _getTagOrThrow(id) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw Errors.TAG_NOT_FOUND();
    return tag;
  }

  _validateData(data) {
    if (!data?.name) throw Errors.TAG_NAME_REQUIRED();
  }

  async getAll() {
    const tags = await tagRepository.findAll();
    if (!tags || tags.length === 0) throw Errors.TAG_NOT_FOUND();
    return tags;
  }

  async getById(id) {
    return this._getTagOrThrow(id);
  }

  async create(data) {
    this._validateData(data);
    const existing = await tagRepository.findByName(data.name);
    if (existing) throw Errors.TAG_ALREADY_EXIST();
    return await tagRepository.create(data);
  }

  async update(id, data) {
    this._validateData(data);
    const tag = await this._getTagOrThrow(id);
    return await tagRepository.update(tag, data);
  }

  async delete(id) {
    const tag = await this._getTagOrThrow(id);
    return await tagRepository.delete(tag);
  }
}

module.exports = new TagService();
