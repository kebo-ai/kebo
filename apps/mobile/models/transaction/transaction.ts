import {
  cast,
  types,
  Instance,
  SnapshotIn,
  SnapshotOut,
  flow,
  getRoot,
  IAnyModelType,
  applySnapshot,
} from "mobx-state-tree";
import { TransactionService } from "@/services/transaction-service";
import { RootStore } from "@/models/root-store";
import { CategoryStoreModel } from "@/models/category-store/category-store";
import { translate } from "@/i18n/translate";
import logger from "@/utils/logger";

/**
 * Transaction types enum
 */
const TransactionTypeEnum = types.enumeration("TransactionType", [
  "Income",
  "Expense",
  "Transfer",
  "Investment",
  "Other",
]);

type TransactionModelType = Instance<typeof TransactionModel>;

/**
 * Modelo de Transacción
 */
export const TransactionModel = types
  .model("Transaction")
  .props({
    account_id: types.optional(types.string, ""),
    account_name: types.optional(types.string, ""),
    account_url: types.optional(types.string, ""),
    from_account_id: types.optional(types.string, ""),
    from_account_name: types.optional(types.string, ""),
    from_account_url: types.optional(types.string, ""),
    to_account_id: types.optional(types.string, ""),
    to_account_name: types.optional(types.string, ""),
    to_account_url: types.optional(types.string, ""),
    amount: types.optional(types.number, 0),
    currency: types.optional(types.string, "USD"),
    transaction_type: types.optional(TransactionTypeEnum, "Expense"),
    category_name: types.optional(types.string, ""),
    category_id: types.optional(types.string, ""),
    icon_url: types.optional(types.string, ""),
    income_category_name: types.optional(types.string, ""),
    income_category_id: types.optional(types.string, ""),
    income_icon_url: types.optional(types.string, ""),
    expense_category_name: types.optional(types.string, ""),
    expense_category_id: types.optional(types.string, ""),
    expense_icon_url: types.optional(types.string, ""),
    date: types.optional(types.string, ""),
    description: types.optional(types.string, ""),
    Transaction_id: types.optional(types.string, ""),
    is_recurring: types.optional(types.boolean, false),
    recurrence_cadence: types.optional(types.string, ""),
    recurrence_end_date: types.optional(types.string, ""),
    metadata: types.optional(
      types.frozen<{
        note?: string;
        source?: string;
        Photography?: string;
        Photography2?: string;
        map_coordinates?: string;
      }>(),
      {}
    ),
    updated_at: types.maybeNull(types.string),
    is_deleted: types.optional(types.boolean, false),
    deleted_at: types.maybeNull(types.string),
    category_initial: types.optional(types.string, ""),
    income_last_category_name: types.optional(types.string, ""),
    income_last_category_id: types.optional(types.string, ""),
    income_last_icon_url: types.optional(types.string, ""),
    expense_last_category_name: types.optional(types.string, ""),
    expense_last_category_id: types.optional(types.string, ""),
    expense_last_icon_url: types.optional(types.string, ""),
    last_expense_category_id: types.optional(types.string, ""),
    last_expense_category_name: types.optional(types.string, ""),
    last_expense_icon_url: types.optional(types.string, ""),
    last_expense_account_id: types.optional(types.string, ""),
    last_expense_account_name: types.optional(types.string, ""),
    last_expense_account_url: types.optional(types.string, ""),
    last_income_category_id: types.optional(types.string, ""),
    last_income_category_name: types.optional(types.string, ""),
    last_income_icon_url: types.optional(types.string, ""),
    last_income_account_id: types.optional(types.string, ""),
    last_income_account_name: types.optional(types.string, ""),
    last_income_account_url: types.optional(types.string, ""),
    last_transfer_from_account_id: types.optional(types.string, ""),
    last_transfer_from_account_name: types.optional(types.string, ""),
    last_transfer_from_account_url: types.optional(types.string, ""),
    last_transfer_to_account_id: types.optional(types.string, ""),
    last_transfer_to_account_name: types.optional(types.string, ""),
    last_transfer_to_account_url: types.optional(types.string, ""),
    isEditing: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get rootStore(): RootStore {
      return getRoot<RootStore>(self);
    },
  }))
  .actions((self) => {
    // --- Helper functions ---
    // Helper to clear fields specific to Expense/Income
    function clearExpenseIncomeFields() {
      self.account_id = "";
      self.account_name = "";
      self.account_url = "";
      self.category_id = "";
      self.category_name = "";
      self.icon_url = "";
    }

    // Helper to clear fields specific to Transfer
    function clearTransferFields() {
      self.from_account_id = "";
      self.from_account_name = "";
      self.from_account_url = "";
      self.to_account_id = "";
      self.to_account_name = "";
      self.to_account_url = "";
    }

    // --- Main Actions ---
    // Generic field updater
    function updateField<K extends keyof TransactionSnapshotIn>(
      field: K,
      value: TransactionSnapshotIn[K]
    ) {
      // Use TransactionSnapshotIn for broader key compatibility
      // Basic type checking and ensure it's a writable property
      if (
        typeof (self as any)[field] !== "function" &&
        !(field as string).startsWith("$")
      ) {
        // Use 'as any' to bypass stricter index signature checks inside the action
        (self as any)[field] = value;
      } else {
        logger.warn(
          `Attempted to update non-writable field or method: ${String(field)}`
        );
      }
    }

    // Define initializeFieldsForType within the actions scope
    function initializeFieldsForType(type: typeof TransactionTypeEnum.Type) {
      const { categoryStoreModel, accountStoreModel } = self.rootStore;
      const { accounts } = accountStoreModel;
      // Use the specific category views from the store
      const { expenseCategories, incomeCategories } = categoryStoreModel;

      if (type === "Expense") {
        // Check for persisted last used category first
        const targetCategoryId = self.last_expense_category_id;
        let targetCategory = expenseCategories.find(
          (c) => c.id === targetCategoryId
        );

        // If no persisted one, or it's no longer valid, get the first expense category
        if (!targetCategory && expenseCategories.length > 0) {
          targetCategory = expenseCategories[0];
        }

        if (targetCategory) {
          self.category_id = targetCategory.id;
          self.category_name = targetCategory.name || "";
          self.icon_url = targetCategory.icon_url || "";
        } else {
          // Handle case where there are no expense categories at all
          self.category_id = "";
          self.category_name = "";
          self.icon_url = "";
        }

        // Account handling remains the same
        const targetAccountId = self.last_expense_account_id;
        const targetAccount = accounts.find((a) => a.id === targetAccountId);

        if (targetAccount) {
          self.account_id = targetAccount.id;
          self.account_name =
            targetAccount.name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : targetAccount.name === "Efectivo"
              ? translate("modalAccount:cash")
              : targetAccount.name || "";
          self.account_url = targetAccount.icon_url || "";
        } else if (accounts.length > 0) {
          self.account_id = accounts[0].id;
          self.account_name =
            accounts[0].name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : accounts[0].name === "Efectivo"
              ? translate("modalAccount:cash")
              : accounts[0].name || "";
          self.account_url = accounts[0].icon_url || "";
        } else {
          self.account_id = "";
          self.account_name = "";
          self.account_url = "";
        }
        clearTransferFields();
      } else if (type === "Income") {
        // Check for persisted last used category first
        const targetCategoryId = self.last_income_category_id;
        let targetCategory = incomeCategories.find(
          (c) => c.id === targetCategoryId
        );

        // If no persisted one, or it's no longer valid, get the first income category
        if (!targetCategory && incomeCategories.length > 0) {
          targetCategory = incomeCategories[0];
        }

        if (targetCategory) {
          self.category_id = targetCategory.id;
          self.category_name = targetCategory.name || "";
          self.icon_url = targetCategory.icon_url || "";
        } else {
          // Handle case where there are no income categories at all
          self.category_id = "";
          self.category_name = "";
          self.icon_url = "";
        }

        // Account handling remains the same
        const targetAccountId = self.last_income_account_id;
        const targetAccount = accounts.find((a) => a.id === targetAccountId);

        if (targetAccount) {
          self.account_id = targetAccount.id;
          self.account_name =
            targetAccount.name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : targetAccount.name === "Efectivo"
              ? translate("modalAccount:cash")
              : targetAccount.name || "";
          self.account_url = targetAccount.icon_url || "";
        } else if (accounts.length > 0) {
          self.account_id = accounts[0].id;
          self.account_name =
            accounts[0].name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : accounts[0].name === "Efectivo"
              ? translate("modalAccount:cash")
              : accounts[0].name || "";
          self.account_url = accounts[0].icon_url || "";
        } else {
          self.account_id = "";
          self.account_name = "";
          self.account_url = "";
        }
        clearTransferFields();
      } else if (type === "Transfer") {
        // Use the correct property names defined in .props()
        const fromAccount = accounts.find(
          (a) => a.id === self.last_transfer_from_account_id
        );
        const toAccount = accounts.find(
          (a) =>
            a.id === self.last_transfer_to_account_id &&
            a.id !== self.last_transfer_from_account_id
        );

        // ... (rest of transfer logic using correct property names and clearExpenseIncomeFields)
        if (fromAccount) {
          self.from_account_id = fromAccount.id;
          self.from_account_name =
            fromAccount.name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : fromAccount.name === "Efectivo"
              ? translate("modalAccount:cash")
              : fromAccount.name || "";
          self.from_account_url = fromAccount.icon_url || "";
        } else if (accounts.length > 0) {
          self.from_account_id = accounts[0].id;
          self.from_account_name =
            accounts[0].name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : accounts[0].name === "Efectivo"
              ? translate("modalAccount:cash")
              : accounts[0].name || "";
          self.from_account_url = accounts[0].icon_url || "";
        } else {
          clearTransferFields(); // Clear all transfer fields if no 'from' can be set
        }

        if (toAccount) {
          self.to_account_id = toAccount.id;
          self.to_account_name =
            toAccount.name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : toAccount.name === "Efectivo"
              ? translate("modalAccount:cash")
              : toAccount.name || "";
          self.to_account_url = toAccount.icon_url || "";
        } else if (
          accounts.length > 1 &&
          accounts[1].id !== self.from_account_id
        ) {
          self.to_account_id = accounts[1].id;
          self.to_account_name =
            accounts[1].name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : accounts[1].name === "Efectivo"
              ? translate("modalAccount:cash")
              : accounts[1].name || "";
          self.to_account_url = accounts[1].icon_url || "";
        } else if (
          accounts.length > 0 &&
          accounts[0].id !== self.from_account_id
        ) {
          self.to_account_id = accounts[0].id;
          self.to_account_name =
            accounts[0].name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : accounts[0].name === "Efectivo"
              ? translate("modalAccount:cash")
              : accounts[0].name || "";
          self.to_account_url = accounts[0].icon_url || "";
        } else if (!fromAccount && accounts.length > 1) {
          // Case where fromAccount defaulted to accounts[0]
          self.to_account_id = accounts[1].id;
          self.to_account_name =
            accounts[1].name === "Banco Personalizado"
              ? translate("components:bankModal.customBank")
              : accounts[1].name === "Efectivo"
              ? translate("modalAccount:cash")
              : accounts[1].name || "";
          self.to_account_url = accounts[1].icon_url || "";
        } else {
          // Cannot set distinct 'to' account
          self.to_account_id = "";
          self.to_account_name = "";
          self.to_account_url = "";
        }

        clearExpenseIncomeFields(); // Call helper defined above
      }
    }

    // Sets the current transaction type and initializes associated fields
    function setTransactionType(type: typeof TransactionTypeEnum.Type) {
      // Store the current type before changing it
      const previousType = self.transaction_type;

      // Update the type
      self.transaction_type = type;

      // Only initialize if necessary
      if (
        type === "Expense" &&
        !self.last_expense_category_id &&
        !self.expense_last_category_id
      ) {
        logger.debug("Initializing fields for Expense - no previous category");
        initializeFieldsForType(type);
      } else if (
        type === "Income" &&
        !self.last_income_category_id &&
        !self.income_last_category_id
      ) {
        logger.debug("Initializing fields for Income - no previous category");
        initializeFieldsForType(type);
      } else if (
        type === "Transfer" &&
        !self.last_transfer_from_account_id &&
        !self.from_account_id
      ) {
        logger.debug("Initializing fields for Transfer - no previous accounts");
        initializeFieldsForType(type);
      } else {
        logger.debug(`Using previous data for ${type}`);

        // Instead of initializing, load the saved data manually
        if (type === "Expense") {
          if (self.last_expense_category_id) {
            self.category_id = self.last_expense_category_id;
            self.category_name = self.last_expense_category_name || "";
            self.icon_url = self.last_expense_icon_url || "";
          } else if (self.expense_last_category_id) {
            self.category_id = self.expense_last_category_id;
            self.category_name = self.expense_last_category_name || "";
            self.icon_url = self.expense_last_icon_url || "";
          }
          clearTransferFields();
        } else if (type === "Income") {
          if (self.last_income_category_id) {
            self.category_id = self.last_income_category_id;
            self.category_name = self.last_income_category_name || "";
            self.icon_url = self.last_income_icon_url || "";
          } else if (self.income_last_category_id) {
            self.category_id = self.income_last_category_id;
            self.category_name = self.income_last_category_name || "";
            self.icon_url = self.income_last_icon_url || "";
          }
          clearTransferFields();
        } else if (type === "Transfer") {
          if (self.last_transfer_from_account_id) {
            self.from_account_id = self.last_transfer_from_account_id;
            self.from_account_name = self.last_transfer_from_account_name || "";
            self.from_account_url = self.last_transfer_from_account_url || "";
          }
          if (self.last_transfer_to_account_id) {
            self.to_account_id = self.last_transfer_to_account_id;
            self.to_account_name = self.last_transfer_to_account_name || "";
            self.to_account_url = self.last_transfer_to_account_url || "";
          }
          clearExpenseIncomeFields();
        }
      }
    }

    // Call this when a category is selected in the UI
    function setSelectedCategory(category: {
      id: string;
      name?: string;
      icon_url?: string;
    }) {
      self.category_id = category.id;
      self.category_name = category.name || "";
      self.icon_url = category.icon_url || "";

      // Only persist if not in editing mode
      if (!self.isEditing) {
        if (self.transaction_type === "Expense") {
          self.last_expense_category_id = category.id;
          self.last_expense_category_name = category.name || "";
          self.last_expense_icon_url = category.icon_url || "";
        } else if (self.transaction_type === "Income") {
          self.last_income_category_id = category.id;
          self.last_income_category_name = category.name || "";
          self.last_income_icon_url = category.icon_url || "";
        }
      }
    }

    // Call this when an account is selected for Expense/Income
    function setSelectedAccount(account: {
      id: string;
      name?: string;
      icon_url?: string;
    }) {
      self.account_id = account.id;
      self.account_name = account.name || "";
      self.account_url = account.icon_url || "";

      if (self.transaction_type === "Expense") {
        self.last_expense_account_id = account.id;
        self.last_expense_account_name = account.name || "";
        self.last_expense_account_url = account.icon_url || "";
      } else if (self.transaction_type === "Income") {
        self.last_income_account_id = account.id;
        self.last_income_account_name = account.name || "";
        self.last_income_account_url = account.icon_url || "";
      }
    }

    // Call this when 'from' account is selected for Transfer
    function setSelectedFromAccount(account: {
      id: string;
      name?: string;
      icon_url?: string;
    }) {
      self.from_account_id = account.id;
      self.from_account_name = account.name || "";
      self.from_account_url = account.icon_url || "";

      // Only persist if not in editing mode
      if (!self.isEditing) {
        self.last_transfer_from_account_id = account.id;
        self.last_transfer_from_account_name = account.name || "";
        self.last_transfer_from_account_url = account.icon_url || "";
      }
    }

    // Call this when 'to' account is selected for Transfer
    function setSelectedToAccount(account: {
      id: string;
      name?: string;
      icon_url?: string;
    }) {
      self.to_account_id = account.id;
      self.to_account_name = account.name || "";
      self.to_account_url = account.icon_url || "";

      // Only persist if not in editing mode
      if (!self.isEditing) {
        self.last_transfer_to_account_id = account.id;
        self.last_transfer_to_account_name = account.name || "";
        self.last_transfer_to_account_url = account.icon_url || "";
      }
    }

    // Resets transaction state for creating a new one, keeping persisted defaults
    function resetForNewTransaction(
      defaultType: typeof TransactionTypeEnum.Type = "Expense"
    ) {
      self.Transaction_id = "";
      self.description = "";
      self.metadata = {};
      self.is_recurring = false;
      self.recurrence_cadence = "";
      self.recurrence_end_date = "";
      setTransactionType(defaultType);
    }

    // Function to completely reset all data
    function resetAllData() {
      // Create an object with all default values
      const defaultValues = {
        account_id: "",
        account_name: "",
        account_url: "",
        from_account_id: "",
        from_account_name: "",
        from_account_url: "",
        to_account_id: "",
        to_account_name: "",
        to_account_url: "",
        amount: 0,
        currency: "USD",
        transaction_type: "Expense" as typeof TransactionTypeEnum.Type,
        category_name: "",
        category_id: "",
        icon_url: "",
        income_category_name: "",
        income_category_id: "",
        income_icon_url: "",
        expense_category_name: "",
        expense_category_id: "",
        expense_icon_url: "",
        date: "",
        description: "",
        Transaction_id: "",
        is_recurring: false,
        recurrence_cadence: "",
        recurrence_end_date: "",
        metadata: {},
        updated_at: null,
        is_deleted: false,
        deleted_at: null,
        category_initial: "",
        income_last_category_name: "",
        income_last_category_id: "",
        income_last_icon_url: "",
        expense_last_category_name: "",
        expense_last_category_id: "",
        expense_last_icon_url: "",
        last_expense_category_id: "",
        last_expense_category_name: "",
        last_expense_icon_url: "",
        last_expense_account_id: "",
        last_expense_account_name: "",
        last_expense_account_url: "",
        last_income_category_id: "",
        last_income_category_name: "",
        last_income_icon_url: "",
        last_income_account_id: "",
        last_income_account_name: "",
        last_income_account_url: "",
        last_transfer_from_account_id: "",
        last_transfer_from_account_name: "",
        last_transfer_from_account_url: "",
        last_transfer_to_account_id: "",
        last_transfer_to_account_name: "",
        last_transfer_to_account_url: "",
        isEditing: false,
      };

      // Apply the snapshot with default values
      applySnapshot(self, defaultValues);

      logger.debug("Transaction model reset to initial values");
    }

    function setMetadata(metadata: typeof self.metadata) {
      self.metadata = metadata;
    }

    function setRecurrenceDetails(cadence: string, endDate?: string) {
      if (cadence && cadence !== "Never") {
        self.is_recurring = true;
        self.recurrence_cadence = cadence;
        self.recurrence_end_date = endDate || "";
      } else {
        self.is_recurring = false;
        self.recurrence_cadence = "";
        self.recurrence_end_date = "";
      }
    }

    // Action to set editing mode
    function setEditingMode(isEditing: boolean) {
      self.isEditing = isEditing;
    }

    // --- Service Interactions (ensure they are defined or kept from previous state) ---
    const createGenericTransaction = flow(function* (): Generator<
      any,
      any,
      any
    > {
      try {
        const transactionData = {
          account_id: self.account_id,
          amount: self.amount,
          currency: self.currency,
          transaction_type: self.transaction_type,
          date: self.date,
          description: self.description,
          category_id: self.category_id,
          is_recurring: self.is_recurring,
          recurrence_cadence: self.is_recurring
            ? self.recurrence_cadence
            : undefined,
          recurrence_end_date: self.is_recurring
            ? self.recurrence_end_date
            : undefined,
          metadata: self.metadata,
        };
        const result = yield TransactionService.createTransaction(
          transactionData
        );
        self.Transaction_id = result.id;
        return result;
      } catch (error) {
        logger.error("Error in createGenericTransaction:", error);
        throw error;
      }
    });

    const createTransferTransaction = flow(function* (): Generator<
      any,
      any,
      any
    > {
      try {
        if (!self.from_account_id || !self.to_account_id) {
          throw new Error("From and To accounts are required for transfer");
        }
        const transferData = {
          from_account_id: self.from_account_id,
          to_account_id: self.to_account_id,
          amount: self.amount,
          currency: self.currency,
          description: self.description,
          category_id: self.category_id,
          is_recurring: self.is_recurring,
          metadata: self.metadata,
          date: self.date,
          recurrence_cadence: self.is_recurring
            ? self.recurrence_cadence
            : undefined,
          recurrence_end_date: self.is_recurring
            ? self.recurrence_end_date
            : undefined,
        };
        const result = yield TransactionService.createTransferTransaction(
          transferData
        );
        // self.Transaction_id = result.id || result[0]?.id; // Adjust based on actual return value
        return result;
      } catch (error) {
        logger.error("Error in createTransferTransaction:", error);
        throw error;
      }
    });

    const updateTransaction = flow(function* (): Generator<any, any, any> {
      try {
        if (!self.Transaction_id) {
          throw new Error("Transaction ID is required for update");
        }
        const transactionData = {
          account_id:
            self.transaction_type !== "Transfer" ? self.account_id : undefined,
          from_account_id:
            self.transaction_type === "Transfer"
              ? self.from_account_id
              : undefined,
          to_account_id:
            self.transaction_type === "Transfer"
              ? self.to_account_id
              : undefined,
          amount: self.amount,
          currency: self.currency,
          transaction_type: self.transaction_type,
          date: self.date,
          description: self.description,
          category_id:
            self.transaction_type !== "Transfer" ? self.category_id : undefined,
          is_recurring: self.is_recurring,
          recurrence_cadence: self.is_recurring
            ? self.recurrence_cadence
            : undefined,
          recurrence_end_date: self.is_recurring
            ? self.recurrence_end_date
            : undefined,
          metadata: self.metadata,
          updated_at: new Date().toISOString(),
        };
        const result = yield TransactionService.updateTransaction(
          self.Transaction_id,
          transactionData
        );
        return result;
      } catch (error) {
        logger.error("Error in updateTransaction:", error);
        throw error;
      }
    });

    const deleteTransaction = flow(function* (): Generator<any, any, any> {
      try {
        if (!self.Transaction_id) {
          throw new Error("Transaction ID is required for delete");
        }
        yield TransactionService.deleteTransaction(self.Transaction_id);
      } catch (error) {
        logger.error("Error in deleteTransaction:", error);
        throw error;
      }
    });

    const saveTransaction = flow(function* (): Generator<any, any, any> {
      if (self.Transaction_id) {
        return yield updateTransaction();
      } else {
        if (self.transaction_type === "Transfer") {
          return yield createTransferTransaction();
        } else {
          return yield createGenericTransaction();
        }
      }
    });

    // --- Return all public actions ---
    return {
      updateField,
      setTransactionType,
      setSelectedCategory,
      setSelectedAccount,
      setSelectedFromAccount,
      setSelectedToAccount,
      resetForNewTransaction,
      resetAllData,
      setMetadata,
      setRecurrenceDetails,
      saveTransaction,
      deleteTransaction,
      setEditingMode,
    };
  });

export interface Transaction extends Instance<typeof TransactionModel> {}
export interface TransactionSnapshotOut
  extends SnapshotOut<typeof TransactionModel> {}
export interface TransactionSnapshotIn
  extends SnapshotIn<typeof TransactionModel> {}
export type ITransaction = Instance<typeof TransactionModel>;
export { TransactionTypeEnum };
