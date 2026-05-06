import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

/** One row from the model — categoryId uses Prisma `cuid`, not UUID. */
const AssignmentItemSchema = z
  .object({
    merchantKey: z.string().min(1),
    categoryId: z.union([z.string().min(1), z.null()]),
    confidence: z.number().optional(),
    reason: z.string().optional(),
  })
  .strict();

export const AutoCategorizeAiResponseSchema = z
  .object({
    assignments: z.array(AssignmentItemSchema),
  })
  .strict();

export type AutoCategorizeAiResponse = z.infer<typeof AutoCategorizeAiResponseSchema>;

export function stripJsonFence(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  return match?.[1]?.trim() ?? trimmed;
}

export function parseAutoCategorizeAiPayload(jsonText: string): AutoCategorizeAiResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    throw new BadRequestException('Auto-categorize: AI returned invalid JSON');
  }
  const result = AutoCategorizeAiResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new BadRequestException(
      `Auto-categorize: AI response failed schema validation — ${result.error.message}`,
    );
  }
  return result.data;
}

export function validateAssignmentsForChunk(params: {
  assignments: AutoCategorizeAiResponse['assignments'];
  expectedKeys: ReadonlySet<string>;
  categoryIds: ReadonlySet<string>;
}): void {
  const { assignments, expectedKeys, categoryIds } = params;

  if (assignments.length !== expectedKeys.size) {
    throw new BadRequestException(
      `Auto-categorize: expected ${String(expectedKeys.size)} assignments, got ${String(assignments.length)}`,
    );
  }

  const seen = new Set<string>();

  for (const row of assignments) {
    if (!expectedKeys.has(row.merchantKey)) {
      throw new BadRequestException(`Auto-categorize: unexpected merchantKey "${row.merchantKey}"`);
    }
    if (seen.has(row.merchantKey)) {
      throw new BadRequestException(`Auto-categorize: duplicate merchantKey "${row.merchantKey}"`);
    }
    seen.add(row.merchantKey);

    if (row.categoryId !== null && !categoryIds.has(row.categoryId)) {
      throw new BadRequestException(`Auto-categorize: unknown categoryId "${row.categoryId}"`);
    }
  }

  for (const key of expectedKeys) {
    if (!seen.has(key)) {
      throw new BadRequestException(`Auto-categorize: missing merchantKey "${key}"`);
    }
  }
}
