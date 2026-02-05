import { supabase } from "@/config/supabase";
import { BudgetResponse } from "@/types/transaction";
import logger from "@/utils/logger";

interface Budget {
  budget_amount: number | null;
  total_metrics?: {
    total_budget?: number;
    total_spent?: number;
    total_remaining?: number;
    overall_progress_percentage?: number;
  };
  [key: string]: any;
}

interface UpsertBudgetRequest {
  p_budget_id: string;
  p_budget: {
    custom_name: string;
    start_date: string;
    end_date: string;
    is_recurrent: boolean;
    budget_amount: number;
    budget_lines: Array<{
      category_id: string;
      amount: number;
    }>;
  };
}

class BudgetService {
  async createBudget(
    custom_name: string,
    start_date: string,
    end_date: string
  ): Promise<{ id: string } | null> {
    try {
      logger.debug("Creating budget with params:", {
        custom_name,
        start_date,
        end_date,
      });

      const { data, error } = await supabase.rpc("upsert_budget", {
        p_budget_id: null,
        p_budget: {
          custom_name,
          start_date,
          end_date,
          is_recurrent: false,
          budget_amount: 0,
          budget_lines: [],
        },
      });

      if (error) {
        logger.error("Error creating budget:", error);
        return null;
      }

      if (typeof data === "string") {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.budget?.id) {
            return { id: parsedData.budget.id };
          }
        } catch {
          logger.debug("Using raw string as ID:", data);
          return { id: data };
        }
      } else if (data && typeof data === "object") {
        const budgetId = data.budget?.id || data.id;
        if (budgetId) {
          return { id: budgetId };
        }
      }

