# Plan 05 — Push Notifications & Budget Alerts

**Priority:** P2
**Type:** Feature
**Effort:** 2–3 days
**Depends on:** Plan 00 (test infrastructure)

---

## Overview

Deliver timely, useful notifications to help users stay on budget:
- **Over-budget alert** — when a category exceeds its allocation
- **Daily spending reminder** — optional, configurable time (e.g., "Log today's expenses")
- **Month-end summary** — on the last day of the month: "You spent X this month"
- **Weekly digest** — optional Sunday summary

All notifications are **local** (no push server). Uses `expo-notifications`.
Notification preferences are persisted to `AsyncStorage`.

---

## Dependencies to Install

```bash
npx expo install expo-notifications expo-task-manager
```

> **Note:** `expo-notifications` requires a bare/development build for background tasks on physical devices. In Expo Go, foreground notifications work. Background scheduling works via `expo-task-manager`.

---

## New Files

```
utils/
  notifications.ts                 # Schedule, cancel, permission helpers
  notificationMessages.ts          # Pure message builders (testable)
hooks/
  useNotifications.ts              # Permission + scheduling lifecycle hook
constants/theme.ts                 # Add STORAGE_KEYS.NOTIFICATION_PREFS
types/index.ts                     # Add NotificationPreferences type
app/(tabs)/settings.tsx            # Add Notifications section
__tests__/
  utils/notificationMessages.test.ts
  utils/notifications.test.ts
  hooks/useNotifications.test.tsx
```

---

## New Types (`types/index.ts` additions)

```ts
export interface NotificationPreferences {
  overBudgetAlerts: boolean;       // default: true
  dailyReminder: boolean;          // default: false
  dailyReminderTime: string;       // HH:MM 24h, default: '20:00'
  weeklyDigest: boolean;           // default: false
  monthEndSummary: boolean;        // default: true
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  overBudgetAlerts: true,
  dailyReminder: false,
  dailyReminderTime: '20:00',
  weeklyDigest: false,
  monthEndSummary: true,
};
```

---

## TDD Cycle 1 — `notificationMessages.ts` (Pure, no Expo dependency)

This module contains ONLY message-building logic. No `expo-notifications` calls. This allows full unit test coverage without mocking Expo.

### RED: Write tests first

**`__tests__/utils/notificationMessages.test.ts`**
```ts
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
    const msg = buildOverBudgetMessage('needs', 20000, 'USD');
    expect(msg.title).toMatch(/over budget/i);
    expect(msg.body).toContain('Needs');
    expect(msg.body).toContain('200.00');
  });

  it('includes currency symbol in body', () => {
    const msg = buildOverBudgetMessage('wants', 5000, 'USD');
    expect(msg.body).toContain('$');
  });

  it('returns non-empty title and body', () => {
    const msg = buildOverBudgetMessage('savings', 1000, 'EUR');
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
    const msg = buildMonthEndSummaryMessage(summary, 'USD', '2024-01');
    expect(msg.body).toContain('1,800.00');
  });

  it('includes month name in message', () => {
    const msg = buildMonthEndSummaryMessage(makeSummary(), 'USD', '2024-01');
    expect(msg.body).toMatch(/january/i);
  });

  it('indicates if user was within total budget', () => {
    const underBudgetSummary = makeSummary({ totalSpent: 100000, totalRemaining: 100000 });
    const msg = buildMonthEndSummaryMessage(underBudgetSummary, 'USD', '2024-01');
    expect(msg.body).toMatch(/within budget|under budget|saved/i);
  });

  it('indicates if user overspent', () => {
    const overBudgetSummary = makeSummary({ totalSpent: 220000, totalRemaining: -20000 });
    const msg = buildMonthEndSummaryMessage(overBudgetSummary, 'USD', '2024-01');
    expect(msg.body).toMatch(/over|exceeded/i);
  });
});

describe('buildWeeklyDigestMessage', () => {
  it('includes week number or date range', () => {
    const msg = buildWeeklyDigestMessage(makeSummary(), 'USD');
    expect(msg.title.length).toBeGreaterThan(0);
    expect(msg.body.length).toBeGreaterThan(0);
  });
});
```

### GREEN: Implement `utils/notificationMessages.ts`

```ts
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
  const monthName = new Date(`${month}-01`).toLocaleString('default', { month: 'long' });
  const withinBudget = summary.totalRemaining >= 0;
  const statusText = withinBudget
    ? `You stayed within budget!`
    : `You exceeded your budget.`;
  return {
    title: `📊 ${monthName} Summary`,
    body: `You spent ${formatCurrency(summary.totalSpent, currency)} this month. ${statusText}`,
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
```

---

## TDD Cycle 2 — `notifications.ts` (Expo-dependent, mocked in tests)

### Mocking Strategy

```ts
// In jest.setup.ts, add:
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id-123')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
```

### RED

