import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TrendingUp } from 'lucide-react';

export default function AddIncome() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-income/10">
          <TrendingUp className="h-5 w-5 text-income" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Income</h1>
          <p className="text-sm text-muted-foreground">Record your earnings</p>
        </div>
      </div>
      <TransactionForm type="income" />
    </div>
  );
}
