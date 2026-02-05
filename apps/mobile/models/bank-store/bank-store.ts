import { cast, getRoot, flow, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { BankModel, BankSnapshotOut } from "@/models/bank/bank";
import { getBanks, getBanksByCountry, searchBanksService, searchBanksByCountryService } from "@/services/BankService";
import logger from "@/utils/logger";

/**
 * Model description here for TypeScript hints.
 */
export const BankStoreModel = types
  .model("BankStore")
  .props({
    banks: types.optional(types.array(BankModel), []),
  })
  .views((self) => ({}))
  .actions((self) => ({
    saveBanks: (banks: BankSnapshotOut[]) => {
      self.banks = cast(banks);
    },
  }))
  .actions((self) => {
    const getListBanks = flow(function* () {
      try {
        const result = yield getBanks();
        if (result) {
          self.saveBanks(result);
          return true;
        }
      } catch (error) {
        logger.debug("Banks fetch error:", error);
      }
      return false;
    });
    const getListBanksByCountry = flow(function* (country: string) {
      try {
        const result = yield getBanksByCountry(country);
        if (result) {
          self.saveBanks(result);
          return true;
        }
      } catch (error) {
        logger.debug("Banks by country fetch error:", error);
      }
      return false;
    });
    const searchBanks = flow(function* (query: string) {
      try {
        const response = yield searchBanksService(query);
        if (response.kind === "ok" && response.data) {
          self.saveBanks(response.data);
        }
      } catch (error) {
        logger.error("Failed to search banks:", error);
      }
    });
    const searchBanksByCountry = flow(function* (query: string, country: string) {
      try {
        const response = yield searchBanksByCountryService(query, country);
        if (response.kind === "ok" && response.data) {
          self.saveBanks(response.data);
        }
      } catch (error) {
        logger.error("Failed to search banks by country:", error);
      }
    });

    return { getListBanks, getListBanksByCountry, searchBanks, searchBanksByCountry };
  });

export interface BankStore extends Instance<typeof BankStoreModel> { }

export interface BankStoreSnapshotOut extends SnapshotOut<typeof BankStoreModel> { }

export interface BankStoreSnapshotIn extends SnapshotIn<typeof BankStoreModel> { }

export const createBankStoreDefaultModel = () => types.optional(BankStoreModel, {});
