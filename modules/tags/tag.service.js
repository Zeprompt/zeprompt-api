const AppError = require("../../utils/appError");
const tagRepository = require("./tag.repository");

class TagService {
  async getAll() {
    const tags = await tagRepository.findAll();
    if (!tags) {
      throw new AppError({
        message: "Aucun tag trouvée.",
        userMessage: "Aucun tags n'a été trouvée.",
        statusCode: 404,
        errorCode: "TAG_NOT_FOUND",
      });
    }

    return tags;
  }

  async getById(id) {
    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw new AppError({
        message: "Tag non trouvé.",
        userMessage: "Aucun tag n'a été trouvée.",
        statusCode: 404,
        errorCode: "TAG_NOT_FOUND",
      });
    }

    return tag;
  }

  async create(data) {
    // simple unique check by name
    const existing = await tagRepository.findByName(data.name);
    if (existing) {
      throw new AppError({
        message: "Tag existe déjà.",
        userMessage: "Un tag avec ce nom existe déjà.",
        statusCode: 409,
        errorCode: "TAG_ALREADY_EXIST",
      });
    }

    return tagRepository.create(data);
  }

  async update(id, data) {
    return await tagRepository.update(id, data);
  }

  async delete(id) {
    return await tagRepository.delete(id);
  }
}

module.exports = new TagService();
