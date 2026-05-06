import * as z from 'zod';

const cardTxStatus = z.enum(['PENDING', 'SETTLED', 'DECLINED', 'REFUNDED']);

export const ParsedCardTxSchema = z.object({
  externalId: z.string().min(1).max(512),
  occurredAt: z
    .string()
    .min(10)
    .max(40)
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid occurredAt'),
  merchantName: z.string().min(1).max(512),
  merchantRaw: z.string().max(2048).nullable().optional(),
  fiatAmount: z.string().regex(/^-?\d+(\.\d+)?$/),
  fiatCurrency: z.string().min(1).max(8),
  cryptoAmount: z.string().regex(/^-?\d+(\.\d+)?$/).nullable(),
  cryptoSymbol: z.string().max(32).nullable(),
  status: cardTxStatus,
  parserVersion: z.number().int().min(1).max(999),
  rawHtml: z.string().max(65535).nullable().optional(),
  /** e.g. MetaMask UI `0x4e******4d6f` — used to tighten holdings matching */
  fundingSourceMasked: z.string().max(64).nullable().optional(),
});

export type ParsedCardTxDto = z.infer<typeof ParsedCardTxSchema>;

export const CardSyncBodySchema = z.object({
  parserVersion: z.number().int().min(1).max(999),
  items: z.array(ParsedCardTxSchema).max(500),
});

export type CardSyncBodyDto = z.infer<typeof CardSyncBodySchema>;
