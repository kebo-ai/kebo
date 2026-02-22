import { supabase } from "@/config/supabase";
import { RootStore } from "@/models/root-store";
import { NumberFormatService } from "@/services/NumberFormatService";
import logger from "./logger";

export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      logger.error("Error getting session:", error);
      return false;
    }
    return !!data.session?.access_token;
  } catch (err) {
    logger.error("Error in authentication:", err);
    return false;
  }
};

export const subscribeAuthChanges = (callback: (isAuthenticated: boolean) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(!!session?.access_token);
  });
};

export const getUserInfo = async (rootStore: RootStore): Promise<any | null> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      logger.error("Error getting session or user not authenticated:", sessionError);
      return null;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      logger.error("Error getting user info:", userError);
      return null;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (profileError) {
      logger.error("Error getting user profile:", profileError);
      return userData;
    }
    logger.debug("profileData", profileData);
    rootStore.profileModel.setFromSupabase(userData.user, profileData);

    // Restore locally-persisted number format (not stored in Supabase)
    const savedFormat = await NumberFormatService.getSelectedFormat();
    if (savedFormat) {
      rootStore.profileModel.setNumberFormat(savedFormat);
    }

    return {
      user: userData.user,
      profile: profileData
    };
  } catch (err) {
    logger.error("Error getting user info:", err);
    return null;
  }
};
