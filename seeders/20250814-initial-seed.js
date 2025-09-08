'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
  // Helpers
  const { randomUUID } = require('crypto');
  const now = new Date();

  // Create a user with verified email
  const userId = randomUUID();
  const passwordHash = await require('../utils/passwordUtils').hashPassword('Binks1224');

    await queryInterface.bulkInsert('users', [
      {
        id: userId,
        username: '3d3m',
        email: 'ekpomachi@gmail.com',
        password: passwordHash,
        role: 'user',
        emailverificationtoken: true, // mapped via field to emailVerified
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Create tags
    const tagIds = {};
    const tags = ['ai', 'seo', 'marketing', 'pdf', 'tutorial'];
    for (const name of tags) {
      tagIds[name] = randomUUID();
    }

    await queryInterface.bulkInsert('tags', Object.entries(tagIds).map(([name, id]) => ({
      id,
      name,
      createdAt: now,
      updatedAt: now,
    })));

    // Create 3 prompts linked to the user
  const promptIds = [randomUUID(), randomUUID(), randomUUID()];

    const prompts = [
      {
        id: promptIds[0],
        title: 'AI SEO Prompt',
        content: 'Write a SEO-optimized article about AI for marketing.',
        content_type: 'text',
        user_id: userId,
        is_public: true,
        views: 5,
  createdAt: now,
  updatedAt: now,
      },
      {
        id: promptIds[1],
        title: 'Marketing Strategy PDF',
        content: 'Brief for the PDF prompt.',
        content_type: 'pdf',
        pdf_file_path: 'uploads/pdfs/sample1.pdf',
        pdf_file_size: 123456,
        pdf_original_name: 'strategy.pdf',
        user_id: userId,
        is_public: true,
        views: 3,
  createdAt: now,
  updatedAt: now,
      },
      {
        id: promptIds[2],
        title: 'Tutorial: Onboarding',
        content: 'Create onboarding prompts for new users.',
        content_type: 'text',
        user_id: userId,
        is_public: true,
        views: 8,
  createdAt: now,
  updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('prompts', prompts);

    // Link prompts to tags (2-3 tags per prompt)
    const promptTags = [
      // AI SEO Prompt -> ai, seo
      { prompt_id: promptIds[0], tag_id: tagIds['ai'], createdAt: now, updatedAt: now },
      { prompt_id: promptIds[0], tag_id: tagIds['seo'], createdAt: now, updatedAt: now },
      // Marketing Strategy PDF -> marketing, pdf, ai
      { prompt_id: promptIds[1], tag_id: tagIds['marketing'], createdAt: now, updatedAt: now },
      { prompt_id: promptIds[1], tag_id: tagIds['pdf'], createdAt: now, updatedAt: now },
      { prompt_id: promptIds[1], tag_id: tagIds['ai'], createdAt: now, updatedAt: now },
      // Tutorial Onboarding -> tutorial, marketing
      { prompt_id: promptIds[2], tag_id: tagIds['tutorial'], createdAt: now, updatedAt: now },
      { prompt_id: promptIds[2], tag_id: tagIds['marketing'], createdAt: now, updatedAt: now },
    ];

    await queryInterface.bulkInsert('prompt_tags', promptTags);
  },

  async down(queryInterface, Sequelize) {
    // Delete prompt_tags for the created prompts (by title)
    const titles = ['AI SEO Prompt', 'Marketing Strategy PDF', 'Tutorial: Onboarding'];
    await queryInterface.sequelize.query(
      `DELETE FROM "prompt_tags" WHERE prompt_id IN (SELECT id FROM "prompts" WHERE title IN (:titles));`,
      { replacements: { titles } }
    );
    await queryInterface.bulkDelete('prompts', { title: { [Sequelize.Op.in]: titles } }, {});
    await queryInterface.bulkDelete('tags', { name: { [Sequelize.Op.in]: ['ai', 'seo', 'marketing', 'pdf', 'tutorial'] } }, {});
    await queryInterface.bulkDelete('users', { email: 'ekpomachi@gmail.com' }, {});
  },
};
