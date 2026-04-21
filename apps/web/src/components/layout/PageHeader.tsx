import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-floating/80 px-5 py-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6',
        className,
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-primary/80">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
