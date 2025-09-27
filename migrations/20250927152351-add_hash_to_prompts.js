"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("prompts", "hash", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addIndex("prompts", ["hash"], {
      unique: true,
      name: "unique_prompt_hash",
    });
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex("prompts", "unique_prompt_hash");
    await queryInterface.removeColumn("prompts", "hash");
  },
};
