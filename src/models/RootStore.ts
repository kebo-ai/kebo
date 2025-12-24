import { Instance, SnapshotOut, types } from "mobx-state-tree";
import { CategoryStoreModel } from "./category-store/category-store";
import { TransactionModel } from "./transaction/transaction";
import { BankStoreModel } from "./bank-store/bank-store";
import { UiStoreModel } from "./ui-store/ui-store";
import { AccountStoreModel } from "./account-store/account-store";
import { ProfileModel } from "./profile/profile";

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model("RootStore")
  .props({})
  .props({
    categoryStoreModel: types.optional(CategoryStoreModel, {} as any),
    transactionModel: types.optional(TransactionModel, {} as any),
    bankStoreModel: types.optional(BankStoreModel, {} as any),
    accountStoreModel: types.optional(AccountStoreModel, {} as any),
    uiStoreModel: types.optional(UiStoreModel, {} as any),
    profileModel: types.optional(ProfileModel, {} as any),
  });

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
