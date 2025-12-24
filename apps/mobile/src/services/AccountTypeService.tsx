import { supabase } from "../config/supabase";
import logger from "../utils/logger";

export const getAccountsType = async () => {
  const { data, error } = await supabase
    .from("account_types")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) {
    logger.error("Error fetching account types:", error.message);
    return null;
  }
  return data;
};
