import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'balance' | 'cash' | 'vault';
  subtitle?: string;
}

const variantStyles = {
  income: 'stat-glow-income border-income/20',
  expense: 'stat-glow-expense border-expense/20',
  balance: 'border-primary/20',
  cash: 'stat-glow-cash border-cash/20',
  vault: 'stat-glow-vault border-vault/20',
};

const iconStyles = {
  income: 'bg-income/10 text-income',
  expense: 'bg-expense/10 text-expense',
  balance: 'bg-primary/10 text-primary',
  cash: 'bg-cash/10 text-cash',
  vault: 'bg-vault/10 text-vault',
};

export function StatCard({ title, value, icon: Icon, variant, subtitle }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-card-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