      logger.error("Unexpected response format from upsert_budget:", data);
      return null;
    } catch (error) {
      logger.error("Exception in createBudget:", error);
      return null;
    }
  }

  async updateBudget(
    budgetId: string,
    custom_name: string,
    start_date: string,
    end_date: string
  ): Promise<boolean> {
    try {
      logger.debug("Updating budget with params:", {
        budgetId,
        custom_name,
        start_date,
        end_date,
      });

      const currentBudget = await this.getBudgetById(budgetId);
      if (!currentBudget) {
        logger.error("Budget not found for update");
        return false;
      }

      const currentBudgetLines = currentBudget.budget_lines || [];
      const budget_amount = currentBudgetLines.reduce(
        (sum, line) => sum + line.amount,
        0
      );

      const request: UpsertBudgetRequest = {
        p_budget_id: budgetId,
        p_budget: {
          custom_name,
          start_date,
          end_date,
          is_recurrent: currentBudget.budget.is_recurrent ?? false,
          budget_amount: budget_amount,
          budget_lines: currentBudgetLines.map((line) => ({
            category_id: line.category_id,
            amount: line.amount,
          })),
        },
      };

      const { data, error } = await supabase.rpc("upsert_budget", request);

      if (error) {
        logger.error("Error updating budget:", error);
        return false;
      }

      logger.info("Budget updated successfully:", data);
      return true;
    } catch (error) {
      logger.error("Exception in updateBudget:", error);
      return false;
    }
  }

  async deleteBudget(budgetId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("delete_budget", {
        p_budget_id: budgetId,
      });

      if (error) {
        logger.error("Error deleting budget:", error);
        return false;
      }

      logger.info("Budget deleted successfully");
      return true;
    } catch (error) {
      logger.error("Exception in deleteBudget:", error);
      return false;
    }
  }

  async getBudgetById(budgetId: string): Promise<BudgetResponse | null> {
    try {
      const response = await supabase.rpc("get_budget", {
        p_budget_id: budgetId,
      });

      if (response.error) {
        logger.error("Error getting budget:", response.error);
        return null;
      }

      if (!response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error("Exception in getBudgetById:", error);
      return null;
    }
  }

  async addBudgetCategory(
    budgetId: string,
    categoryId: string,
    amount: number
  ): Promise<boolean> {
    try {
      const currentBudget = await this.getBudgetById(budgetId);
      if (!currentBudget) {
        logger.error("Budget not found");
        return false;
      }

      const currentBudgetLines = currentBudget.budget_lines || [];

      const budget_lines = [
        ...currentBudgetLines.map((line) => ({
          category_id: line.category_id,
          amount: line.amount,
        })),
        {
          category_id: categoryId,
          amount: amount,
        },
      ];

      const budget_amount = budget_lines.reduce(
        (sum, line) => sum + line.amount,
        0
      );

      const request: UpsertBudgetRequest = {
        p_budget_id: budgetId,
        p_budget: {
          custom_name: currentBudget.budget.custom_name,
          start_date: currentBudget.budget.start_date,
          end_date: currentBudget.budget.end_date,
          is_recurrent: currentBudget.budget.is_recurrent ?? false,
          budget_amount: budget_amount,
          budget_lines: budget_lines,
        },
      };

      const { data, error } = await supabase.rpc("upsert_budget", request);

      if (error) {
        logger.error("Error updating budget:", error);
        return false;
      }
      logger.info("Budget updated successfully:", data);
      return true;
    } catch (error) {
      logger.error("Exception in addBudgetCategory:", error);
      return false;
    }
  }

  async listBudgets(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc("list_budgets");

      if (error) {
        logger.error("Error listing budgets:", error);
        return [];
      }

      return (data || []).map((budget: Budget) => ({
        ...budget,
        budget_amount: budget.budget_amount || 0,
        total_metrics: {
          ...budget.total_metrics,
          total_budget: budget.total_metrics?.total_budget || 0,
          total_spent: budget.total_metrics?.total_spent || 0,
          total_remaining: budget.total_metrics?.total_remaining || 0,
          overall_progress_percentage:
            budget.total_metrics?.overall_progress_percentage || 0,
        },
      }));
    } catch (error) {
      logger.error("Error in listBudgets:", error);
      return [];
    }
  }

  async getBudgetCategoryDetails(
    budgetId: string,
    categoryId: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase.rpc(
        "get_budget_category_details",
        {
          p_budget_id: budgetId,
          p_category_id: categoryId,
        }
      );

      if (error) {
        logger.error("Error fetching category details:", error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error("Error in getBudgetCategoryDetails:", error);
      return null;
    }
  }

  async hasBudgets(): Promise<boolean> {
    const budgets = await this.listBudgets();
    return budgets.length > 0;
  }

  async removeBudgetCategory(
    budgetId: string,
    categoryId: string
  ): Promise<boolean> {
    try {
      const currentBudget = await this.getBudgetById(budgetId);
      if (!currentBudget) {
        logger.error("Budget not found");
        return false;
      }

      const currentBudgetLines = currentBudget.budget_lines || [];
      const updatedBudgetLines = currentBudgetLines
        .filter((line) => line.category_id !== categoryId)
        .map((line) => ({
          category_id: line.category_id,
          amount: line.amount,
        }));

      const budget_amount = updatedBudgetLines.reduce(
        (sum, line) => sum + line.amount,
        0
      );

      const request: UpsertBudgetRequest = {
        p_budget_id: budgetId,
        p_budget: {
          custom_name: currentBudget.budget.custom_name,
          start_date: currentBudget.budget.start_date,
          end_date: currentBudget.budget.end_date,
          is_recurrent: currentBudget.budget.is_recurrent ?? false,
          budget_amount: budget_amount,
          budget_lines: updatedBudgetLines,
        },
      };

      const { data, error } = await supabase.rpc("upsert_budget", request);

      if (error) {
        logger.error("Error removing budget category:", error);
        return false;
      }
      logger.info("Budget category removed successfully:", data);
      return true;
    } catch (error) {
      logger.error("Exception in removeBudgetCategory:", error);
      return false;
    }
  }

  async updateBudgetCategory(
    budgetId: string,
    categoryId: string,
    newAmount: number
  ): Promise<boolean> {
    try {
      const currentBudget = await this.getBudgetById(budgetId);
      if (!currentBudget) {
        logger.error("Budget not found");
        return false;
      }

      const currentBudgetLines = currentBudget.budget_lines || [];
      const updatedBudgetLines = currentBudgetLines.map((line) => ({
        category_id: line.category_id,
        amount: line.category_id === categoryId ? newAmount : line.amount,
      }));

      const budget_amount = updatedBudgetLines.reduce(
        (sum, line) => sum + line.amount,
        0
      );

      const request: UpsertBudgetRequest = {
        p_budget_id: budgetId,
        p_budget: {
          custom_name: currentBudget.budget.custom_name,
          start_date: currentBudget.budget.start_date,
          end_date: currentBudget.budget.end_date,
          is_recurrent: currentBudget.budget.is_recurrent ?? false,
          budget_amount: budget_amount,
          budget_lines: updatedBudgetLines,
        },
      };

      const { data, error } = await supabase.rpc("upsert_budget", request);

      if (error) {
        logger.error("Error updating budget category:", error);
        return false;
      }
      logger.info("Budget category updated successfully:", data);
      return true;
    } catch (error) {
      logger.error("Exception in updateBudgetCategory:", error);
      return false;
    }
  }

  async changeBudgetCategory(
    budgetId: string,
    oldCategoryId: string,
    newCategoryId: string,
    amount: number
  ): Promise<boolean> {
    try {
      const currentBudget = await this.getBudgetById(budgetId);
      if (!currentBudget) {
        logger.error("Budget not found");
        return false;
      }

      const currentBudgetLines = currentBudget.budget_lines || [];
      const updatedBudgetLines = currentBudgetLines
        .filter((line) => line.category_id !== oldCategoryId)
        .map((line) => ({
          category_id: line.category_id,
          amount: line.amount,
        }));

      updatedBudgetLines.push({
        category_id: newCategoryId,
        amount: amount,
      });

      const budget_amount = updatedBudgetLines.reduce(
        (sum, line) => sum + line.amount,
        0
      );

      const request: UpsertBudgetRequest = {
        p_budget_id: budgetId,
        p_budget: {
          custom_name: currentBudget.budget.custom_name,
          start_date: currentBudget.budget.start_date,
          end_date: currentBudget.budget.end_date,
          is_recurrent: currentBudget.budget.is_recurrent ?? false,
          budget_amount: budget_amount,
          budget_lines: updatedBudgetLines,
        },
      };

      const { data, error } = await supabase.rpc("upsert_budget", request);

      if (error) {
        logger.error("Error changing budget category:", error);
        return false;
      }
      logger.info("Budget category changed successfully:", data);
      return true;
    } catch (error) {
      logger.error("Exception in changeBudgetCategory:", error);
      return false;
    }
  }
}

export const budgetService = new BudgetService();
