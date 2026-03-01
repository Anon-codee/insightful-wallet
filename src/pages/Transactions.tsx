import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Transaction } from '@/types/finance';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeftRight, Pencil, Trash2, TrendingUp, TrendingDown, EyeOff, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const months = [
  'All', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Transactions() {
  const { state, updateTransaction, deleteTransaction, toggleNeglect } = useFinance();
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const allCategories = ['All', ...new Set([
    ...DEFAULT_INCOME_CATEGORIES,
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...state.customCategories.income,
    ...state.customCategories.expense,
  ])];

  const filtered = state.transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;
    if (filterMonth !== 'All') {
      const monthIdx = months.indexOf(filterMonth) - 1;
      if (new Date(t.date).getMonth() !== monthIdx) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transaction deleted');
  };

  const handleUpdate = () => {
    if (!editTx) return;
    updateTransaction(editTx);
    setEditTx(null);
    toast.success('Transaction updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">{state.transactions.length} total transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[140px] bg-secondary/50">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] bg-secondary/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          {(['all', 'income', 'expense'] as const).map(t => (
            <Button
              key={t}
              size="sm"
              variant={filterType === t ? 'default' : 'outline'}
              onClick={() => setFilterType(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No transactions found with current filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors group",
                  tx.neglected && "opacity-50"
                )}
              >
                <div className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0',
                  tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                )}>
                  {tx.type === 'income' ? (
                    <TrendingUp className="h-4 w-4 text-income" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-expense" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {tx.shortDescription || tx.category}
                    </p>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground flex-shrink-0">
                      {tx.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(tx.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    {tx.detailedDescription && ` — ${tx.detailedDescription.slice(0, 50)}${tx.detailedDescription.length > 50 ? '...' : ''}`}
                  </p>
                </div>

                <span className={cn(
                  'font-mono text-sm font-semibold flex-shrink-0',
                  tx.type === 'income' ? 'text-income' : 'text-expense'
                )}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8", tx.neglected && "text-vault opacity-100")}
                    onClick={() => toggleNeglect(tx.id)}
                    title={tx.neglected ? "Include in reports" : "Neglect from reports"}
                  >
                    {tx.neglected ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTx({ ...tx })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-expense hover:text-expense" onClick={() => handleDelete(tx.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {tx.neglected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-vault/10 text-vault font-medium flex-shrink-0 opacity-100">
                    Neglected
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTx} onOpenChange={open => !open && setEditTx(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          {editTx && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount</Label>
                <Input
                  type="number"
                  value={editTx.amount}
                  onChange={e => setEditTx({ ...editTx, amount: parseFloat(e.target.value) || 0 })}
                  className="font-mono bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={editTx.date}
                  onChange={e => setEditTx({ ...editTx, date: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Short Description</Label>
                <Input
                  value={editTx.shortDescription}
                  onChange={e => setEditTx({ ...editTx, shortDescription: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Detailed Description</Label>
                <Textarea
                  value={editTx.detailedDescription}
                  onChange={e => setEditTx({ ...editTx, detailedDescription: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <Button onClick={handleUpdate} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
