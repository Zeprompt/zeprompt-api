"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const { randomUUID } = require("crypto");
    const now = new Date();

    // Create an admin user with verified email
    const passwordHash = await require("../utils/passwordUtils").hashPassword(
      "AdminPass123"
    );

    await queryInterface.bulkInsert("users", [
      {
        id: randomUUID(),
        username: "admin",
        email: "admin@example.com",
        password: passwordHash,
        role: "admin",
        emailverificationtoken: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        username: "admin2",
        email: "admin2@example.com",
        password: passwordHash,
        role: "admin",
        emailverificationtoken: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        username: "admin3",
        email: "admin3@example.com",
        password: passwordHash,
        role: "admin",
        emailverificationtoken: true,
        createdAt: now,
        updatedAt: now,
      },
    ], {});
  },

  async down(queryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('users', { role: 'admin' }, {});
  },
};