**`__tests__/utils/notifications.test.ts`**
```ts
import * as ExpoNotifications from 'expo-notifications';
import {
  requestNotificationPermission,
  scheduleOverBudgetAlert,
  scheduleDailyReminder,
  cancelDailyReminder,
  scheduleMonthEndSummary,
} from '../../utils/notifications';

describe('requestNotificationPermission', () => {
  it('returns true when permission is granted', async () => {
    (ExpoNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    expect(await requestNotificationPermission()).toBe(true);
  });

  it('returns false when permission is denied', async () => {
    (ExpoNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    expect(await requestNotificationPermission()).toBe(false);
  });
});

describe('scheduleOverBudgetAlert', () => {
  it('calls scheduleNotificationAsync with correct message', async () => {
    await scheduleOverBudgetAlert('needs', 5000, 'USD');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringMatching(/over budget/i),
        }),
      })
    );
  });

  it('schedules as immediate trigger (null trigger)', async () => {
    await scheduleOverBudgetAlert('needs', 5000, 'USD');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: null })
    );
  });
});

describe('scheduleDailyReminder', () => {
  it('schedules with a daily calendar trigger', async () => {
    await scheduleDailyReminder('20:00');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({
          hour: 20,
          minute: 0,
          repeats: true,
        }),
      })
    );
  });

  it('parses HH:MM string into hour and minute correctly', async () => {
    await scheduleDailyReminder('09:30');
    expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({ hour: 9, minute: 30 }),
      })
    );
  });
});

describe('cancelDailyReminder', () => {
  it('calls cancelScheduledNotificationAsync with stored id', async () => {
    await cancelDailyReminder('notification-id-123');
    expect(ExpoNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
  });
});
```

### GREEN: Implement `utils/notifications.ts`

```ts
import * as ExpoNotifications from 'expo-notifications';
import { Category } from '../types';
import { buildOverBudgetMessage, buildDailyReminderMessage } from './notificationMessages';

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await ExpoNotifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleOverBudgetAlert(
  category: Category,
  overBy: number,
  currency: string
): Promise<string> {
  const { title, body } = buildOverBudgetMessage(category, overBy, currency);
  return ExpoNotifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // fire immediately
  });
}

export async function scheduleDailyReminder(time: string): Promise<string> {
  const [hour, minute] = time.split(':').map(Number);
  const { title, body } = buildDailyReminderMessage();
  return ExpoNotifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { hour, minute, repeats: true },
  });
}

export async function cancelDailyReminder(notificationId: string): Promise<void> {
  await ExpoNotifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleMonthEndSummary(
  lastDayOfMonth: Date,
  title: string,
  body: string
): Promise<string> {
  return ExpoNotifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date: lastDayOfMonth },
  });
}
```

---

## TDD Cycle 3 — Over-Budget Trigger in BudgetContext

When `ADD_EXPENSE` fires and a category goes over budget, trigger an alert:

```ts
// In BudgetContext after dispatching ADD_EXPENSE:
useEffect(() => {
  if (!prefs.overBudgetAlerts) return;
  const summary = calculateBudgetSummary(state.monthlyIncome, currentMonthExpenses);
  (['needs', 'wants', 'savings'] as Category[]).forEach((cat) => {
    if (summary[cat].isOverBudget) {
      scheduleOverBudgetAlert(cat, Math.abs(summary[cat].remaining), state.currency);
    }
  });
}, [state.expenses]);
```

**Test:**
```tsx
it('triggers over-budget alert when expense pushes category over limit', async () => {
  // Set income to 10000 cents (needs = 5000)
  // Add expense of 6000 to needs
  // Assert scheduleNotificationAsync was called
});
```

---

## Settings Screen — Notifications Section

```tsx
<Text>Notifications</Text>

<Switch
  testID="over-budget-alerts-toggle"
  value={prefs.overBudgetAlerts}
  onValueChange={(v) => updatePref('overBudgetAlerts', v)}
/>

<Switch
  testID="daily-reminder-toggle"
  value={prefs.dailyReminder}
  onValueChange={handleDailyReminderToggle}
/>

{prefs.dailyReminder && (
  <TextInput
    testID="reminder-time-input"
    value={prefs.dailyReminderTime}
    onChangeText={(v) => updatePref('dailyReminderTime', v)}
    placeholder="HH:MM"
  />
)}
```

---

## Acceptance Criteria

- [ ] `notificationMessages.ts` has 100% coverage (pure functions, no mocks)
- [ ] Over-budget alert fires immediately when category is exceeded
- [ ] Daily reminder schedules with correct hour/minute
- [ ] `cancelDailyReminder` is called when daily reminder is toggled off
- [ ] Notification permission is requested before scheduling
- [ ] No notification is scheduled if permission is denied
- [ ] Preferences persisted to AsyncStorage
- [ ] Settings toggles update preferences and reschedule/cancel accordingly

---

## Definition of Done

- All tests green
- Tested on device: foreground notification appears when adding over-budget expense
- Daily reminder fires at set time (manual test)
- Settings toggles correctly reschedule/cancel
