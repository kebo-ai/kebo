import { supabase } from "../config/supabase";
import logger from "../utils/logger";

export const getCategoriesUsers = async (
  apiKey: string,
  transaction_type?: "Income" | "Expense" | "Transfer" | "Investment" | "Other"
) => {
  const query = supabase
    .from("categories_users")
    .select("*")
    .eq("is_deleted", false);

  if (transaction_type) {
    query.eq("type", transaction_type);
  }

  const { data, error } = await query.order("updated_at", { ascending: false });

  if (error) {
    logger.error("Error fetching categories_users:", error.message);
    return null;
  }
  return data;
};

export const createCategoryUser = async (category: {
  type: "Income" | "Expense" | "Transfer" | "Investment" | "Other";
  name: string;
  icon_url?: string;
}) => {
  try {
    const cleanIconUrl = category.icon_url?.startsWith("/storage/")
      ? category.icon_url.replace(
          process.env.EXPO_PUBLIC_SUPABASE_URL || "",
          ""
        )
      : category.icon_url;

    const { data, error } = await supabase
      .from("categories_users")
      .insert([
        {
          type: category.type,
          name: category.name,
          icon_url: cleanIconUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Error inserting category_user:", error.message);
      return null;
    }

    logger.info("Category created successfully:", data);
    return data;
  } catch (error) {
    logger.error("Unexpected error creating category:", error);
    return null;
  }
};

export const deleteCategoryService = async (categoryId: string) => {
  logger.debug("Attempting to delete category with ID:", categoryId);

  const { data: updateData, error: updateError } = await supabase
    .from("categories_users")
    .update({ is_deleted: true })
    .eq("id", categoryId)
    .select();

  if (updateError) {
    logger.error("Error updating category:", {
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      code: updateError.code,
    });
    return { kind: "error", error: updateError };
  }

  const { data: verifyData, error: verifyError } = await supabase
    .from("categories_users")
    .select("is_deleted")
    .eq("id", categoryId)
    .single();

  if (verifyError) {
    logger.error("Error verifying category deletion:", verifyError);
    return { kind: "error", error: verifyError };
  }

  logger.debug("Category deletion status:", {
    categoryId,
    updateData,
    verifyData,
    isDeleted: verifyData?.is_deleted,
  });

  return {
    kind: "ok",
    data: verifyData,
    isDeleted: verifyData?.is_deleted,
  };
};

export const updateCategoryService = async (
  categoryId: string,
  updates: Partial<{
    type: "Income" | "Expense" | "Transfer" | "Investment" | "Other";
    name: string;
    icon_url?: string;
  }>
) => {
  logger.debug(
    "Attempting to update category with ID:",
    categoryId,
    "Updates:",
    updates
  );

  const { data, error } = await supabase
    .from("categories_users")
    .update(updates)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    logger.error("Error updating category:", {
      message: error.message,
      details: error.details,
      code: error.code,
    });
    return { kind: "error", error };
  }

  logger.info("Category updated successfully:", data);
  return { kind: "ok", data };
};

export const getIconSuggestions = async (query: string) => {
  try {
    const categoriesApiUrl = process.env.EXPO_PUBLIC_CATEGORIES_API_URL || "https://kebo-ai-categories-production.up.railway.app";
    const response = await fetch(
      `${categoriesApiUrl}/suggestions`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": process.env.EXPO_PUBLIC_BACKEND_API_KEY_CATEGORIES || "",
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error getting suggestions: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.suggestions && Array.isArray(data.suggestions)) {
      return data.suggestions;
    }

    return [];
  } catch (error) {
    return [];
  }
};
