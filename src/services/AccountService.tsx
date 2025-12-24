import { supabase } from "../config/supabase";
import { AccountSnapshotIn } from "../models/account/account";
import logger from "../utils/logger";

export const createAccountUser = async (account: AccountSnapshotIn) => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .insert([
        {
          user_id: account.user_id,
          name: account.name,
          customized_name: account.customized_name,
          bank_id: account.bank_id,
          icon_url: account.icon_url,
          account_type_id: account.account_type_id,
          balance: account.balance,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Error creating account:", error.message);
      return null;
    }
    return data;
  } catch (error) {
    logger.error("Unexpected error creating account:", error);
    return null;
  }
};

export const getAccountsUsers = async () => {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });
  if (error) {
    return null;
  }
  return data;
};

export const deleteAccountService = async (accountId: string) => {
  const { data: updateData, error: updateError } = await supabase
    .from("accounts")
    .update({ is_deleted: true })
    .eq("id", accountId)
    .select();

  if (updateError) {
    logger.error("Error updating account:", {
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      code: updateError.code,
    });
    return { kind: "error", error: updateError };
  }

  const { data: verifyData, error: verifyError } = await supabase
    .from("accounts")
    .select("is_deleted")
    .eq("id", accountId)
    .single();

  if (verifyError) {
    logger.error("Error verifying account deletion:", verifyError);
    return { kind: "error", error: verifyError };
  }
  return {
    kind: "ok",
    data: verifyData,
    isDeleted: verifyData?.is_deleted,
  };
};

export const updateAccountService = async (
  accountId: string,
  updates: Partial<AccountSnapshotIn>
) => {
  logger.debug(
    "Attempting to update account with ID:",
    accountId,
    "Updates:",
    updates
  );

  const { data, error } = await supabase
    .from("accounts")
    .update(updates)
    .eq("id", accountId)
    .select()
    .single();

  if (error) {
    logger.error("Error updating account:", {
      message: error.message,
      details: error.details,
      code: error.code,
    });
    return { kind: "error", error };
  }

  logger.info("Account updated successfully:", data);
  return { kind: "ok", data };
};

export const getAccountDetailService = async (accountId: string) => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select(
        `
        *,
        account_types (
          id,
          type_name,
          description,
          created_at,
          updated_at,
          deleted_at,
          is_deleted
        )
      `
      )
      .eq("id", accountId)
      .single();

    if (error) {
      logger.error("Error fetching account detail:", error.message);
      return { kind: "error", error };
    }

    return { kind: "ok", data };
  } catch (error) {
    logger.error("Unexpected error fetching account detail:", error);
    return { kind: "error", error };
  }
};

export const getAccountsWithBalance = async () => {
  const { data, error } = await supabase
    .from("user_balance_by_account_vw")
    .select("*");

  if (error) {
    logger.error("Error fetching account balances:", error.message);
    return null;
  }

  return data;
};
