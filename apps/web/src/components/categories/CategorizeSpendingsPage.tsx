'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, CircleDashed } from 'lucide-react';
import { useBulkCategorize, useUniqueMerchants } from '@/hooks/api/useTransactions';
import { useCategories } from '@/hooks/api/useCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { UniqueMerchant } from '@crypto-tracker/shared';

type FilterTab = 'all' | 'uncategorized' | 'categorized';

const UNCATEGORIZED_VALUE = '__uncategorized__';

function sourceLabel(source: UniqueMerchant['source']) {
  return source === 'CARD' ? 'Card' : source;
}

export function CategorizeSpendingsPage() {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const { data: merchants = [], isLoading: merchantsLoading, error: merchantsError } = useUniqueMerchants('ALL');
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const bulkCategorize = useBulkCategorize();

  const userCategories = useMemo(
    () => categories.filter((category) => !category.isSystem),
    [categories],
  );

  const categorized = merchants.filter((merchant) => Boolean(merchant.categoryId)).length;
  const total = merchants.length;
  const progress = total > 0 ? Math.round((categorized / total) * 100) : 0;

  const filteredMerchants = useMemo(() => {
    if (filterTab === 'categorized') return merchants.filter((merchant) => merchant.categoryId);
    if (filterTab === 'uncategorized') return merchants.filter((merchant) => !merchant.categoryId);
    return merchants;
  }, [filterTab, merchants]);

  const isLoading = merchantsLoading || categoriesLoading;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
            <Link href="/categories">
              <ArrowLeft className="h-4 w-4" />
              Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Categorize Spendings</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Assign one category to every matching merchant in a single move.
            </p>
          </div>
        </div>
        <Badge variant={progress === 100 && total > 0 ? 'default' : 'secondary'}>
          {categorized} / {total} merchants categorized
        </Badge>
      </div>

      <Card>
        <CardContent className="space-y-3 px-5 py-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={filterTab} onValueChange={(value) => setFilterTab(value as FilterTab)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="uncategorized">Uncategorized</TabsTrigger>
                <TabsTrigger value="categorized">Categorized</TabsTrigger>
              </TabsList>
            </Tabs>
            {bulkCategorize.isPending ? (
              <Badge variant="outline">Saving...</Badge>
            ) : bulkCategorize.error ? (
              <Badge variant="destructive">{bulkCategorize.error.message}</Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-5 pb-3 pt-4">
          <CardTitle className="text-base font-semibold">Merchant groups</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {isLoading ? (
            <div className="space-y-2 px-5 pb-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : merchantsError ? (
            <p className="px-5 pb-4 text-sm text-destructive">{merchantsError.message}</p>
          ) : filteredMerchants.length === 0 ? (
            <div className="px-5 pb-5 text-sm text-muted-foreground">
              No merchants match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-5 py-2.5">Merchant name</th>
                    <th className="px-3 py-2.5">Source</th>
                    <th className="px-3 py-2.5">Count</th>
                    <th className="px-5 py-2.5">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((merchant) => (
                    <tr key={`${merchant.source}:${merchant.key}`} className="border-b last:border-0">
                      <td className="max-w-[320px] px-5 py-3">
                        <div className="flex items-center gap-2">
                          {merchant.categoryId ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          ) : (
                            <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate font-medium">{merchant.displayName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{sourceLabel(merchant.source)}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="secondary">{merchant.count}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Select
                          value={merchant.categoryId ?? UNCATEGORIZED_VALUE}
                          disabled={bulkCategorize.isPending || userCategories.length === 0}
                          onValueChange={(value) =>
                            bulkCategorize.mutate({
                              key: merchant.key,
                              source: merchant.source,
                              categoryId: value === UNCATEGORIZED_VALUE ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="w-[240px] max-w-full">
                            <SelectValue placeholder="Choose category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNCATEGORIZED_VALUE}>Uncategorized</SelectItem>
                            {userCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span
                                  className={cn('h-2.5 w-2.5 rounded-full')}
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
