"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     
    static associate(models) {
      User.hasMany(models.Prompt, { foreignKey: 'userId' });
      User.hasMany(models.Like, { foreignKey: 'userId' });
      User.hasMany(models.View, { foreignKey: 'userId' });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: "emailverificationtoken",
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "profile_picture",
      },
      githubUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "github_url",
        validate: {
          isUrl: true,
        },
      },
      linkedinUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "linkedin_url",
        validate: {
          isUrl: true,
        },
      },
      whatsappNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "whatsapp_number",
      },
      twitterUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "twitter_url",
        validate: {
          isUrl: true,
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
