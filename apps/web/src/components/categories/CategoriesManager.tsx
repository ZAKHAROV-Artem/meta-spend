'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories, useCreateCategory, useCreateDefaultCategories, useDeleteCategory } from '@/hooks/api/useCategories';
import { CreateCategorySchema, type CreateCategoryDto } from '@crypto-tracker/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wand2 } from 'lucide-react';

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const createDefaultCategories = useCreateDefaultCategories();
  const deleteCategory = useDeleteCategory();
  const [open, setOpen] = useState(false);

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

  const onSubmit = async (data: CreateCategoryDto) => {
    await createCategory.mutateAsync(data);
    reset();
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-44 rounded-lg animate-pulse bg-muted/35" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/72">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">My categories</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Create labels for card spend (new transactions auto-categorize in the background when possible).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 0 && <Badge variant="secondary">{categories.length} total</Badge>}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={createDefaultCategories.isPending}
              onClick={() => createDefaultCategories.mutate()}
            >
              <Wand2 className="h-4 w-4" />
              {createDefaultCategories.isPending ? 'Adding...' : 'Add defaults'}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  New category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create category</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input placeholder="e.g. Food, Subscriptions" {...register('name')} />
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
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <Card className="border-dashed bg-background/45">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No categories yet. Add defaults or create your own to organize card spend.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/55 px-4 py-4"
                >
                  <div className="h-9 w-9 rounded-full shrink-0 ring-4 ring-background/70" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{cat.name}</p>
                  </div>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
