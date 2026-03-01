import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TrendingDown } from 'lucide-react';

export default function AddExpense() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-expense/10">
          <TrendingDown className="h-5 w-5 text-expense" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Expense</h1>
          <p className="text-sm text-muted-foreground">Track your spending</p>
        </div>
      </div>
      <TransactionForm type="expense" />
    </div>
  );
}
