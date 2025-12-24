import { supabase } from "../config/supabase";
import logger from "../utils/logger";

export const getBanks = async () => {
  const { data, error } = await supabase
    .from("banks")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) {
    logger.error("Error fetching banks:", error.message);
    return null;
  }
  return data;
};

export const getBanksByCountry = async (country: string) => {
  const { data, error } = await supabase
    .from("banks")
    .select("*")
    .eq("is_deleted", false)
    .in("country_code", [country, "GLOBAL"])
    .order("country_code", { ascending: true });
  if (error) {
    logger.error("Error fetching banks by country:", error.message);
    return null;
  }
  return data;
};

export const searchBanksByCountryService = async (
  query: string,
  country: string
) => {
  const { data, error } = await supabase
    .from("banks")
    .select("*")
    .eq("is_deleted", false)
    .in("country_code", [country, "GLOBAL"])
    .ilike("name", `%${query}%`)
    .order("country_code", { ascending: true });

  if (error) {
    logger.error("Error searching banks:", error.message);
    return { kind: "error", error };
  }

  return { kind: "ok", data };
};

export const searchBanksService = async (query: string) => {
  const { data, error } = await supabase
    .from("banks")
    .select("*")
    .eq("is_deleted", false)
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error searching banks:", error.message);
    return { kind: "error", error };
  }

  return { kind: "ok", data };
};
