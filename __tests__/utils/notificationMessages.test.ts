import {
  buildOverBudgetMessage,
  buildDailyReminderMessage,
  buildMonthEndSummaryMessage,
  buildWeeklyDigestMessage,
} from '../../utils/notificationMessages';
import { BudgetSummary } from '../../types';

const makeSummary = (overrides = {}): BudgetSummary => ({
  income: 200000,
  totalSpent: 180000,
  totalRemaining: 20000,
  needs: { allocated: 100000, spent: 120000, remaining: -20000, percentage: 120, isOverBudget: true },
  wants: { allocated: 60000, spent: 40000, remaining: 20000, percentage: 67, isOverBudget: false },
  savings: { allocated: 40000, spent: 20000, remaining: 20000, percentage: 50, isOverBudget: false },
  ...overrides,
});

describe('buildOverBudgetMessage', () => {
  it('returns message for a single over-budget category', () => {
    const msg = buildOverBudgetMessage('needs', 20000, '$');
    expect(msg.title).toMatch(/over budget/i);
    expect(msg.body).toContain('Needs');
    expect(msg.body).toContain('200.00');
  });

  it('includes currency symbol in body', () => {
    const msg = buildOverBudgetMessage('wants', 5000, '$');
    expect(msg.body).toContain('$');
  });

  it('returns non-empty title and body', () => {
    const msg = buildOverBudgetMessage('savings', 1000, '€');
    expect(msg.title.length).toBeGreaterThan(0);
    expect(msg.body.length).toBeGreaterThan(0);
  });
});

describe('buildDailyReminderMessage', () => {
  it('returns a reminder notification shape', () => {
    const msg = buildDailyReminderMessage();
    expect(msg).toHaveProperty('title');
    expect(msg).toHaveProperty('body');
  });

  it('title is not empty', () => {
    expect(buildDailyReminderMessage().title.length).toBeGreaterThan(0);
  });
});

describe('buildMonthEndSummaryMessage', () => {
  it('includes total spent amount', () => {
    const summary = makeSummary();
    const msg = buildMonthEndSummaryMessage(summary, '$', '2026-03');
    expect(msg.body).toContain('1,800.00');
  });

  it('includes month name in message', () => {
    const msg = buildMonthEndSummaryMessage(makeSummary(), '$', '2026-01');
    expect(msg.body).toMatch(/january/i);
  });

  it('indicates if user was within total budget', () => {
    const underBudgetSummary = makeSummary({ totalSpent: 100000, totalRemaining: 100000 });
    const msg = buildMonthEndSummaryMessage(underBudgetSummary, '$', '2026-03');
    expect(msg.body).toMatch(/within budget|under budget|saved/i);
  });

  it('indicates if user overspent', () => {
    const overBudgetSummary = makeSummary({ totalSpent: 220000, totalRemaining: -20000 });
    const msg = buildMonthEndSummaryMessage(overBudgetSummary, '$', '2026-03');
    expect(msg.body).toMatch(/over|exceeded/i);
  });
});

describe('buildWeeklyDigestMessage', () => {
  it('includes week summary info', () => {
    const msg = buildWeeklyDigestMessage(makeSummary(), '$');
    expect(msg.title.length).toBeGreaterThan(0);
    expect(msg.body.length).toBeGreaterThan(0);
    expect(msg.body).toContain('1,800.00');
  });
});
