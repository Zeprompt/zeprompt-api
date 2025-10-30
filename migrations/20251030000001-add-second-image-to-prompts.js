'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ajouter les champs pour la deuxième image
    await queryInterface.addColumn('prompts', 'image2_path', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Chemin vers la deuxième image facultative du prompt texte',
    });

    await queryInterface.addColumn('prompts', 'image2_file_size', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Taille du fichier image 2 en octets',
    });

    await queryInterface.addColumn('prompts', 'image2_original_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Nom original du fichier image 2',
    });

    await queryInterface.addColumn('prompts', 'image2_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL de la deuxième image dans R2',
    });

    await queryInterface.addColumn('prompts', 'thumbnail2_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL du thumbnail de la deuxième image dans R2',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('prompts', 'image2_path');
    await queryInterface.removeColumn('prompts', 'image2_file_size');
    await queryInterface.removeColumn('prompts', 'image2_original_name');
    await queryInterface.removeColumn('prompts', 'image2_url');
    await queryInterface.removeColumn('prompts', 'thumbnail2_url');
  },
};

