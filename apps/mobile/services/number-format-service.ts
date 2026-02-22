import { save, load } from "@/utils/storage/storage";
import logger from "@/utils/logger";

const NUMBER_FORMAT_STORAGE_KEY = "user-selected-number-format";

export class NumberFormatService {
  static async saveSelectedFormat(format: string): Promise<boolean> {
    try {
      const success = await save(NUMBER_FORMAT_STORAGE_KEY, format);
      if (success) {
        logger.debug(`Number format saved: ${format}`);
      } else {
        logger.error("Error saving number format");
      }
      return success;
    } catch (error) {
      logger.error("Error saving number format:", error);
      return false;
    }
  }

  static async getSelectedFormat(): Promise<string | null> {
    try {
      const format = await load<string>(NUMBER_FORMAT_STORAGE_KEY);
      logger.debug(`Number format loaded: ${format}`);
      return format;
    } catch (error) {
      logger.error("Error getting selected number format:", error);
      return null;
    }
  }
}
