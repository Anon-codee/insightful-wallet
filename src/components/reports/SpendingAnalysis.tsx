import { Transaction } from '@/types/finance';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SpendingAnalysisProps {
  transactions: Transaction[];
}

export function WeekdayVsWeekend({ transactions }: SpendingAnalysisProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  let weekday = 0, weekend = 0;

  expenses.forEach(t => {
    const day = new Date(t.date).getDay();
    if (day === 0 || day === 6) weekend += t.amount;
    else weekday += t.amount;
  });

  const total = weekday + weekend;
  const weekdayPct = total > 0 ? Math.round((weekday / total) * 100) : 0;
  const weekendPct = total > 0 ? Math.round((weekend / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Weekday vs Weekend
      </h3>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-card-foreground">Mon–Fri</span>
            <span className="font-mono font-semibold text-card-foreground">₹{weekday.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${weekdayPct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{weekdayPct}%</span>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-card-foreground">Sat–Sun</span>
            <span className="font-mono font-semibold text-card-foreground">₹{weekend.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-vault transition-all duration-700" style={{ width: `${weekendPct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{weekendPct}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export function MonthPartSpending({ transactions }: SpendingAnalysisProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const parts = { 'Days 1–10': 0, 'Days 11–20': 0, 'Days 21–31': 0 };

  expenses.forEach(t => {
    const day = new Date(t.date).getDate();
    if (day <= 10) parts['Days 1–10'] += t.amount;
    else if (day <= 20) parts['Days 11–20'] += t.amount;
    else parts['Days 21–31'] += t.amount;
  });

  const data = Object.entries(parts).map(([name, amount]) => ({ name, amount }));
  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Month-Part Spending
      </h3>
      <div className="space-y-3">
        {data.map(({ name, amount }) => {
          const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          return (
            <div key={name} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-card-foreground">{name}</span>
                <span className="font-mono font-semibold text-card-foreground">₹{amount.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-expense transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function MonthlyComparisonChart({ transactions }: SpendingAnalysisProps) {
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
    if (t.type === 'income') monthlyData[key].income += t.amount;
    else monthlyData[key].expense += t.amount;
  });

  const chartData = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([key, data]) => {
      const [y, m] = key.split('-');
      const month = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-US', { month: 'short' });
      return { month, ...data };
    });

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 text-center text-muted-foreground"
      >
        Add transactions to see monthly comparison
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-4"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Monthly Comparison
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Bar dataKey="income" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-income" />
          <span className="text-muted-foreground">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-expense" />
          <span className="text-muted-foreground">Expense</span>
        </div>
      </div>
    </motion.div>
  );
}
