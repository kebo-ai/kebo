import { Platform } from "react-native";
import { postHogClient } from "./PostHogClient";
import logger from "../utils/logger";

export const AUTH_EVENTS = {
  AUTH_STARTED: "auth_started",
  AUTH_METHOD_SELECTED: "auth_method_selected",
  AUTH_SUCCESS: "auth_success",
  AUTH_FAILED: "auth_failed",
  AUTH_CANCELLED: "auth_cancelled",
  LOGOUT_INITIATED: "logout_initiated",
  LOGOUT_SUCCESS: "logout_success",

  MAGIC_LINK_REQUESTED: "magic_link_requested",
  MAGIC_LINK_SENT: "magic_link_sent",
  MAGIC_LINK_FAILED: "magic_link_failed",
  MAGIC_LINK_CLICKED: "magic_link_clicked",
  MAGIC_LINK_SESSION_CREATED: "magic_link_session_created",
} as const;

export const ONBOARDING_EVENTS = {
  APP_LAUNCHED: "app_launched",
  SPLASH_SCREEN_VIEWED: "splash_screen_viewed",
  WELCOME_SCREEN_VIEWED: "welcome_screen_viewed",
} as const;

export const PROFILE_EVENTS = {
  PROFILE_SCREEN_VIEWED: "profile_screen_viewed",
  LOGOUT_CLICKED: "logout_clicked",
  LOGOUT_SUCCESS: "logout_success",
  LOGOUT_FAILED: "logout_failed",
} as const;

export const NAVIGATION_EVENTS = {
  TAB_HOME_CLICKED: "tab_home_clicked",
  TAB_BUDGETS_CLICKED: "tab_budgets_clicked",
  TAB_REPORTS_CLICKED: "tab_reports_clicked",
  TAB_CHATBOT_CLICKED: "tab_chatbot_clicked",

  ADD_TRANSACTION_CLICKED: "add_transaction_clicked",
  HOME_ADD_TRANSACTION_BUTTON_CLICKED: "home_add_transaction_button_clicked",
  HOME_TRANSACTION_BUTTON_CLICKED: "home_transaction_button_clicked",

  NAVIGATION_SCREEN_CHANGE: "navigation_screen_change",
  TAB_SWITCH: "tab_switch",
} as const;

export const EVENT_PROPERTIES = {
  AUTH_METHOD: "auth_method",
  AUTH_PROVIDER: "auth_provider",
  ERROR_CODE: "error_code",
  ERROR_MESSAGE: "error_message",
  SESSION_DURATION: "session_duration",

  USER_ID: "user_id",
  EMAIL: "email",
  IS_FIRST_TIME: "is_first_time",
  REGISTRATION_DATE: "registration_date",

  SCREEN_NAME: "screen_name",
  TIME_SPENT: "time_spent",

  STEP_NUMBER: "step_number",
  STEP_NAME: "step_name",
  TOTAL_STEPS: "total_steps",
  COMPLETION_RATE: "completion_rate",

  BANNER_ID: "banner_id",

  PROFILE_SECTION: "profile_section",
  ACTION_TYPE: "action_type",
  EXTERNAL_URL: "external_url",
  SETTING_NAME: "setting_name",
  OLD_VALUE: "old_value",
  NEW_VALUE: "new_value",
  SUCCESS: "success",
  INTERACTION_TYPE: "interaction_type",

  TAB_NAME: "tab_name",
  FROM_TAB: "from_tab",
  TO_TAB: "to_tab",
  TRANSACTION_TYPE: "transaction_type",

  NOTIFICATION_TYPE: "notification_type",
  PUSH_NOTIFICATIONS_ENABLED: "push_notifications_enabled",
  EMAIL_NOTIFICATIONS_ENABLED: "email_notifications_enabled",
} as const;

export type AuthEventName = (typeof AUTH_EVENTS)[keyof typeof AUTH_EVENTS];
export type OnboardingEventName =
  (typeof ONBOARDING_EVENTS)[keyof typeof ONBOARDING_EVENTS];
export type ProfileEventName =
  (typeof PROFILE_EVENTS)[keyof typeof PROFILE_EVENTS];
