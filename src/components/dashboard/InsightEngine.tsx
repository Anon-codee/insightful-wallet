import { motion } from 'framer-motion';
import { Insight } from '@/lib/insights';
import { cn } from '@/lib/utils';

const typeStyles = {
  info: 'border-primary/20 bg-primary/5',
  warning: 'border-vault/20 bg-vault/5',
  positive: 'border-income/20 bg-income/5',
  negative: 'border-expense/20 bg-expense/5',
};

interface InsightEngineProps {
  insights: Insight[];
}

export function InsightEngine({ insights }: InsightEngineProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
        Smart Insights
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={cn(
              'glass-card rounded-lg p-4 border transition-all duration-200 hover:scale-[1.01]',
              typeStyles[insight.type]
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{insight.icon}</span>
              <p className="text-sm text-card-foreground leading-relaxed">
                {insight.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
