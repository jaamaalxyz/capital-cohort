import { BudgetSummary, Category } from '../types';
import { formatCurrency } from './formatters';

export interface NotificationMessage {
  title: string;
  body: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  needs: 'Needs',
  wants: 'Wants',
  savings: 'Savings',
};

export function buildOverBudgetMessage(
  category: Category,
  overBy: number,
  currency: string
): NotificationMessage {
  return {
    title: '⚠️ Over Budget Alert',
    body: `${CATEGORY_LABELS[category]} is over budget by ${formatCurrency(Math.abs(overBy), currency)}.`,
  };
}

export function buildDailyReminderMessage(): NotificationMessage {
  return {
    title: '💰 Daily Expense Reminder',
    body: "Don't forget to log today's expenses.",
  };
}

export function buildMonthEndSummaryMessage(
  summary: BudgetSummary,
  currency: string,
  month: string
): NotificationMessage {
  // Use month+02 to ensure we get a valid date (safest way to get month name)
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  const monthName = date.toLocaleString('default', { month: 'long' });
  
  const withinBudget = summary.totalRemaining >= 0;
  const statusText = withinBudget
    ? `You stayed within budget!`
    : `You exceeded your budget.`;
    
  return {
    title: `📊 ${monthName} Summary`,
    body: `Spendings for ${monthName}: You spent ${formatCurrency(summary.totalSpent, currency)} this month. ${statusText}`,
  };
}

export function buildWeeklyDigestMessage(
  summary: BudgetSummary,
  currency: string
): NotificationMessage {
  return {
    title: '📅 Weekly Spending Digest',
    body: `So far this month: ${formatCurrency(summary.totalSpent, currency)} spent.`,
  };
}
