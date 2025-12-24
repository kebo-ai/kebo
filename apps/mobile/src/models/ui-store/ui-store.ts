import { types, Instance, SnapshotIn, SnapshotOut, flow } from "mobx-state-tree";

/**
 * UI Store Model using MobX-State-Tree (MST)
 */
export const UiStoreModel = types
  .model("UiStore")
  .props({
    isLoading: types.optional(types.boolean, false),
  })
  .actions((self) => {
    const showLoader = flow(function* () {
      self.isLoading = true;
    });
    const hideLoader = flow(function* () {
      self.isLoading = false;
    });
    return { showLoader, hideLoader };
  });

export interface UiStore extends Instance<typeof UiStoreModel> { }
export interface UiStoreSnapshotOut extends SnapshotOut<typeof UiStoreModel> { }
export interface UiStoreSnapshotIn extends SnapshotIn<typeof UiStoreModel> { }

export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {});
