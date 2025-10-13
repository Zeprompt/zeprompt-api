const { Comment } = require("../../models");
class CommentRepository {
  async createComment(
    promptId,
    { userId, content, parentId = null },
    options = {}
  ) {
    return Comment.create(
      {
        promptId,
        userId,
        content,
        parentId,
      },
      options
    );
  }

  async removeComment(commentId, options = {}) {
    return Comment.destroy({
      where: { id: commentId },
      ...options,
    });
  }

  async updateComment(commentId, content, options = {}) {
    const comment = await this.getCommentById(commentId, options);
    if (!comment) return null;

    comment.content = content;
    await comment.save(options);
    return comment;
  }

  async getCommentsByPrompt(promptId, options = {}) {
    return Comment.findAll({
      where: { promptId: promptId, parentId: null },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: Comment,
          as: "replies",
          order: [["createdAt", "ASC"]],
        },
      ],
      ...options,
    });
  }

  async getCommentById(commentId, options = {}) {
    return Comment.findOne({ where: { id: commentId }, ...options });
  }

  /**
   * Incrémenter le compteur de signalements d'un commentaire
   * @param {string} id - ID du commentaire
   * @returns {Promise<Comment>}
   */
  async reportComment(id) {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return null;
    }
    comment.reportCount += 1;
    await comment.save();
    return comment;
  }
}

module.exports = new CommentRepository();
