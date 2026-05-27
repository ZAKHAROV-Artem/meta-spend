import * as z from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(32),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color'),
  icon: z.string().min(1),
  parentId: z.string().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
