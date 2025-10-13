'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('prompts', 'image_path', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Chemin vers l\'image facultative du prompt texte',
    });

    await queryInterface.addColumn('prompts', 'image_file_size', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Taille du fichier image en octets',
    });

    await queryInterface.addColumn('prompts', 'image_original_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Nom original du fichier image',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('prompts', 'image_path');
    await queryInterface.removeColumn('prompts', 'image_file_size');
    await queryInterface.removeColumn('prompts', 'image_original_name');
  },
};