export type NavigationEventName =
  (typeof NAVIGATION_EVENTS)[keyof typeof NAVIGATION_EVENTS];
export type EventPropertyName =
  (typeof EVENT_PROPERTIES)[keyof typeof EVENT_PROPERTIES];

export interface BaseEventProperties {
  [EVENT_PROPERTIES.SCREEN_NAME]?: string;
  [EVENT_PROPERTIES.USER_ID]?: string;
}

export interface AuthEventProperties extends BaseEventProperties {
  [EVENT_PROPERTIES.AUTH_METHOD]?: "google" | "apple" | "magic_link" | "email";
  [EVENT_PROPERTIES.AUTH_PROVIDER]?: "google" | "apple" | "supabase";
  [EVENT_PROPERTIES.ERROR_CODE]?: string;
  [EVENT_PROPERTIES.ERROR_MESSAGE]?: string;
  [EVENT_PROPERTIES.IS_FIRST_TIME]?: boolean;
}

export interface OnboardingEventProperties extends BaseEventProperties {
  [EVENT_PROPERTIES.STEP_NUMBER]?: number;
  [EVENT_PROPERTIES.STEP_NAME]?: string;
  [EVENT_PROPERTIES.TOTAL_STEPS]?: number;
  [EVENT_PROPERTIES.COMPLETION_RATE]?: number;
  [EVENT_PROPERTIES.BANNER_ID]?: string;
  [EVENT_PROPERTIES.TIME_SPENT]?: number;
}

export interface ProfileEventProperties extends BaseEventProperties {
  [EVENT_PROPERTIES.PROFILE_SECTION]?: string;
  [EVENT_PROPERTIES.ACTION_TYPE]?:
    | "click"
    | "edit"
    | "save"
    | "cancel"
    | "view"
    | "external_link";
  [EVENT_PROPERTIES.EXTERNAL_URL]?: string;
  [EVENT_PROPERTIES.SETTING_NAME]?: string;
  [EVENT_PROPERTIES.OLD_VALUE]?: string;
  [EVENT_PROPERTIES.NEW_VALUE]?: string;
  [EVENT_PROPERTIES.SUCCESS]?: boolean;
  [EVENT_PROPERTIES.ERROR_CODE]?: string;
  [EVENT_PROPERTIES.ERROR_MESSAGE]?: string;
  [EVENT_PROPERTIES.INTERACTION_TYPE]?:
    | "button"
    | "link"
    | "modal"
    | "input"
    | "toggle";
}
export interface NavigationEventProperties extends BaseEventProperties {
  [EVENT_PROPERTIES.TAB_NAME]?: "Home" | "Budgets" | "Reports" | "Chatbot";
  [EVENT_PROPERTIES.FROM_TAB]?: string;
  [EVENT_PROPERTIES.TO_TAB]?: string;
  [EVENT_PROPERTIES.TRANSACTION_TYPE]?: "Expense" | "Income" | "Transfer";
  [EVENT_PROPERTIES.ACTION_TYPE]?: "click" | "switch" | "navigate";
  [EVENT_PROPERTIES.INTERACTION_TYPE]?: "tab" | "button" | "gesture";
}

export interface UserProperties {
  [EVENT_PROPERTIES.USER_ID]: string;
  [EVENT_PROPERTIES.EMAIL]?: string;
  full_name?: string;
  country?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  [EVENT_PROPERTIES.REGISTRATION_DATE]?: string;
  push_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
  is_premium?: boolean;
  account_count?: number;
  transaction_count?: number;
  budget_count?: number;
}

export class AnalyticsService {
  private readonly posthog: any;
  private currentScreen: string | null = null;

  constructor(posthog?: any) {
    this.posthog = posthog || postHogClient.getClient();
  }

  identify(userId: string, properties: UserProperties): void {
    if (!this.posthog) {
      logger.warn("PostHog not available for identify");
      return;
    }

    if (!userId) {
      logger.warn("User ID is required for identify");
      return;
    }

    try {
      this.posthog.identify(userId, properties);
      logger.debug("User identified successfully", { userId });
    } catch (error) {
      logger.error("Analytics identify error:", error);
    }
  }

