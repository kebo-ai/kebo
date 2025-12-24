import { PostHog } from "posthog-react-native";
import logger from "../utils/logger";

class PostHogClient {
  private static instance: PostHogClient;
  private posthog: PostHog | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PostHogClient {
    if (!PostHogClient.instance) {
      PostHogClient.instance = new PostHogClient();
    }
    return PostHogClient.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

      if (!apiKey) {
        logger.warn("PostHog API key not found in environment variables");
        return;
      }

      this.posthog = new PostHog(apiKey, {
        host: "https://us.i.posthog.com",
        enableSessionReplay: true,
      });

      this.isInitialized = true;
      logger.info("PostHog client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize PostHog client:", error);
    }
  }

  public getClient(): PostHog | null {
    return this.posthog;
  }

  public isReady(): boolean {
    return this.isInitialized && this.posthog !== null;
  }

  public capture(eventName: string, properties?: Record<string, any>): void {
    if (!this.isReady()) {
      logger.warn(
        "PostHog client not ready, cannot capture event:",
        eventName
      );
      return;
    }

    try {
      this.posthog!.capture(eventName, properties);
    } catch (error) {
      logger.error("Failed to capture PostHog event:", error);
    }
  }

  public identify(userId: string, properties?: Record<string, any>): void {
    if (!this.isReady()) {
      logger.warn("PostHog client not ready, cannot identify user:", userId);
      return;
    }

    try {
      this.posthog!.identify(userId, properties);
    } catch (error) {
      logger.error("Failed to identify user in PostHog:", error);
    }
  }

  public setUserProperties(properties: Record<string, any>): void {
    if (!this.isReady()) {
      logger.warn("PostHog client not ready, cannot set user properties");
      return;
    }

    try {
      if (this.posthog!.setPersonProperties) {
        this.posthog!.setPersonProperties(properties);
      } else if (this.posthog!.identify) {
        const currentUserId = this.posthog!.get_distinct_id?.() || "anonymous";
        this.posthog!.identify(currentUserId, properties);
      }
    } catch (error) {
      logger.error("Failed to set user properties in PostHog:", error);
    }
  }

  public screen(screenName: string, properties?: Record<string, any>): void {
    if (!this.isReady()) {
      logger.warn(
        "PostHog client not ready, cannot track screen:",
        screenName
      );
      return;
    }

    try {
      this.posthog!.screen(screenName, properties);
    } catch (error) {
      logger.error("Failed to track screen in PostHog:", error);
    }
  }

  public reset(): void {
    if (!this.isReady()) {
      logger.warn("PostHog client not ready, cannot reset");
      return;
    }

    try {
      this.posthog!.reset();
    } catch (error) {
      logger.error("Failed to reset PostHog client:", error);
    }
  }

  public getDistinctId(): string | null {
    if (!this.isReady()) {
      return null;
    }

    try {
      return this.posthog!.get_distinct_id?.() || null;
    } catch (error) {
      logger.error("Failed to get distinct ID from PostHog:", error);
      return null;
    }
  }
}

export const postHogClient = PostHogClient.getInstance();

export { PostHogClient };
