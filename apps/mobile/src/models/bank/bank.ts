import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";

/**
 * Modelo de Banco en MST
 */
export const BankModel = types
  .model("Bank")
  .props({
    id: types.string,
    name: types.maybeNull(types.string),
    country_code: types.maybeNull(types.string),
    open_finance_integrated: types.boolean,
    created_at: types.maybeNull(types.string),
    updated_at: types.maybeNull(types.string),
    is_deleted: types.boolean,
    deleted_at: types.maybeNull(types.string),
    bank_url: types.maybeNull(types.string),
  })
  .actions((self) => ({
    save(modelSnapshot: BankSnapshotIn) {
      if (!modelSnapshot.id || typeof modelSnapshot.id !== 'string') {
        throw new Error("El ID es obligatorio y debe ser una cadena de texto válida");
      }

      Object.assign(self, {
        id: modelSnapshot.id,
        name: modelSnapshot.name ?? null,
        country_code: modelSnapshot.country_code ?? null,
        open_finance_integrated: Boolean(modelSnapshot.open_finance_integrated),
        created_at: modelSnapshot.created_at ?? null,
        updated_at: modelSnapshot.updated_at ?? null,
        is_deleted: Boolean(modelSnapshot.is_deleted),
        deleted_at: modelSnapshot.deleted_at ?? null,
        bank_url: modelSnapshot.bank_url ?? null,
      });
    },
  }));

// TypeScript interfaces
export interface Bank extends Instance<typeof BankModel> { }
export interface BankSnapshotOut extends SnapshotOut<typeof BankModel> { }
export interface BankSnapshotIn extends SnapshotIn<typeof BankModel> { }
