const { z } = require('zod');

const createTagSchema = z.object({
  name: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }).max(50).trim(),
});

const updateTagSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
});

module.exports = { createTagSchema, updateTagSchema };
