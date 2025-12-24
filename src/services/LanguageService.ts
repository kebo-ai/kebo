import { save, load } from "../utils/storage/storage";
import logger from "../utils/logger";

const LANGUAGE_STORAGE_KEY = "user-selected-language";

export class LanguageService {
  static async saveSelectedLanguage(languageCode: string): Promise<boolean> {
    try {
      const success = await save(LANGUAGE_STORAGE_KEY, languageCode);
      if (success) {
        logger.debug(`Language saved: ${languageCode}`);
      } else {
        logger.error("Error saving language");
      }
      return success;
    } catch (error) {
      logger.error("Error saving language:", error);
      return false;
    }
  }

  static async getSelectedLanguage(): Promise<string | null> {
    try {
      const language = await load<string>(LANGUAGE_STORAGE_KEY);
      logger.debug(`Language loaded: ${language}`);
      return language;
    } catch (error) {
      logger.error("Error getting selected language:", error);
      return null;
    }
  }

  static async clearSelectedLanguage(): Promise<void> {
    try {
      await save(LANGUAGE_STORAGE_KEY, null);
      logger.debug("Language deleted from storage");
    } catch (error) {
      logger.error("Error clearing selected language:", error);
    }
  }
}
