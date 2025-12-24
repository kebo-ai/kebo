import { cast, getRoot, flow, Instance, SnapshotIn, SnapshotOut, types, IAnyModelType } from "mobx-state-tree";
import { CategoryModel, CategorySnapshotOut, Category } from "../category/category";
import { RootStore } from "../RootStore";
import { createCategoryUser, getCategoriesUsers } from "../../services/CategoryService";
import { getIcons as getIconsService } from "../../services/IconsService";
import { IconModel, IconSnapshotOut } from "../icon/icon";
import logger from "../../utils/logger";

/**
 * Model description here for TypeScript hints.
 */
export const CategoryStoreModel = types
  .model("CategoryStore")
  .props({
    categories: types.optional(types.array(CategoryModel), []),
    icons: types.optional(types.array(IconModel), []),
  })
  .views((self): { 
      getInitialCategory: () => Category | null;
    expenseCategories: Category[];
    incomeCategories: Category[];
     } => ({
    getInitialCategory(): Category | null {
      const initialCategoryId = process.env.EXPO_PUBLIC_INITIAL_CATEGORY;
      if (!initialCategoryId) return null;

      const result = self.categories.find(
        (category) => category.category_id == initialCategoryId
      ) || null;
      return result ? cast(result) : null;
    },
    get expenseCategories(): Category[] {
      return self.categories.filter((cat) => cat.type === "Expense");
    },
    get incomeCategories(): Category[] {
      return self.categories.filter((cat) => cat.type === "Income");
    }
  }))
  .actions((self) => ({
    saveCategories: (categories: CategorySnapshotOut[]) => {
      self.categories = cast(categories);
    },
    saveIcons: (icons: IconSnapshotOut[]) => {
      self.icons = cast(icons);
    },
  }))
  .actions((self) => {
    const getCategories = flow(function* (transaction_type?: "Income" | "Expense" | "Transfer" | "Investment" | "Other") {
      try {
        const result = yield getCategoriesUsers(transaction_type);
        if (result) {
          self.saveCategories(result);
          return true;
        }
        logger.error("Failed to get categories:", result);
      } catch (error) {
        logger.debug("Category fetch error:", error);
      }
      return false;
    });

    const createCategory = flow(function* (category: {
      type: "Income" | "Expense" | "Transfer" | "Investment" | "Other";
      name: string;
      icon_url: string;
    }) {
      try {
        const result = yield createCategoryUser(category);
        if (result) {
          yield getCategories();
          return result;
        }
      } catch (error) {
        logger.debug("Get categories error:", error);
      }
      return false;
    });

    const getIcons = flow(function* () {
      try {
        const result = yield getIconsService();
        if (result) {
          self.saveIcons(result);
          return true;
        }
      } catch (error) {
        logger.debug("Category create error:", error);
      }
      return false;
    });

    return { getCategories, createCategory, getIcons };
  });

export interface CategoryStore extends Instance<typeof CategoryStoreModel> { }

export interface CategoryStoreSnapshotOut extends SnapshotOut<typeof CategoryStoreModel> { }

export interface CategoryStoreSnapshotIn extends SnapshotIn<typeof CategoryStoreModel> { }

export const createCategoryStoreDefaultModel = () => types.optional(CategoryStoreModel, {});