  setUserProperties(properties: Partial<UserProperties>): void {
    if (!this.posthog) {
      logger.warn("PostHog not available for setUserProperties");
      return;
    }

    if (!properties || Object.keys(properties).length === 0) {
      logger.warn("No properties provided for setUserProperties");
      return;
    }

    try {
      if (this.posthog.setPersonProperties) {
        this.posthog.setPersonProperties(properties);
        logger.debug(
          "User properties set successfully via setPersonProperties",
          properties
        );
      } else if (this.posthog.identify) {
        let currentUserId = null;

        try {
          if (this.posthog.get_distinct_id) {
            currentUserId = this.posthog.get_distinct_id();
          }
        } catch (idError) {
          logger.debug("Could not get distinct ID, proceeding without it");
        }

        if (currentUserId) {
          this.posthog.identify(currentUserId, properties);
          logger.debug(
            "User properties set successfully via identify with ID",
            properties
          );
        } else {
          this.posthog.identify(properties);
          logger.debug(
            "User properties set successfully via identify without ID",
            properties
          );
        }
      } else {
        logger.warn(
          "No PostHog method available for setting user properties"
        );
      }
    } catch (error) {
      logger.error("Analytics setUserProperties error:", error);
    }
  }

  trackAuthEvent(
    eventName: AuthEventName,
    properties?: Partial<AuthEventProperties>
  ) {
    this.trackEvent(eventName, {
      ...properties,
    });
  }

  trackOnboardingEvent(
    eventName: OnboardingEventName,
    properties?: Partial<OnboardingEventProperties>
  ) {
    this.trackEvent(eventName, {
      ...properties,
    });
  }

  trackProfileEvent(
    eventName: ProfileEventName,
    properties?: Partial<ProfileEventProperties>
  ) {
    this.trackEvent(eventName, {
      ...properties,
    });
  }

  trackNavigationEvent(
    eventName: NavigationEventName,
    properties?: Partial<NavigationEventProperties>
  ) {
    this.trackEvent(eventName, {
      ...properties,
    });
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.posthog) {
      logger.warn("PostHog not available for trackEvent");
      return;
    }

    if (!eventName) {
      logger.warn("Event name is required for trackEvent");
      return;
    }

