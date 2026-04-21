'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/api/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Zap, ArrowRight, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface LocalRule {
  id: string;
  name: string;
  field: string;
  op: string;
  value: string;
  categoryId: string;
  isActive: boolean;
}

const FIELD_OPTIONS = [
  { value: 'toAddress', label: 'To Address' },
  { value: 'fromAddress', label: 'From Address' },
  { value: 'txType', label: 'Transaction Type' },
];

const OP_OPTIONS = [
  { value: 'eq', label: 'equals' },
  { value: 'contains', label: 'contains' },
  { value: 'startsWith', label: 'starts with' },
];

export function RulesManager() {
  const { data: categories = [] } = useCategories();
  const [rules, setRules] = useState<LocalRule[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    field: 'toAddress',
    op: 'eq',
    value: '',
    categoryId: '',
  });

  const handleCreate = () => {
    if (!form.name || !form.value || !form.categoryId) return;
    setRules((prev) => [...prev, { ...form, id: crypto.randomUUID(), isActive: true }]);
    setForm({ name: '', field: 'toAddress', op: 'eq', value: '', categoryId: '' });
    setOpen(false);
  };

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/72">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Automation rules</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Create lightweight conditions that automatically apply a category when a transaction matches.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                New rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Rule name</Label>
                  <Input
                    placeholder="e.g. Binance deposits"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Condition</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Select value={form.field} onValueChange={(value) => setForm({ ...form, field: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={form.op} onValueChange={(value) => setForm({ ...form, op: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OP_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="0x... or value"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Assign category</Label>
                  <Select value={form.categoryId} onValueChange={(value) => setForm({ ...form, categoryId: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create rule</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <Card className="border-dashed bg-background/45 shadow-none">
              <CardContent className="py-16 text-center">
                <Zap className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold">No rules yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Create rules to automatically categorize transactions. For example:
                  &ldquo;If to address = 0x123… → Binance&rdquo;
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const category = categories.find((c) => c.id === rule.categoryId);
                const fieldLabel = FIELD_OPTIONS.find((f) => f.value === rule.field)?.label ?? rule.field;
                const opLabel = OP_OPTIONS.find((o) => o.value === rule.op)?.label ?? rule.op;

                return (
                  <div
                    key={rule.id}
                    className={`flex items-center gap-4 rounded-[1.6rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl ${!rule.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{rule.name}</p>
                        {!rule.isActive && <Badge variant="outline" className="bg-muted/55 text-xs">Paused</Badge>}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted/60 px-2 py-1">{fieldLabel}</span>
                        <span>{opLabel}</span>
                        <span className="max-w-40 truncate rounded-full bg-muted/60 px-2 py-1 font-mono">
                          {rule.value}
                        </span>
                        <ArrowRight className="h-3 w-3" />
                        {category && (
                          <span
                            className="rounded-full px-2 py-1 text-xs font-medium text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => toggleRule(rule.id)}
                      >
                        {rule.isActive ? (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
