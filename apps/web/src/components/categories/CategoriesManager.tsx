'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useSeedDefaultCategories,
} from '@/hooks/api/useCategories';
import { CreateCategorySchema, type CreateCategoryDto } from '@crypto-tracker/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, Trash2, Wand2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Category } from '@crypto-tracker/shared';

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

interface DialogState {
  open: boolean;
  parentId?: string;
  parentName?: string;
}

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const seedDefaults = useSeedDefaultCategories();
  const deleteCategory = useDeleteCategory();
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryDto>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: { color: '#3b82f6', icon: 'tag', name: '' },
  });

  const selectedColor = watch('color');

  const openNewCategory = () => {
    reset({ color: '#3b82f6', icon: 'tag', name: '' });
    setDialogState({ open: true });
  };

  const openNewSubcategory = (parent: Category) => {
    reset({ color: parent.color, icon: parent.icon, name: '' });
    setDialogState({ open: true, parentId: parent.id, parentName: parent.name });
  };

  const closeDialog = () => {
    setDialogState({ open: false });
    reset();
  };

  const onSubmit = async (data: CreateCategoryDto) => {
    await createCategory.mutateAsync({
      ...data,
      parentId: dialogState.parentId,
    });
    closeDialog();
  };

  const userCategories = categories.filter((category) => !category.isSystem);
  const totalCount = userCategories.reduce((sum, c) => sum + 1 + (c.subCategories?.length ?? 0), 0);
  const setupError = seedDefaults.error;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg animate-pulse bg-muted/35" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/72">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              My categories
              {totalCount > 0 ? (
                <Badge variant="secondary" className="text-xs font-normal">
                  {totalCount} total
                </Badge>
              ) : null}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Create labels for card spend. Transactions auto-categorize in the background.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {userCategories.length === 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={seedDefaults.isPending}
                onClick={() => void seedDefaults.mutateAsync(undefined)}
              >
                <Wand2 className="h-4 w-4" />
                {seedDefaults.isPending ? 'Creating...' : 'Create default categories'}
              </Button>
            ) : null}
            <Button size="sm" className="gap-1.5" onClick={openNewCategory}>
              <Plus className="h-4 w-4" />
              New category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {setupError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not create defaults</AlertTitle>
              <AlertDescription>{setupError.message}</AlertDescription>
            </Alert>
          ) : null}
          {userCategories.length === 0 ? (
            <Card className="border-dashed bg-background/45">
              <CardContent className="px-4 py-0">
                <EmptyState
                  icon="🏷️"
                  title="No categories yet"
                  description="Set up the starter categories or create your own to organize card spend and unlock analytics."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {userCategories.map((cat) => (
                <div key={cat.id} className="rounded-lg border border-border/70 bg-background/55 overflow-hidden">
                  {/* Parent row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="h-8 w-8 rounded-full shrink-0 ring-2 ring-background/70"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{cat.name}</p>
                    </div>
                    {(cat.subCategories?.length ?? 0) > 0 && (
                      <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5">
                        {cat.subCategories!.length}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-7 px-2 gap-1 text-xs text-muted-foreground"
                      onClick={() => openNewSubcategory(cat)}
                    >
                      <Plus className="h-3 w-3" />
                      Sub
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCategory.mutate(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Subcategory rows */}
                  {(cat.subCategories?.length ?? 0) > 0 && (
                    <div className="border-t border-border/50 bg-muted/20">
                      {cat.subCategories!.map((sub, idx) => (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-3 pl-8 pr-4 py-2 ${idx < cat.subCategories!.length - 1 ? 'border-b border-border/40' : ''}`}
                        >
                          <div
                            className="h-5 w-5 rounded-full shrink-0 ring-1 ring-background/70"
                            style={{ backgroundColor: sub.color }}
                          />
                          <p className="flex-1 min-w-0 truncate text-xs font-medium text-muted-foreground">{sub.name}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteCategory.mutate(sub.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared create dialog */}
      <Dialog open={dialogState.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.parentName ? `Add subcategory to ${dialogState.parentName}` : 'Create category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder={dialogState.parentName ? `e.g. Taxi & rideshare, Parking` : 'e.g. Food, Subscriptions'}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === color ? 'scale-110 border-foreground' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <Input type="color" className="h-10 w-16 cursor-pointer p-1" {...register('color')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Icon name</Label>
              <Input placeholder="e.g. shopping-cart, coffee" {...register('icon')} />
              <p className="text-xs text-muted-foreground">Lucide icon name</p>
            </div>
            {createCategory.error && (
              <p className="text-sm text-destructive">{createCategory.error.message}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCategory.isPending}>
                {createCategory.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
