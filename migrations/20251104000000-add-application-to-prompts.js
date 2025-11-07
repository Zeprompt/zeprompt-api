'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('prompts', 'application', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Application pour laquelle le prompt est destiné (ChatGPT, Gemini, Claude, etc.)',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('prompts', 'application');
  },
};
