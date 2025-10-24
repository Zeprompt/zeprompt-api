"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("prompt_versions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      prompt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "prompts", // table "prompts"
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      versionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      content_type: {
        type: Sequelize.ENUM("text", "pdf"),
        allowNull: false,
        defaultValue: "text",
      },
      pdf_file_path: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pdf_file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      pdf_original_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users", // table "users"
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    // ⚠️ Avec Postgres, il faut supprimer le type ENUM avant de drop la table
    await queryInterface.dropTable("prompt_versions");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_prompt_versions_content_type";'
    );
  },
};
