'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('prompts', 'report_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de signalements reçus pour ce prompt'
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('prompts', 'report_count');
  }
};
