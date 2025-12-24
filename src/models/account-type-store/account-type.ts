import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";

/**
 * Modelo de Tipo de Cuenta en MST
 */
export const AccountTypeModel = types
  .model("AccountType")
  .props({
    id: types.string,
    type_name: types.string,
    description: types.string,
    created_at: types.string,
    updated_at: types.string,
    deleted_at: types.maybeNull(types.string),
    is_deleted: types.boolean,
  })
  .views((self) => ({
    // Add views if needed
  }))
  .actions((self) => ({
    save(modelSnapshot: AccountTypeSnapshotIn) {
      if (!modelSnapshot.id || typeof modelSnapshot.id !== 'string') {
        throw new Error("El ID es obligatorio y debe ser una cadena de texto válida");
      }

      Object.assign(self, modelSnapshot);
    },
  }));

// TypeScript interfaces
export interface AccountType extends Instance<typeof AccountTypeModel> { }
export interface AccountTypeSnapshotOut extends SnapshotOut<typeof AccountTypeModel> { }
export interface AccountTypeSnapshotIn extends SnapshotIn<typeof AccountTypeModel> { }
