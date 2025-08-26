'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      prompt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'prompts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      anonymous_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_liked_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add index for querying likes by promptId
    await queryInterface.addIndex('likes', ['prompt_id']);
    
    // Add composite index for checking if a user/anonymous has already liked a prompt
    await queryInterface.addIndex('likes', ['prompt_id', 'user_id', 'anonymous_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('likes');
  },
};
