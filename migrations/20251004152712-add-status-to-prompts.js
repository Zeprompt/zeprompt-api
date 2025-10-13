'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('prompts', 'status', {
      type: Sequelize.ENUM('activé', 'désactivé'),
      allowNull: false,
      defaultValue: 'activé',
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('prompts', 'status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_prompts_status";'
    );
  }
};
