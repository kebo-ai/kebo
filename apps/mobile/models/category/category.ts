import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";

/**
 * Modelo de Categoría en MST
 */
export const CategoryModel = types
  .model("Category")
  .props({
    category_id: types.maybeNull(types.string),
    color_id: types.maybeNull(types.string),
    icon_emoji: types.maybeNull(types.string),
    icon_url: types.maybeNull(types.string),
    name: types.maybeNull(types.string),
    id: types.string,
    type: types.enumeration("Type", ["Expense", "Income", "Transfer", "Investment", "Other"]),
    user_id: types.string,
    is_visible: types.boolean
  })
  .actions((self) => ({
    save(modelSnapshot: CategorySnapshotIn) {
      self.category_id = modelSnapshot.category_id ?? "";
      self.color_id = modelSnapshot.color_id ?? null;
      self.icon_emoji = modelSnapshot.icon_emoji ?? null;
      self.icon_url = modelSnapshot.icon_url ?? "";
      self.id = modelSnapshot.id ?? "";
      self.name = modelSnapshot.name ?? "";
      self.type = modelSnapshot.type;
      self.user_id = modelSnapshot.user_id ?? "";
      self.is_visible = modelSnapshot.is_visible ?? "";
    },
  }));

// TypeScript interfaces
export interface Category extends Instance<typeof CategoryModel> { }
export interface CategorySnapshotOut extends SnapshotOut<typeof CategoryModel> { }
export interface CategorySnapshotIn extends SnapshotIn<typeof CategoryModel> { }
