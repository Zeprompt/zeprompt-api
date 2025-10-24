"use strict";

const crypto = require("crypto");
const { randomUUID } = require("crypto");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // -------------------------
    // Helpers
    // -------------------------
    const getTimestamp = () => now;
    const generateHash = (title, content, contentType) =>
      crypto
        .createHash("sha256")
        .update(`${title}|${content}|${contentType}`)
        .digest("hex");

    // -------------------------
    // Users
    // -------------------------
    const userId = randomUUID();
    const passwordHash = await require("../utils/passwordUtils").hashPassword(
      "Binks1224"
    );

    const users = [
      {
        id: userId,
        username: "3d3m",
        email: "ekpomachi@gmail.com",
        password: passwordHash,
        role: "user",
        emailverificationtoken: true,
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      },
    ];

    await queryInterface.bulkInsert("users", users, {});

    // -------------------------
    // Tags
    // -------------------------
    const tagNames = ["ai", "seo", "marketing", "pdf", "tutorial"];
    const tags = tagNames.map((name) => ({
      id: randomUUID(),
      name,
      createdAt: getTimestamp(),
      updatedAt: getTimestamp(),
    }));

    const tagMap = Object.fromEntries(tags.map((t) => [t.name, t.id]));

    await queryInterface.bulkInsert("tags", tags, {});

    // -------------------------
    // Prompts
    // -------------------------
    const promptData = [
      {
        title: "AI SEO Prompt",
        content: "Write a SEO-optimized article about AI for marketing.",
        content_type: "text",
        pdf_file_path: null,
        pdf_file_size: null,
        pdf_original_name: null,
        views: 5,
        is_public: true,
      },
      {
        title: "Marketing Strategy PDF",
        content: "Brief for the PDF prompt.",
        content_type: "pdf",
        pdf_file_path: "uploads/pdfs/sample1.pdf",
        pdf_file_size: 123456,
        pdf_original_name: "strategy.pdf",
        views: 3,
        is_public: true,
      },
      {
        title: "Tutorial: Onboarding",
        content: "Create onboarding prompts for new users.",
        content_type: "text",
        pdf_file_path: null,
        pdf_file_size: null,
        pdf_original_name: null,
        views: 8,
        is_public: true,
      },
    ];

    const prompts = promptData.map((p) => {
      const id = randomUUID();
      return {
        id,
        title: p.title,
        content: p.content,
        content_type: p.content_type,
        pdf_file_path: p.pdf_file_path,
        pdf_file_size: p.pdf_file_size,
        pdf_original_name: p.pdf_original_name,
        user_id: userId,
        is_public: p.is_public,
        views: p.views,
        hash: generateHash(p.title, p.content, p.content_type),
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      };
    });

    await queryInterface.bulkInsert("prompts", prompts, {});

    // -------------------------
    // Prompt Tags
    // -------------------------
    const promptTagsData = [
      { promptIndex: 0, tags: ["ai", "seo"] },
      { promptIndex: 1, tags: ["marketing", "pdf", "ai"] },
      { promptIndex: 2, tags: ["tutorial", "marketing"] },
    ];

    const promptTags = [];
    promptTagsData.forEach((pt) => {
      pt.tags.forEach((tagName) => {
        promptTags.push({
          prompt_id: prompts[pt.promptIndex].id,
          tag_id: tagMap[tagName],
          createdAt: getTimestamp(),
          updatedAt: getTimestamp(),
        });
      });
    });

    await queryInterface.bulkInsert("prompt_tags", promptTags, {});
  },

  async down(queryInterface, Sequelize) {
    const titles = [
      "AI SEO Prompt",
      "Marketing Strategy PDF",
      "Tutorial: Onboarding",
    ];
    const tagNames = ["ai", "seo", "marketing", "pdf", "tutorial"];

    await queryInterface.sequelize.query(
      `DELETE FROM "prompt_tags" WHERE prompt_id IN (SELECT id FROM "prompts" WHERE title IN (:titles));`,
      { replacements: { titles } }
    );
    await queryInterface.bulkDelete(
      "prompts",
      { title: { [Sequelize.Op.in]: titles } },
      {}
    );
    await queryInterface.bulkDelete(
      "tags",
      { name: { [Sequelize.Op.in]: tagNames } },
      {}
    );
    await queryInterface.bulkDelete(
      "users",
      { email: "ekpomachi@gmail.com" },
      {}
    );
  },
};
