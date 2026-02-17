import { types, Instance, SnapshotIn, SnapshotOut, flow } from "mobx-state-tree";

/**
 * UI Store Model using MobX-State-Tree (MST)
 */
export const UiStoreModel = types
  .model("UiStore")
  .props({
    isLoading: types.optional(types.boolean, false),
    sheetSelections: types.optional(types.map(types.string), {}),
  })
  .actions((self) => {
    const showLoader = flow(function* () {
      self.isLoading = true;
    });
    const hideLoader = flow(function* () {
      self.isLoading = false;
    });
    const setSheetSelection = (key: string, value: string) => {
      self.sheetSelections.set(key, value);
    };
    const getSheetSelection = (key: string): string | undefined => {
      return self.sheetSelections.get(key);
    };
    const clearSheetSelection = (key: string) => {
      self.sheetSelections.delete(key);
    };
    return {
      showLoader,
      hideLoader,
      setSheetSelection,
      getSheetSelection,
      clearSheetSelection,
    };
  });

export interface UiStore extends Instance<typeof UiStoreModel> { }
export interface UiStoreSnapshotOut extends SnapshotOut<typeof UiStoreModel> { }
export interface UiStoreSnapshotIn extends SnapshotIn<typeof UiStoreModel> { }

export const createUiStoreDefaultModel = () => types.optional(UiStoreModel, {});
