'use client';

import { CardTitle } from '@/components/ui/card';
import {
  ChartRangePicker,
  type AnalyticsChartId,
} from '@/components/analytics/analytics-date-range';
import { cn } from '@/lib/utils';

export function AnalyticsChartHeader({
  chartId,
  title,
  description,
  trailing,
  className,
}: {
  chartId: AnalyticsChartId;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 flex-1">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description ? (
          <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {trailing}
        <ChartRangePicker chartId={chartId} />
      </div>
    </div>
  );
}
