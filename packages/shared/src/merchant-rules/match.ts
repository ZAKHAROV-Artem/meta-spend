import { normalizeMerchantKey } from '../utils/normalizeMerchantKey';

export type MerchantRuleCondition = { type: 'merchant_normalized_contains'; needle: string };

export function merchantMatchesCondition(
  merchantName: string | null | undefined,
  condition: MerchantRuleCondition,
): boolean {
  if (merchantName == null || merchantName === '') return false;

  const haystack = normalizeMerchantKey(merchantName);

  if (condition.type === 'merchant_normalized_contains') {
    const needle = normalizeMerchantKey(condition.needle);
    if (!needle) return false;
    return haystack.includes(needle);
  }

  return false;
}

export interface MerchantRuleMatchRow {
  categoryId: string;
  condition: MerchantRuleCondition;
}

/** First win: `rules` must already be ordered by priority (e.g. descending). */
export function firstMatchingCategoryId(
  merchantName: string | null | undefined,
  rules: ReadonlyArray<MerchantRuleMatchRow>,
): string | null {
  for (const rule of rules) {
    if (merchantMatchesCondition(merchantName, rule.condition)) {
      return rule.categoryId;
    }
  }
  return null;
}
