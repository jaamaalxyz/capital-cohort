import * as ExpoNotifications from 'expo-notifications';
import {
  requestNotificationPermission,
  scheduleOverBudgetAlert,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../../utils/notifications';

describe('requestNotificationPermission', () => {
  it('returns true when permission is granted', async () => {
    (ExpoNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    expect(await requestNotificationPermission()).toBe(true);
  });

  it('returns false when permission is denied', async () => {
    (ExpoNotifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
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
          type: 'daily',
          hour: 20,
          minute: 0,
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
