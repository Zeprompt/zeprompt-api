'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Prompt extends Model {
     
    static associate(models) {
      // Relation: un Prompt appartient à un User
      Prompt.belongsTo(models.User, { foreignKey: 'userId' });
      // N:N avec Tag via table de jointure prompt_tags
      Prompt.belongsToMany(models.Tag, {
        through: 'prompt_tags',
        foreignKey: 'prompt_id',
        otherKey: 'tag_id',
      });
      // Relations avec Likes et Views
      Prompt.hasMany(models.Like, { foreignKey: 'promptId' });
      Prompt.hasMany(models.View, { foreignKey: 'promptId' });
    }
  }

  Prompt.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
  allowNull: true,
      },
      contentType: {
        type: DataTypes.ENUM('text', 'pdf'),
        allowNull: false,
        defaultValue: 'text',
        field: 'content_type',
      },
      pdfFilePath: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pdf_file_path',
      },
      pdfFileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'pdf_file_size',
      },
      pdfOriginalName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pdf_original_name',
      },
  imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'image_url',
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_public',
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
    },
    {
      sequelize,
      modelName: 'Prompt',
      tableName: 'prompts',
      validate: {
        contentConsistency() {
          // If content is text, it must be provided
          if (this.contentType === 'text') {
            if (!this.content || String(this.content).trim().length === 0) {
              throw new Error('content is required when contentType is text');
            }
          }
          // If content is pdf, a pdf file path must be provided
          if (this.contentType === 'pdf') {
            if (!this.pdfFilePath || String(this.pdfFilePath).trim().length === 0) {
              throw new Error('pdfFilePath is required when contentType is pdf');
            }
          }
        },
      },
    }
  );

  return Prompt;
};
