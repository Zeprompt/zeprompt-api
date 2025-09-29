const { getIO } = require("../../config/socket");
const { sequelize } = require("../../models");
const commentRepository = require("./comment.repository");
const Errors = require("./comment.errors");

class CommentService {
  async _broadcastCommentUpdate(promptId) {
    const comments = await this.getCommentsByPrompts(promptId);
    getIO().emit("prompt:commentsUpdated", { promptId, comments });
    return comments;
  }

  _isOwnerOrAdmin(comment, user) {
    if (!user) return false;
    return (
      (comment.userId && comment.userId === user.id) || user.role === "admin"
    );
  }

  async createComment(promptId, content, user, parentId = null) {
    const transaction = await sequelize.transaction();

    try {
      const comment = await commentRepository.createComment(
        promptId,
        {
          userId: user.id,
          content,
          parentId,
        },
        { transaction }
      );
      await this._broadcastCommentUpdate(promptId);
      await transaction.commit();

      return comment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteComment(commentId, currentUser) {
    const transaction = await sequelize.transaction();
    try {
      const comment = await commentRepository.getCommentById(commentId);
      if (!comment) throw Errors.commentNotFound();
      if (!this._isOwnerOrAdmin(comment, currentUser))
        throw Errors.unauthorizedAction();
      await commentRepository.removeComment(commentId, { transaction });
      await this._broadcastCommentUpdate(comment.promptId);
      await transaction.commit();
      return true;
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  async updateComment(commentId, content, user) {
    const transaction = await sequelize.transaction();
    try {
      const comment = await commentRepository.getCommentById(commentId, {
        transaction,
      });
      if (!comment) throw Errors.commentNotFound();
      if (!this._isOwnerOrAdmin(comment, user))
        throw Errors.unauthorizedAction();
      const updatedComment = await commentRepository.updateComment(
        commentId,
        content,
        { transaction }
      );
      await this._broadcastCommentUpdate(comment.promptId);
      await transaction.commit();
      return updatedComment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getCommentsByPrompts(promptId) {
    return commentRepository.getCommentsByPrompt(promptId);
  }
}

module.exports = new CommentService();
