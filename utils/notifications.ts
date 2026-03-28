import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Category } from '../types';
import {
  buildOverBudgetMessage,
  buildDailyReminderMessage,
  buildMonthEndSummaryMessage,
  buildWeeklyDigestMessage,
} from './notificationMessages';
import { BudgetSummary } from '../types';

// Scheduling APIs are native-only — web uses the browser Notification API
const isNative = Platform.OS !== 'web';

// Configure foreground notification handling (native only)
if (isNative) {
  ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// --- Web helpers ---

async function webShowNotification(title: string, body: string): Promise<void> {
  if (Notification.permission !== 'granted') return;

  // navigator.serviceWorker.ready never rejects — only resolves when a SW is
  // active and controlling the page. On first visit it hangs indefinitely, so
  // we race it against a 500 ms timeout and fall back to new Notification().
  const swTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 500));
  const reg = await Promise.race([
    navigator.serviceWorker?.ready.catch(() => null) ?? Promise.resolve(null),
    swTimeout,
  ]);

  if (reg) {
    reg.showNotification(title, { body, icon: '/assets/icon.png' });
  } else {
    new Notification(title, { body });
  }
}

function webSchedule(
  title: string,
  body: string,
  delayMs: number,
): string {
  const id = setTimeout(() => webShowNotification(title, body), delayMs);
  return String(id);
}

function msUntilNext(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

// --- Public API ---

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) {
    if (!('Notification' in window)) return false;
    const status = await Notification.requestPermission();
    return status === 'granted';
  }

  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await ExpoNotifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleOverBudgetAlert(
  category: Category,
  overBy: number,
  currency: string,
): Promise<string> {
  const { title, body } = buildOverBudgetMessage(category, overBy, currency);

  if (!isNative) {
    await webShowNotification(title, body);
    return '';
  }

  return ExpoNotifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: ExpoNotifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // fire immediately
  });
}

export async function scheduleDailyReminder(time: string): Promise<string> {
  const [hour, minute] = time.split(':').map(Number);
  const { title, body } = buildDailyReminderMessage();

  if (!isNative) {
    return webSchedule(title, body, msUntilNext(hour, minute));
  }

  return ExpoNotifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: ExpoNotifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(notificationId: string): Promise<void> {
  if (!isNative) {
    if (notificationId) clearTimeout(Number(notificationId));
    return;
  }
  if (notificationId) {
    await ExpoNotifications.cancelScheduledNotificationAsync(notificationId);
  }
}

export async function scheduleMonthEndSummary(
  month: string,
  summary: BudgetSummary,
  currency: string,
): Promise<string> {
  const { title, body } = buildMonthEndSummaryMessage(summary, currency, month);

  if (!isNative) {
    // Fire at 9:00 AM on the 1st of next month
    const [year, m] = month.split('-').map(Number);
    const nextDate = new Date(year, m, 1, 9, 0, 0);
    const delayMs = nextDate.getTime() - Date.now();
    if (delayMs > 0) return webSchedule(title, body, delayMs);
    return '';
  }

  const [year, m] = month.split('-').map(Number);
  const nextDate = new Date(year, m, 1, 9, 0, 0);

  return ExpoNotifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: ExpoNotifications.SchedulableTriggerInputTypes.DATE,
      date: nextDate,
    },
  });
}

export async function scheduleWeeklyDigest(
  summary: BudgetSummary,
  currency: string,
): Promise<string> {
  const { title, body } = buildWeeklyDigestMessage(summary, currency);

  if (!isNative) {
    // Fire next Sunday at 10:00 AM
    const now = new Date();
    const next = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    next.setDate(now.getDate() + daysUntilSunday);
    next.setHours(10, 0, 0, 0);
    return webSchedule(title, body, next.getTime() - now.getTime());
  }

  return ExpoNotifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: ExpoNotifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 10,
      minute: 0,
    },
  });
}
