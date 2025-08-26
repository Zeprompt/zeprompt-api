const httpResponse = require('../../utils/httpResponse');
const likeService = require('./like.service');
const { verifyToken } = require('../../utils/jwt');
const logger = require('../../utils/logger');

/**
 * @openapi
 * components:
 *   schemas:
 *     LikeResponse:
 *       type: object
 *       properties:
 *         message: { type: string, example: "Prompt liked" }
 *         liked: { type: boolean, example: true }
 *         likesCount: { type: integer, example: 42 }
 */

/**
 * @openapi
 * /api/prompts/{id}/like:
 *   post:
 *     summary: Like a prompt (rate limited to once per 24h per user/IP)
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Prompt liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeResponse'
 *       429:
 *         description: Rate limit exceeded (already liked in last 24h)
 * 
 * /api/prompts/{id}/likes:
 *   get:
 *     summary: Get the number of likes for a prompt
 *     tags: [Prompts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Like count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 42 }
 * 
 * /api/prompts/popular/likes:
 *   get:
 *     summary: Get the most liked prompts
 *     tags: [Prompts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: List of popular prompts by likes
 */

class LikeController {
  // Like/unlike a prompt
  async likePrompt(req, res) {
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

      const result = await likeService.likePrompt(id, user, anonymousId);
      
      // Handle rate limiting response
      if (result.status === 429) {
        return res.status(429).json({
          error: result.error,
          message: result.message,
          nextLikeAllowedAt: result.nextLikeAllowedAt
        });
      }

      // Success response
      return httpResponse.sendSuccess(res, 200, 'prompt', 'liked', {
        message: result.message,
        liked: result.liked,
        likesCount: result.likesCount
      });
    } catch (error) {
      return httpResponse.sendError(res, 500, 'prompt', 'liking', error);
    }
  }

  // Get likes count for a prompt
  async getLikesCount(req, res) {
    try {
      const { id } = req.params;
      const count = await likeService.getLikesCount(id);
      return httpResponse.sendSuccess(res, 200, 'prompt likes', 'fetched', { count });
    } catch (err) {
      return httpResponse.sendError(res, 500, 'prompt likes', 'fetching', err);
    }
  }

  // Get popular prompts (most liked)
  async getPopularByLikes(req, res) {
    try {
      const { limit = 10 } = req.query;
      const prompts = await likeService.getPopularByLikes(limit);
      return httpResponse.sendSuccess(res, 200, 'popular prompts', 'fetched', prompts);
    } catch (err) {
      return httpResponse.sendError(res, 500, 'popular prompts', 'fetching', err.message);
    }
  }
}

module.exports = new LikeController();
