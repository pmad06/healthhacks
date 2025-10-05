import * as Notifications from 'expo-notifications';

export async function scheduleJudgesReminder() {
  const drugName = 'Amoxicillin';
  const dosage = '250mg';
  const times = [8, 14, 20, 2]; // 8 AM, 2 PM, 8 PM, 2 AM

  for (const hour of times) {
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(0);
    scheduledTime.setSeconds(0);

    // If the time is already passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntil = Math.floor((scheduledTime.getTime() - Date.now()) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to take ${drugName}`,
        body: `Dosage: ${dosage} by mouth. Take one pill.`,
      },
      trigger: {
        seconds: secondsUntil,
      } as Notifications.NotificationTriggerInput, // ✅ Type-safe cast
    });
  }
}