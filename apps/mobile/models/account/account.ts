import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { translate } from "@/i18n";

/**
 * Modelo de Banco en MST
 */
export const AccountModel = types
  .model("Account")
  .props({
    id: types.string,
    user_id: types.string,
    name: types.string,
    customized_name: types.string,
    bank_id: types.string,
    icon_url: types.maybeNull(types.string),
    account_type_id: types.string,
    balance: types.number,
    sum__total_balance: types.optional(types.number, 0),
    account_type: types.optional(types.string, "-"),
  })
  .actions((self) => ({
    save(modelSnapshot: AccountSnapshotIn) {
      if (!modelSnapshot.user_id || typeof modelSnapshot.user_id !== "string") {
        throw new Error(
          "El ID de usuario es obligatorio y debe ser una cadena de texto válida"
        );
      }

      Object.assign(self, {
        id: modelSnapshot.id,
        user_id: modelSnapshot.user_id,
        name: modelSnapshot.name ?? translate("accountScreen:currentAccount"),
        customized_name:
          modelSnapshot.customized_name ??
          translate("accountScreen:nameAccount"),
        bank_id:
          modelSnapshot.bank_id ?? "644c05b9-e1f0-4a6f-a501-46b7960fe052",
        icon_url: modelSnapshot.icon_url ?? null,
        account_type_id:
          modelSnapshot.account_type_id ??
          "53ff432c-a2c0-4380-9db0-80e16e76c6bc",
        balance: modelSnapshot.sum__total_balance ?? modelSnapshot.balance ?? 0,
        sum__total_balance: modelSnapshot.sum__total_balance ?? 0,
        account_type: modelSnapshot.account_type ?? "-",
      });
    },
  }));

// TypeScript interfaces
export interface Account extends Instance<typeof AccountModel> {}
export interface AccountSnapshotOut extends SnapshotOut<typeof AccountModel> {}
export interface AccountSnapshotIn extends SnapshotIn<typeof AccountModel> {}
