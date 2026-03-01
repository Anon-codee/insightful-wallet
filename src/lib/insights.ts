import { Transaction } from '@/types/finance';

export interface Insight {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'positive' | 'negative';
  icon: string;
}

function getMonthTransactions(transactions: Transaction[], month: number, year: number) {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

function getPrevMonthTransactions(transactions: Transaction[], month: number, year: number) {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  return getMonthTransactions(transactions, prevMonth, prevYear);
}

export function generateInsights(transactions: Transaction[]): Insight[] {
  if (transactions.length < 2) {
    return [{
      id: 'getting-started',
      text: 'Add more transactions to unlock spending insights and patterns.',
      type: 'info',
      icon: '💡',
    }];
  }

  const insights: Insight[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTx = getMonthTransactions(transactions, currentMonth, currentYear);
  const prevMonthTx = getPrevMonthTransactions(transactions, currentMonth, currentYear);
  const expenses = thisMonthTx.filter(t => t.type === 'expense');
  const prevExpenses = prevMonthTx.filter(t => t.type === 'expense');

  // Category comparison vs last month
  if (prevExpenses.length > 0 && expenses.length > 0) {
    const catTotals: Record<string, number> = {};
    const prevCatTotals: Record<string, number> = {};
    expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    prevExpenses.forEach(t => { prevCatTotals[t.category] = (prevCatTotals[t.category] || 0) + t.amount; });

    let maxIncrease = { category: '', pct: 0 };
    Object.keys(catTotals).forEach(cat => {
      if (prevCatTotals[cat] && prevCatTotals[cat] > 0) {
        const pct = ((catTotals[cat] - prevCatTotals[cat]) / prevCatTotals[cat]) * 100;
        if (pct > maxIncrease.pct) maxIncrease = { category: cat, pct };
      }
    });

    if (maxIncrease.pct > 10) {
      insights.push({
        id: 'cat-increase',
        text: `You spent ${Math.round(maxIncrease.pct)}% more on ${maxIncrease.category} this month than last month.`,
        type: 'warning',
        icon: '📈',
      });
    }
  }

  // Weekend vs weekday spending
  if (expenses.length > 0) {
    let weekdayTotal = 0, weekendTotal = 0;
    expenses.forEach(t => {
      const day = new Date(t.date).getDay();
      if (day === 0 || day === 6) weekendTotal += t.amount;
      else weekdayTotal += t.amount;
    });
    const total = weekdayTotal + weekendTotal;
    if (total > 0) {
      const weekendPct = Math.round((weekendTotal / total) * 100);
      if (weekendPct > 40) {
        insights.push({
          id: 'weekend-spending',
          text: `Weekends account for ${weekendPct}% of your spending this month.`,
          type: 'warning',
          icon: '🗓️',
        });
      } else {
        insights.push({
          id: 'weekday-spending',
          text: `Weekday spending dominates at ${100 - weekendPct}% of your total expenses.`,
          type: 'info',
          icon: '📊',
        });
      }
    }
  }

  // Month-part spending
  if (expenses.length > 0) {
    let start = 0, mid = 0, end = 0;
    expenses.forEach(t => {
      const day = new Date(t.date).getDate();
      if (day <= 10) start += t.amount;
      else if (day <= 20) mid += t.amount;
      else end += t.amount;
    });

    const parts = [
      { label: 'first 10 days', amount: start },
      { label: 'mid month (11-20)', amount: mid },
      { label: 'last 10 days', amount: end },
    ];
    const highest = parts.reduce((a, b) => a.amount > b.amount ? a : b);
    if (highest.amount > 0) {
      insights.push({
        id: 'month-part',
        text: `Most spending happens in the ${highest.label} of the month.`,
        type: 'info',
        icon: '📅',
      });
    }
  }

  // Top 2 categories combined percentage
  if (expenses.length > 0) {
    const catTotals: Record<string, number> = {};
    expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (sorted.length >= 2) {
      const total = expenses.reduce((s, t) => s + t.amount, 0);
      const topTwoPct = Math.round(((sorted[0][1] + sorted[1][1]) / total) * 100);
      insights.push({
        id: 'top-categories',
        text: `${sorted[0][0]} + ${sorted[1][0]} = ${topTwoPct}% of total expenses.`,
        type: 'info',
        icon: '🏷️',
      });
    }
  }

  // Highest spending day
  if (expenses.length > 0) {
    const dayTotals: Record<string, number> = {};
    expenses.forEach(t => {
      dayTotals[t.date] = (dayTotals[t.date] || 0) + t.amount;
    });
    const maxDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
    if (maxDay) {
      const formatted = new Date(maxDay[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      insights.push({
        id: 'max-day',
        text: `Your biggest spending day was ${formatted} (₹${maxDay[1].toLocaleString()}).`,
        type: 'negative',
        icon: '💸',
      });
    }
  }

  return insights.slice(0, 4);
}
