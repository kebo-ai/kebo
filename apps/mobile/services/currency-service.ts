import { save, load } from "@/utils/storage/storage";
import { Currency } from "@/data/currencies";
import logger from "@/utils/logger";

const CURRENCY_STORAGE_KEY = "user-selected-currency";

export class CurrencyService {
  static async saveSelectedCurrency(currency: Currency): Promise<boolean> {
    try {
      const success = await save(CURRENCY_STORAGE_KEY, currency);
      if (success) {
        logger.debug(`Currency saved: ${currency.code} - ${currency.currency}`);
      } else {
        logger.error("Error saving currency");
      }
      return success;
    } catch (error) {
      logger.error("Error saving currency:", error);
      return false;
    }
  }

  static async getSelectedCurrency(): Promise<Currency | null> {
    try {
      const currency = await load<Currency>(CURRENCY_STORAGE_KEY);
      logger.debug(`Currency loaded: ${currency?.code || 'none'}`);
      return currency;
    } catch (error) {
      logger.error("Error getting selected currency:", error);
      return null;
    }
  }

  static async clearSelectedCurrency(): Promise<void> {
    try {
      await save(CURRENCY_STORAGE_KEY, null);
      logger.debug("Currency deleted from storage");
    } catch (error) {
      logger.error("Error clearing selected currency:", error);
    }
  }
}
