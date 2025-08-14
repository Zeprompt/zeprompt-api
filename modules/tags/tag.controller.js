const httpResponse = require('../../utils/httpResponse');
const tagService = require('./tag.service');

class TagController {
  async getAll(req, res) {
    try {
      const tags = await tagService.getAll();
      httpResponse.sendSuccess(res, 200, 'tag', 'fetched', tags);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'fetching', error);
    }
  }

  async getById(req, res) {
    try {
      const tag = await tagService.getById(req.params.id);
      if (!tag) return res.status(404).json({ message: 'Tag not found' });
      httpResponse.sendSuccess(res, 200, 'tag', 'fetched by Id', tag);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'fetching by Id', error);
    }
  }

  async create(req, res) {
    try {
      const tag = await tagService.create(req.body);
      httpResponse.sendSuccess(res, 201, 'tag', 'created', tag);
    } catch (error) {
      const status = error.statusCode || 500;
      httpResponse.sendError(res, status, 'tag', 'creating', error);
    }
  }

  async update(req, res) {
    try {
      const tag = await tagService.update(req.params.id, req.body);
      if (!tag) return res.status(404).json({ message: 'Tag not found' });
      httpResponse.sendSuccess(res, 200, 'tag', 'updated', tag);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'updating', error);
    }
  }

  async delete(req, res) {
    try {
      const tag = await tagService.delete(req.params.id);
      if (!tag) return res.status(404).json({ message: 'Tag not found' });
      httpResponse.sendSuccess(res, 200, 'tag', 'deleted', tag);
    } catch (error) {
      httpResponse.sendError(res, 500, 'tag', 'deleting', error);
    }
  }
}

module.exports = new TagController();
