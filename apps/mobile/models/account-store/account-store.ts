import {
  cast,
  getRoot,
  flow,
  Instance,
  SnapshotIn,
  SnapshotOut,
  types,
} from "mobx-state-tree";
import {
  Account,
  AccountModel,
  AccountSnapshotIn,
  AccountSnapshotOut,
} from "@/models/account/account";
import {
  createAccountUser,
  getAccountsUsers,
  getAccountsWithBalance,
} from "@/services/account-service";
import {
  AccountType,
  AccountTypeModel,
  AccountTypeSnapshotOut,
} from "@/models/account-type-store/account-type";
import { getAccountsType } from "@/services/account-type-service";
import logger from "@/utils/logger";
/**
 * Model description here for TypeScript hints.
 */
export const AccountStoreModel = types
  .model("AccountStore")
  .props({
    accounts: types.optional(types.array(AccountModel), []),
    accountTypes: types.optional(types.array(AccountTypeModel), []),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .views((self) => ({}))
  .actions((self) => ({
    deleteAccountById: (id: string) => {
      const index = self.accounts.findIndex((account) => account.id === id);
      if (index !== -1) {
        self.accounts.splice(index, 1);
        return true;
      }
      return false;
    },
    saveAccount: (accounts: AccountSnapshotOut[]) => {
      logger.debug("Saving accounts count:", accounts.length);
      self.accounts = cast(accounts);
    },
    saveAccountType: (accountTypes: AccountTypeSnapshotOut[]) => {
      self.accountTypes = cast(accountTypes);
    },
    setLoading: (loading: boolean) => {
      self.isLoading = loading;
    },
    setError: (error: string | null) => {
      self.error = error;
    },
  }))
  .actions((self) => {
    const getListAccount = flow(function* () {
      try {
        logger.debug("Fetching accounts...");
        self.setLoading(true);
        self.setError(null);
        const result = yield getAccountsUsers();
        logger.debug("Accounts fetched:", result?.length || 0);
        if (result) {
          self.saveAccount(result);
          return true;
        }
      } catch (error) {
        logger.error("Error fetching accounts:", error);
        self.setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        self.setLoading(false);
      }
      return false;
    });

    const getListAccountType = flow(function* () {
      try {
        self.setLoading(true);
        self.setError(null);
        const result = yield getAccountsType();
        if (result) {
          self.saveAccountType(result);
          return true;
        }
      } catch (error) {
        logger.error("Error fetching account types:", error);
        self.setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        self.setLoading(false);
      }
    });

    const createAccount = flow(function* (account: AccountSnapshotIn) {
      try {
        self.setLoading(true);
        self.setError(null);
        const result = yield createAccountUser(account);
        if (result) {
          yield getListAccount();
          return result;
        }
      } catch (error) {
        logger.error("Error creating account:", error);
        self.setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        self.setLoading(false);
      }
      return false;
    });

    const AccountsWithBalance = flow(function* () {
      try {
        self.setLoading(true);
        self.setError(null);
        const result = yield getAccountsWithBalance();
        if (result) {
          const updatedAccounts = self.accounts.map((account) => {
            const balanceData = result.find(
              (r: any) => r.account_id === account.id
            );
            if (balanceData) {
              return {
                ...account,
                sum__total_balance:
                  balanceData.sum__total_balance || account.balance || 0,
                account_type: balanceData.account_type || "-",
              };
            }
            return account;
          });
          self.saveAccount(updatedAccounts);
          return true;
        }
      } catch (error) {
        logger.error("Error fetching accounts with balance:", error);
        self.setError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        self.setLoading(false);
      }
      return false;
    });

    return {
      getListAccount,
      createAccount,
      getListAccountType,
      AccountsWithBalance,
    };
  });

export interface AccountStore extends Instance<typeof AccountStoreModel> {}

export interface AccountStoreSnapshotOut
  extends SnapshotOut<typeof AccountStoreModel> {}

export interface AccountStoreSnapshotIn
  extends SnapshotIn<typeof AccountStoreModel> {}

export const createAccountStoreDefaultModel = () =>
  types.optional(AccountStoreModel, {});
