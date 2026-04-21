import * as z from 'zod';

export const ExtensionPairBodySchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/),
});

export type ExtensionPairBodyDto = z.infer<typeof ExtensionPairBodySchema>;
