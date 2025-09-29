"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.Prompt, {
        foreignKey: "promptId",
        as: "prompt",
      });
      Comment.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Comment.hasMany(Comment, { foreignKey: "parentId", as: "replies" });
      Comment.belongsTo(Comment, { foreignKey: "parentId", as: "parent" });
    }
  }
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      promptId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "prompt_id",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "user_id",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "parent_id",
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
    }
  );
  return Comment;
};
