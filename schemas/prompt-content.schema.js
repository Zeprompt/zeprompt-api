const { z } = require('zod');

// Validation conditionnelle: si contentType='text' => content requis, sinon pdfFilePath requis
const promptContentSchema = z.object({
  contentType: z.enum(['text', 'pdf']).default('text'),
  content: z.string().trim().optional().nullable(),
  pdfFilePath: z.string().trim().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.contentType === 'text') {
    if (!data.content || data.content.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['content'], message: 'content requis quand contentType = text' });
    }
  } else if (data.contentType === 'pdf') {
    if (!data.pdfFilePath || data.pdfFilePath.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pdfFilePath'], message: 'pdfFilePath requis quand contentType = pdf' });
    }
  }
});

module.exports = { promptContentSchema };
