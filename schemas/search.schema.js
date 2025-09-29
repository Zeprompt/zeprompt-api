const Joi = require("joi");

const searchSchema = Joi.object({
  query: Joi.string().allow("").optional(),
  filters: Joi.object({
    contentType: Joi.array()
      .items(Joi.string().valid("text", "pdf"))
      .optional(),
    tags: Joi.object({
      values: Joi.array().items(Joi.string()),
      operator: Joi.string().valid("AND", "OR").default("OR"),
    }).optional(),
    dateRange: Joi.object({
      start: Joi.date().iso(),
      end: Joi.date().iso().greater(Joi.ref("start")),
    }).optional(),
    minLikes: Joi.number().integer().min(0).optional(),
    minViews: Joi.number().integer().min(0).optional(),
    userId: Joi.string().uuid().optional(),
  }).optional(),
  sort: Joi.object({
    field: Joi.string()
      .valid("createdAt", "likes", "views", "title")
      .default("createdAt"),
    order: Joi.string().valid("ASC", "DESC").default("DESC"),
  }).optional(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }).optional(),
});

module.exports = searchSchema;
