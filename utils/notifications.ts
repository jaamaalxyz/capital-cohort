import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Category } from '../types';
import {
  buildOverBudgetMessage,
  buildDailyReminderMessage,
  buildMonthEndSummaryMessage,
  buildWeeklyDigestMessage
} from './notificationMessages';
import { BudgetSummary } from '../types';

// Scheduling APIs are native-only — expo-notifications does not support web
const isNative = Platform.OS !== 'web';

// Configure how notifications are handled in the foreground (native only)
if (isNative) {
  ExpoNotifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) return false;
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
  currency: string
): Promise<string> {
  if (!isNative) return '';
  const { title, body } = buildOverBudgetMessage(category, overBy, currency);

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
  if (!isNative) return '';
  const [hour, minute] = time.split(':').map(Number);
  const { title, body } = buildDailyReminderMessage();

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
  if (!isNative || !notificationId) return;
  await ExpoNotifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleMonthEndSummary(
  month: string,
  summary: BudgetSummary,
  currency: string
): Promise<string> {
  if (!isNative) return '';
  const { title, body } = buildMonthEndSummaryMessage(summary, currency, month);

  // Schedule for the 1st of next month at 9:00 AM
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
  currency: string
): Promise<string> {
  if (!isNative) return '';
  const { title, body } = buildWeeklyDigestMessage(summary, currency);

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
