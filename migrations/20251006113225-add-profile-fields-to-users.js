'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'profile_picture', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL ou chemin de la photo de profil'
    });

    await queryInterface.addColumn('users', 'github_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL du profil GitHub'
    });

    await queryInterface.addColumn('users', 'linkedin_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL du profil LinkedIn'
    });

    await queryInterface.addColumn('users', 'whatsapp_number', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Numéro WhatsApp'
    });

    await queryInterface.addColumn('users', 'twitter_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL du profil Twitter/X'
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('users', 'profile_picture');
    await queryInterface.removeColumn('users', 'github_url');
    await queryInterface.removeColumn('users', 'linkedin_url');
    await queryInterface.removeColumn('users', 'whatsapp_number');
    await queryInterface.removeColumn('users', 'twitter_url');
  }
};
