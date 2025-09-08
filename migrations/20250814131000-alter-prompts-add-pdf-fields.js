'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('prompts', 'content_type', {
      type: Sequelize.ENUM('text', 'pdf'),
      allowNull: false,
      defaultValue: 'text',
    });
    await queryInterface.addColumn('prompts', 'pdf_file_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('prompts', 'pdf_file_size', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('prompts', 'pdf_original_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('prompts', 'pdf_original_name');
    await queryInterface.removeColumn('prompts', 'pdf_file_size');
    await queryInterface.removeColumn('prompts', 'pdf_file_path');
    await queryInterface.removeColumn('prompts', 'content_type');
    // Drop enum type in Postgres to avoid leftover type
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_prompts_content_type";');
    }
  },
};
