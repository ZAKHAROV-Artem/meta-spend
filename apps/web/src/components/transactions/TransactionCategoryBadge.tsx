import type { Transaction } from '@crypto-tracker/shared';

type Props = { transaction: Pick<Transaction, 'categoryName' | 'categoryColor'> };

export function TransactionCategoryBadge({ transaction }: Props) {
  const label = transaction.categoryName ?? 'Uncategorized';
  return (
    <span
      title={label}
      className="inline-flex max-w-[10rem] shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium leading-none text-foreground shadow-sm"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full ring-1 ring-border/60"
        style={{ backgroundColor: transaction.categoryColor ?? '#94a3b8' }}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
