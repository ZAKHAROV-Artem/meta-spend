import { cn } from '@/lib/utils';

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl motion-safe:scroll-smooth', className)}>
      {children}
    </div>
  );
}
