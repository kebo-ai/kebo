import { Platform } from "react-native";
import { AnalyticsService } from "@/services/analytics-service";
import { useMemo } from "react";

export const useAnalytics = (): AnalyticsService => {
  const analytics = useMemo(() => {
    const service = new AnalyticsService();

    const platformAwareService = Object.create(service);
    platformAwareService.getBaseProperties = () => ({
      timestamp: new Date().toISOString(),
      platform:
        Platform.OS === "ios"
          ? "ios"
          : Platform.OS === "android"
          ? "android"
          : "web",
    });

    return platformAwareService;
  }, []);

  return analytics;
};

export default useAnalytics;
