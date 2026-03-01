import { useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { CategoryBreakdown } from '@/components/reports/CategoryBreakdown';
import { WeekdayVsWeekend, MonthPartSpending, MonthlyComparisonChart } from '@/components/reports/SpendingAnalysis';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  const { state } = useFinance();
  const activeTransactions = useMemo(
    () => state.transactions.filter(t => !t.neglected),
    [state.transactions]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Advanced spending analytics</p>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeekdayVsWeekend transactions={activeTransactions} />
        <MonthPartSpending transactions={activeTransactions} />
      </div>

      {/* Monthly Comparison */}
      <MonthlyComparisonChart transactions={activeTransactions} />

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Expense Breakdown by Category
        </h3>
        <CategoryBreakdown transactions={activeTransactions} type="expense" />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Income Breakdown by Category
        </h3>
        <CategoryBreakdown transactions={activeTransactions} type="income" />
      </div>
    </div>
  );
}
