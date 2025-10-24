'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create tags table
    await queryInterface.createTable('tags', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create join table prompt_tags
    await queryInterface.createTable('prompt_tags', {
      prompt_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'prompts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tags', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addConstraint('prompt_tags', {
      fields: ['prompt_id', 'tag_id'],
      type: 'primary key',
      name: 'pk_prompt_tags',
    });

    // Remove old tags array column from prompts if exists
    const table = await queryInterface.describeTable('prompts');
    if (table.tags) {
      await queryInterface.removeColumn('prompts', 'tags');
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('prompt_tags');
    await queryInterface.dropTable('tags');
  },
};
