import { useState } from 'react';
import { Transaction } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  type?: 'income' | 'expense';
}

export function CategoryBreakdown({ transactions, type = 'expense' }: CategoryBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = transactions.filter(t => t.type === type);
  const catTotals: Record<string, { total: number; transactions: Transaction[] }> = {};

  filtered.forEach(t => {
    if (!catTotals[t.category]) catTotals[t.category] = { total: 0, transactions: [] };
    catTotals[t.category].total += t.amount;
    catTotals[t.category].transactions.push(t);
  });

  const sorted = Object.entries(catTotals).sort((a, b) => b[1].total - a[1].total);
  const grandTotal = filtered.reduce((s, t) => s + t.amount, 0);

  if (sorted.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center text-muted-foreground">
        No {type} transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map(([cat, data]) => {
        const isOpen = expanded === cat;
        const pct = grandTotal > 0 ? (data.total / grandTotal) * 100 : 0;

        return (
          <div key={cat} className="glass-card rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : cat)}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <span className="flex-1 font-medium text-sm text-card-foreground">{cat}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      type === 'expense' ? 'bg-expense' : 'bg-income'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-sm font-semibold text-card-foreground min-w-[80px] text-right">
                  ₹{data.total.toLocaleString()}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border px-4 py-2 space-y-1">
                    {data.transactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(tx => (
                        <div key={tx.id} className="flex items-center justify-between py-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-card-foreground">
                              {tx.shortDescription || 'No description'}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-medium text-card-foreground">
                            ₹{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
