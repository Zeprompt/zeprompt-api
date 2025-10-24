"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PromptVersion extends Model {
    static associate(models) {
      PromptVersion.belongsTo(models.Prompt, {
        foreignKey: "prompt_id",
        as: "prompt",
      });

      PromptVersion.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  PromptVersion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      promptId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "prompt_id",
      },
      versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      versionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      imageUrl: {
        type: DataTypes.STRING,
        field: "image_url",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: "is_public",
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "user_id",
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PromptVersion",
      tableName: "prompt_versions",
    }
  );

  return PromptVersion;
};
