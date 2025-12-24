import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";

/**
 * Modelo de Categoría en MST
 */
export const IconModel = types
  .model("Icon")
  .props({
    id: types.identifier,
    name: types.string,
    description: types.string,
    type: types.string,
    url: types.string,
  })
  .actions((self) => ({
    save(modelSnapshot: IconSnapshotIn) {
      self.id = modelSnapshot.id ?? "";
      self.name = modelSnapshot.name ?? "";
      self.description = modelSnapshot.description ?? "";
      self.type = modelSnapshot.type ?? "";
      self.url = modelSnapshot.url ?? "";
    },
  }));

// TypeScript interfaces
export interface Icon extends Instance<typeof IconModel> { }
export interface IconSnapshotOut extends SnapshotOut<typeof IconModel> { }
export interface IconSnapshotIn extends SnapshotIn<typeof IconModel> { }
