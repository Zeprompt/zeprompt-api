'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class View extends Model {
    static associate(models) {
      // Relations
      View.belongsTo(models.Prompt, { foreignKey: 'promptId' });
      View.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  View.init(
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
        field: 'prompt_id',
        references: {
          model: 'prompts',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      anonymousId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'anonymous_id',
      },
      lastViewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'last_viewed_at',
      },
    },
    {
      sequelize,
      modelName: 'View',
      tableName: 'views',
      validate: {
        eitherUserIdOrAnonymousId() {
          if (!this.userId && !this.anonymousId) {
            throw new Error('Either userId or anonymousId must be provided');
          }
        },
      },
    }
  );

  return View;
};
