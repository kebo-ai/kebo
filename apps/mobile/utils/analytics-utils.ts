import logger from "./logger";
import { AnalyticsService } from "@/services/AnalyticsService";
import { getUserInfo } from "@/utils/auth-utils";
import { RootStore } from "@/models/root-store";

export const initializeUserAnalytics = async (
  analytics: AnalyticsService,
  rootStore: RootStore
): Promise<void> => {
  try {
    const userInfo = await getUserInfo(rootStore);

    if (userInfo?.user) {
      const userName =
        userInfo.profile?.full_name ||
        userInfo.user.user_metadata?.full_name ||
        "";

      analytics.identify(userInfo.user.id, {
        user_id: userInfo.user.id,
        email: userInfo.user.email,
        full_name: userName,
        registration_date: userInfo.user.created_at,
        country: userInfo.profile?.country || "",
        currency: userInfo.profile?.currency || "",
        language: userInfo.profile?.language || "",
        timezone: userInfo.profile?.timezone || "",
        push_notifications_enabled:
          userInfo.profile?.push_notifications || false,
        email_notifications_enabled:
          userInfo.profile?.email_notifications || false,
      });

      logger.debug("User analytics initialized successfully:", {
        userId: userInfo.user.id,
        email: userInfo.user.email,
        name: userName,
      });
    }
  } catch (error) {
    logger.error("Error initializing user analytics:", error);
  }
};

export const updateUserAnalyticsProperties = (
  analytics: AnalyticsService,
  properties: Record<string, any>
): void => {
  try {
    logger.debug("User analytics properties would be updated:", properties);
    analytics.setUserProperties(properties);
  } catch (error) {
    logger.error("Error updating user analytics properties:", error);
  }
};
