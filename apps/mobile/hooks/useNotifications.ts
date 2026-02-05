import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { translate } from "@/i18n/translate";
import { TxKeyPath } from "@/i18n/i18n";
import logger from "@/utils/logger";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | false
  >(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token ?? "");
      setPermissionsGranted(!!token);

      if (token) {
        setupDailyNotification();
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.debug("Notification tapped:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
    permissionsGranted,
  };
}



async function setupDailyNotification() {
  try {
    const hour = 18;
    const minute = 0;

    await scheduleDailyNotification(
      translate("notifications:dailyReminder") as TxKeyPath,
      translate("notifications:dailyReminderBody") as TxKeyPath,
      hour,
      minute,
      { screen: "Home" }
    );

    logger.debug(
      `Notification daily configured for ${hour}:${minute
        .toString()
        .padStart(2, "0")}`
    );
  } catch (error) {
    logger.error("Error configuring daily notification:", error);
  }
}

export async function schedulePushNotification(
  title: string,
  body: string,
  data?: object
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute: number = 0,
  data?: object
) {
  await cancelDailyNotifications();

  const identifier = "daily-notification";

  const trigger: Notifications.NotificationTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      data: {
        ...data,
        type: "daily-notification",
      },
    },
    trigger,
  });

  logger.debug(
    `Notification daily scheduled for ${hour}:${minute
      .toString()
      .padStart(2, "0")} with ID: ${notificationId}`
  );

  return notificationId;
}

export async function cancelDailyNotifications() {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    if (
      notification.identifier === "daily-notification" ||
      notification.content.data?.type === "daily-notification"
    ) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
      logger.debug(`Notification cancelled: ${notification.identifier}`);
    }
  }
}

export async function getScheduledNotifications() {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  logger.debug("Scheduled notifications:", scheduledNotifications);
  return scheduledNotifications;
}

export async function scheduleTestNotification(
  title: string,
  body: string,
  minutesFromNow: number = 1,
  data?: object
) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: "test-notification",
      content: {
        title,
        body,
        data: {
          ...data,
          type: "test-notification",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutesFromNow * 60,
      },
    });

    logger.debug(
      `Test notification scheduled for ${minutesFromNow} minutes with ID: ${notificationId}`
    );
    return notificationId;
  } catch (error) {
    logger.error("Error scheduling test notification:", error);
    throw error;
  }
}

export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: object
) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: "immediate-notification",
      content: {
        title,
        body,
        data: {
          ...data,
          type: "immediate-notification",
        },
      },
      trigger: null,
    });

    logger.debug("Immediate notification sent");
  } catch (error) {
    logger.error("Error sending immediate notification:", error);
    throw error;
  }
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== "granted") {
    logger.debug("Failed to get notification permissions!");
    return null;
  }
  
  logger.debug("Notification permissions granted");
  
  return "local-notifications-only";
}
