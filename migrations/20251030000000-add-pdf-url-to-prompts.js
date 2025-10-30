'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('prompts', 'pdf_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL du fichier PDF dans R2',
    });

    await queryInterface.addColumn('prompts', 'thumbnail_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL du thumbnail de l\'image dans R2',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('prompts', 'pdf_url');
    await queryInterface.removeColumn('prompts', 'thumbnail_url');
  },
};

