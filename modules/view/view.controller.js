const httpResponse = require('../../utils/httpResponse');
const viewService = require('./view.service');
const { verifyToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');

/**
 * @openapi
 * components:
 *   schemas:
 *     ViewStats:
 *       type: object
 *       properties:
 *         totalViews: { type: integer, example: 1250 }
 *         uniqueViewers: { type: integer, example: 820 }
 */

/**
 * @openapi
 * /api/prompts/{id}/view:
 *   post:
 *     summary: Record a view for a prompt (rate limited to once per hour per user/IP)
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: View recorded successfully
 * 
 * /api/prompts/{id}/views:
 *   get:
 *     summary: Get view statistics for a prompt
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: View statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ViewStats'
 */

class ViewController {
  // Record a view for a prompt
  async recordView(req, res) {
    try {
      const { id } = req.params;
      
      // Get user from token if available
      let user = null;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          try {
            user = verifyToken(token);
          } catch {
            logger.info('Invalid token, using anonymous mode');
          }
        }
      }

      // Get anonymous ID from IP if user not authenticated
      const anonymousId = !user ? (
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip
      ) : null;

      const result = await viewService.recordView(id, user, anonymousId);
      
      return httpResponse.sendSuccess(res, 200, 'prompt view', 'recorded', {
        isNewView: result.isNewView,
        viewCount: result.viewCount
      });
    } catch (err) {
      return httpResponse.sendError(res, 500, 'prompt view', 'recording', err.message);
    }
  }

  // Get view statistics for a prompt
  async getViewStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await viewService.getViewStats(id);
      return httpResponse.sendSuccess(res, 200, 'prompt views', 'fetched', stats);
    } catch (err) {
      return httpResponse.sendError(res, 500, 'prompt views', 'fetching', err);
    }
  }
}

module.exports = new ViewController();
