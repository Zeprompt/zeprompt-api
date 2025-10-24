"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Prompt extends Model {
    static associate(models) {
      Prompt.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Prompt.belongsToMany(models.Tag, {
        through: "prompt_tags",
        foreignKey: "prompt_id",
        otherKey: "tag_id",
      });
      Prompt.hasMany(models.Like, { foreignKey: "promptId" });
      Prompt.hasMany(models.View, { foreignKey: "promptId" });
      Prompt.hasMany(models.PromptVersion, {
        foreignKey: "prompt_id",
        as: "versions",
      });
    }
  }

  Prompt.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.ENUM("text", "pdf"),
        allowNull: false,
        defaultValue: "text",
        field: "content_type",
      },
      pdfFilePath: {
        type: DataTypes.STRING,
        field: "pdf_file_path",
      },
      pdfFileSize: {
        type: DataTypes.INTEGER,
        field: "pdf_file_size",
      },
      pdfOriginalName: {
        type: DataTypes.STRING,
        field: "pdf_original_name",
      },
      imagePath: {
        type: DataTypes.STRING,
        field: "image_path",
        allowNull: true,
      },
      imageFileSize: {
        type: DataTypes.INTEGER,
        field: "image_file_size",
        allowNull: true,
      },
      imageOriginalName: {
        type: DataTypes.STRING,
        field: "image_original_name",
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        field: "image_url",
        allowNull: true,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_public",
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reportCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "report_count",
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM("activé", "désactivé"),
        allowNull: false,
        defaultValue: "activé",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Prompt",
      tableName: "prompts",
    }
  );

  return Prompt;
};
