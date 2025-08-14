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
        allowNull: false,
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
    }
  );

  return Prompt;
};
