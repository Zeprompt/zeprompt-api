'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
     
    static associate(models) {
      // N:N avec Prompt via table de jointure prompt_tags
      Tag.belongsToMany(models.Prompt, {
        through: 'prompt_tags',
        foreignKey: 'tag_id',
        otherKey: 'prompt_id',
      });
    }
  }

  Tag.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Tag',
      tableName: 'tags',
    }
  );

  return Tag;
};
