import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings as SettingsIcon, Palette, Tags, Target, RotateCcw, X, Plus, Banknote, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Settings() {
  const {
    state,
    setTheme,
    addCustomCategory,
    removeCustomCategory,
    addBudget,
    removeBudget,
    updateCashBalance,
    resetAllData,
    exportData,
    importData,
  } = useFinance();

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [cashInput, setCashInput] = useState(String(state.cashBalance));
  const [confirmReset, setConfirmReset] = useState(false);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return toast.error('Enter a category name');
    addCustomCategory(newCatType, newCatName.trim());
    setNewCatName('');
    toast.success(`Category "${newCatName.trim()}" added`);
  };

  const handleAddBudget = () => {
    if (!budgetCategory || !budgetLimit) return toast.error('Fill in all fields');
    addBudget({ category: budgetCategory, limit: parseFloat(budgetLimit) });
    setBudgetCategory('');
    setBudgetLimit('');
    toast.success('Budget set successfully');
  };

  const handleCashUpdate = () => {
    updateCashBalance(parseFloat(cashInput) || 0);
    toast.success('Cash balance updated');
  };

  const handleReset = () => {
    resetAllData();
    setConfirmReset(false);
    toast.success('All data has been reset');
  };

  const allExpenseCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...state.customCategories.expense];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-card-foreground">Theme</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['light', 'dark', 'gradient'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => setTheme(theme)}
                className={cn(
                  'rounded-lg p-3 text-sm font-medium capitalize transition-all border',
                  state.theme === theme
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30'
                )}
              >
                {theme}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cash Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-cash" />
            <h3 className="font-semibold text-card-foreground">Initial Cash Balance</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Set your starting cash in hand (separate from bank transactions)
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              value={cashInput}
              onChange={e => setCashInput(e.target.value)}
              className="font-mono bg-secondary/50"
              placeholder="0"
            />
            <Button onClick={handleCashUpdate}>Update</Button>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-vault" />
            <h3 className="font-semibold text-card-foreground">Custom Categories</h3>
          </div>

          <div className="flex gap-2">
            <Select value={newCatType} onValueChange={(v) => setNewCatType(v as 'income' | 'expense')}>
              <SelectTrigger className="w-[110px] bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Category name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="bg-secondary/50"
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <Button size="icon" onClick={handleAddCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Custom categories list */}
          {(state.customCategories.income.length > 0 || state.customCategories.expense.length > 0) && (
            <div className="space-y-2">
              {state.customCategories.income.map(c => (
                <div key={`i-${c}`} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-card-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-income" />
                    {c} <span className="text-xs text-muted-foreground">(income)</span>
                  </span>
                  <button onClick={() => removeCustomCategory('income', c)} className="text-muted-foreground hover:text-expense">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {state.customCategories.expense.map(c => (
                <div key={`e-${c}`} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-card-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-expense" />
                    {c} <span className="text-xs text-muted-foreground">(expense)</span>
                  </span>
                  <button onClick={() => removeCustomCategory('expense', c)} className="text-muted-foreground hover:text-expense">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-expense" />
            <h3 className="font-semibold text-card-foreground">Monthly Budgets</h3>
          </div>

          <div className="flex gap-2">
            <Select value={budgetCategory} onValueChange={setBudgetCategory}>
              <SelectTrigger className="flex-1 bg-secondary/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {allExpenseCategories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Limit ₹"
              value={budgetLimit}
              onChange={e => setBudgetLimit(e.target.value)}
              className="w-28 font-mono bg-secondary/50"
            />
            <Button size="icon" onClick={handleAddBudget}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {state.budgets.length > 0 && (
            <div className="space-y-2">
              {state.budgets.map(b => (
                <div key={b.category} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-card-foreground">{b.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">₹{b.limit.toLocaleString()}</span>
                    <button onClick={() => removeBudget(b.category)} className="text-muted-foreground hover:text-expense">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Export / Import */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-card-foreground">Backup & Restore</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Export your data as a JSON file for backup, or import a previously exported file to restore.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const blob = new Blob([exportData()], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success('Data exported successfully');
            }}
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const result = ev.target?.result as string;
                  if (importData(result)) {
                    toast.success('Data imported successfully');
                  } else {
                    toast.error('Invalid backup file');
                  }
                };
                reader.readAsText(file);
              };
              input.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
        </div>
      </motion.div>

      {/* Reset */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-expense" />
            <div>
              <h3 className="font-semibold text-card-foreground">Reset All Data</h3>
              <p className="text-xs text-muted-foreground">This will permanently delete all transactions, budgets, and settings.</p>
            </div>
          </div>
          <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">Reset</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleReset}>Yes, Reset Everything</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
    </div>
  );
}
