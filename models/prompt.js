'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Prompt extends Model {
     
    static associate(models) {
      // Relation: un Prompt appartient à un User
      Prompt.belongsTo(models.User, { foreignKey: 'userId' });
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
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
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
