'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('comments', 'report_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nombre de signalements reçus pour ce commentaire'
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('comments', 'report_count');
  }
};
