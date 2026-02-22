import { supabase } from "@/config/supabase";
import logger from "@/utils/logger";

export const getIcons = async () => {
  const { data, error } = await supabase.from("icons").select("*").eq("is_deleted", false);
  if (error) {
    logger.error("Error fetching icons:", error.message);
    return null;
  }
  return data;
};
