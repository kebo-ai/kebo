import { Appearance } from "react-native";

import { load, save } from "@/utils/storage/storage";
import logger from "@/utils/logger";

export type ThemePreference = "system" | "light" | "dark";

const THEME_PREFERENCE_STORAGE_KEY = "user-theme-preference";

const VALID_PREFERENCES: readonly ThemePreference[] = [
  "system",
  "light",
  "dark",
];

function isValidPreference(value: unknown): value is ThemePreference {
  return (
    typeof value === "string" &&
    (VALID_PREFERENCES as readonly string[]).includes(value)
  );
}

/**
 * Persists a user-chosen color-scheme override ("system" / "light" / "dark")
 * in AsyncStorage and applies it globally via `Appearance.setColorScheme`.
 *
 * Because every `useColorScheme()` subscriber in the app (including
 * `@react-navigation`'s theme, `hooks/use-theme`, and the individual UI
 * primitives) reads through `Appearance`, calling `apply` once is enough to
 * re-theme the whole tree — no component-level wiring is required.
 */
export class ThemePreferenceService {
  static async getPreference(): Promise<ThemePreference> {
    try {
      const stored = await load<unknown>(THEME_PREFERENCE_STORAGE_KEY);
      return isValidPreference(stored) ? stored : "system";
    } catch (error) {
      logger.error("Error loading theme preference:", error);
      return "system";
    }
  }

  static async savePreference(preference: ThemePreference): Promise<void> {
    try {
      await save(THEME_PREFERENCE_STORAGE_KEY, preference);
      this.apply(preference);
    } catch (error) {
      logger.error("Error saving theme preference:", error);
    }
  }

  /**
   * Push a preference through `Appearance.setColorScheme`. `"unspecified"`
   * is the official way to revert to the OS color scheme across iOS and
   * Android (RN's bridge translates it to `nil` on iOS).
   */
  static apply(preference: ThemePreference): void {
    Appearance.setColorScheme(
      preference === "system" ? "unspecified" : preference,
    );
  }

  /**
   * Load the saved preference and apply it. Call once at app boot so the
   * first paint already uses the right theme.
   */
  static async hydrate(): Promise<ThemePreference> {
    const preference = await this.getPreference();
    this.apply(preference);
    return preference;
  }
}