    try {
      const eventProperties = {
        ...properties,
      };

      this.posthog.capture(eventName, eventProperties);
      logger.debug("Event tracked successfully", {
        eventName,
        currentScreen: this.currentScreen,
        properties: eventProperties,
      });
    } catch (error) {
      logger.error("Analytics trackEvent error:", error);
    }
  }

  trackScreen(screenName: string, properties?: Record<string, any>): void {
    if (!this.posthog) {
      logger.warn("PostHog not available for trackScreen");
      return;
    }

    if (!screenName) {
      logger.warn("Screen name is required for trackScreen");
      return;
    }

    try {
      const screenProperties = {
        [EVENT_PROPERTIES.SCREEN_NAME]: screenName,
        ...properties,
      };

      this.posthog.screen(screenName, screenProperties);
      this.currentScreen = screenName;

      logger.debug("Screen tracked successfully", {
        screenName,
        currentScreen: this.currentScreen,
        properties: screenProperties,
      });
    } catch (error) {
      logger.error("Analytics trackScreen error:", error);
    }
  }

  reset(): void {
    if (!this.posthog) {
      logger.warn("PostHog not available for reset");
      return;
    }

    try {
      this.posthog.reset();
      this.currentScreen = null;
      logger.debug("Analytics session reset successfully");
    } catch (error) {
      logger.error("Analytics reset error:", error);
    }
  }

  getCurrentScreen(): string | null {
    return this.currentScreen;
  }

  setCurrentScreen(screenName: string) {
    this.currentScreen = screenName;
  }

  private getPlatform(): "ios" | "android" | "web" {
    try {
      if (Platform.OS === "ios") return "ios";
      if (Platform.OS === "android") return "android";
      if (typeof window !== "undefined") return "web";

      return "ios";
    } catch (error) {
      logger.error("Error getting platform:", error);
      return "ios";
    }
  }

  trackAuthStart(method: "google" | "apple" | "magic_link"): void {
    if (!method) {
      logger.warn("Auth method is required for trackAuthStart");
      return;
    }

    this.trackAuthEvent(AUTH_EVENTS.AUTH_STARTED, {
      [EVENT_PROPERTIES.AUTH_METHOD]: method,
    });
  }

  trackAuthSuccess(
    method: "google" | "apple" | "magic_link",
    userId: string,
    isFirstTime: boolean = false
  ): void {
    if (!method) {
      logger.warn("Auth method is required for trackAuthSuccess");
      return;
    }

    if (!userId) {
      logger.warn("User ID is required for trackAuthSuccess");
      return;
    }

    this.trackAuthEvent(AUTH_EVENTS.AUTH_SUCCESS, {
      [EVENT_PROPERTIES.AUTH_METHOD]: method,
      [EVENT_PROPERTIES.USER_ID]: userId,
      [EVENT_PROPERTIES.IS_FIRST_TIME]: isFirstTime,
    });
  }

  trackAuthError(method: "google" | "apple" | "magic_link", error: any): void {
    if (!method) {
      logger.warn("Auth method is required for trackAuthError");
      return;
    }

    const errorCode = error?.code || "unknown";
    const errorMessage = error?.message || "Unknown error";

    this.trackAuthEvent(AUTH_EVENTS.AUTH_FAILED, {
      [EVENT_PROPERTIES.AUTH_METHOD]: method,
      [EVENT_PROPERTIES.ERROR_CODE]: errorCode,
      [EVENT_PROPERTIES.ERROR_MESSAGE]: errorMessage,
    });
  }

  trackAppLaunch() {
    this.trackOnboardingEvent(ONBOARDING_EVENTS.APP_LAUNCHED);
  }

  trackSplashScreen() {
    this.trackOnboardingEvent(ONBOARDING_EVENTS.SPLASH_SCREEN_VIEWED);
  }

  trackWelcomeScreen() {
    this.trackOnboardingEvent(ONBOARDING_EVENTS.WELCOME_SCREEN_VIEWED);
  }

  trackBannerSlide(
    slideIndex: number,
    totalSlides: number,
    bannerId?: string,
    bannerTitle?: string
  ) {
    // Reserved for future implementation
  }

  trackProfileScreenView() {
    this.trackProfileEvent(PROFILE_EVENTS.PROFILE_SCREEN_VIEWED, {
      [EVENT_PROPERTIES.ACTION_TYPE]: "view",
    });
  }

  trackProfileNameEdit(
    oldName: string,
    newName: string,
    success: boolean
  ): void {
    if (oldName === undefined || newName === undefined) {
      logger.warn(
        "Both oldName and newName are required for trackProfileNameEdit"
      );
      return;
    }
    // Reserved for future implementation
  }

  trackProfileButtonClick(
    eventName: ProfileEventName,
    section: string,
    interactionType: "button" | "link" = "button",
    externalUrl?: string
  ): void {
    if (!eventName) {
      logger.warn("Event name is required for trackProfileButtonClick");
      return;
    }

    if (!section) {
      logger.warn("Section is required for trackProfileButtonClick");
      return;
    }

    this.trackProfileEvent(eventName, {
      [EVENT_PROPERTIES.PROFILE_SECTION]: section,
      [EVENT_PROPERTIES.ACTION_TYPE]: externalUrl ? "external_link" : "click",
      [EVENT_PROPERTIES.INTERACTION_TYPE]: interactionType,
      [EVENT_PROPERTIES.EXTERNAL_URL]: externalUrl,
    });
  }

  trackLogout(success: boolean, error?: any): void {
    if (success) {
      this.trackProfileEvent(PROFILE_EVENTS.LOGOUT_SUCCESS, {
        [EVENT_PROPERTIES.ACTION_TYPE]: "click",
        [EVENT_PROPERTIES.SUCCESS]: true,
      });
    } else {
      const errorCode = error?.code || "unknown";
      const errorMessage = error?.message || "Unknown error";

      this.trackProfileEvent(PROFILE_EVENTS.LOGOUT_FAILED, {
        [EVENT_PROPERTIES.ACTION_TYPE]: "click",
        [EVENT_PROPERTIES.SUCCESS]: false,
        [EVENT_PROPERTIES.ERROR_CODE]: errorCode,
        [EVENT_PROPERTIES.ERROR_MESSAGE]: errorMessage,
      });
    }
  }

  trackNavigation(
    fromScreen: string,
    toScreen: string,
    properties?: Record<string, any>
  ) {
    this.trackEvent("navigation_screen_change", {
      [EVENT_PROPERTIES.SCREEN_NAME]: toScreen,
      ...properties,
    });

    this.currentScreen = toScreen;
  }

  trackTabClick(
    tabName: "Home" | "Budgets" | "Reports" | "Chatbot",
    fromTab?: string
  ): void {
    if (!tabName) {
      logger.warn("Tab name is required for trackTabClick");
      return;
    }

    const eventMap = {
      Home: NAVIGATION_EVENTS.TAB_HOME_CLICKED,
      Budgets: NAVIGATION_EVENTS.TAB_BUDGETS_CLICKED,
      Reports: NAVIGATION_EVENTS.TAB_REPORTS_CLICKED,
      Chatbot: NAVIGATION_EVENTS.TAB_CHATBOT_CLICKED,
    };

    const eventName = eventMap[tabName];
    if (!eventName) {
      logger.warn(`Invalid tab name: ${tabName}`);
      return;
    }

    this.trackNavigationEvent(eventName, {
      [EVENT_PROPERTIES.TAB_NAME]: tabName,
      [EVENT_PROPERTIES.FROM_TAB]: fromTab || "none",
      [EVENT_PROPERTIES.TO_TAB]: tabName,
      [EVENT_PROPERTIES.ACTION_TYPE]: "click",
      [EVENT_PROPERTIES.INTERACTION_TYPE]: "tab",
    });
  }

  trackAddTransactionClick(
    transactionType: "Expense" | "Income" | "Transfer" = "Expense"
  ) {
    this.trackNavigationEvent(NAVIGATION_EVENTS.ADD_TRANSACTION_CLICKED, {
      [EVENT_PROPERTIES.TRANSACTION_TYPE]: transactionType,
      [EVENT_PROPERTIES.ACTION_TYPE]: "click",
      [EVENT_PROPERTIES.INTERACTION_TYPE]: "button",
    });
  }

  trackTabPlusButtonClick(
    transactionType: "Expense" | "Income" | "Transfer" = "Expense"
  ) {
    this.trackNavigationEvent(
      NAVIGATION_EVENTS.HOME_ADD_TRANSACTION_BUTTON_CLICKED,
      {
        [EVENT_PROPERTIES.TRANSACTION_TYPE]: transactionType,
        [EVENT_PROPERTIES.ACTION_TYPE]: "click",
        [EVENT_PROPERTIES.INTERACTION_TYPE]: "button",
      }
    );
  }

  trackHomeTransactionButtonClick(
    transactionType: "Expense" | "Income" | "Transfer" = "Expense"
  ) {
    this.trackNavigationEvent(
      NAVIGATION_EVENTS.HOME_TRANSACTION_BUTTON_CLICKED,
      {
        [EVENT_PROPERTIES.TRANSACTION_TYPE]: transactionType,
        [EVENT_PROPERTIES.ACTION_TYPE]: "click",
        [EVENT_PROPERTIES.INTERACTION_TYPE]: "button",
      }
    );
  }

  trackTabSwitch(fromTab: string, toTab: string) {
    this.trackNavigationEvent(NAVIGATION_EVENTS.TAB_SWITCH, {
      [EVENT_PROPERTIES.FROM_TAB]: fromTab,
      [EVENT_PROPERTIES.TO_TAB]: toTab,
      [EVENT_PROPERTIES.ACTION_TYPE]: "switch",
      [EVENT_PROPERTIES.INTERACTION_TYPE]: "tab",
    });
  }
}

export default AnalyticsService;
