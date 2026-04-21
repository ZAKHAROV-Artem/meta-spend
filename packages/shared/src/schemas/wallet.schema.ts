import * as z from 'zod';

export const CreateWalletSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address'),
  chainId: z.number().int().positive(),
  label: z.string().max(64).optional(),
});

export type CreateWalletInput = z.infer<typeof CreateWalletSchema>;
