import { supabase } from '../config/supabase';
import logger from '../utils/logger';

interface DeleteAccountResponse {
  success: boolean;
  error?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const updateUserProfile = async (updates: { 
  full_name?: string;
  country?: string;
  currency?: string;
}): Promise<UpdateProfileResponse> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: 'No authenticated user found'
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating profile:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    logger.error('Error in updateUserProfile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export const userSelfHardDelete = async (email: string): Promise<DeleteAccountResponse> => {
  try {
    const { data, error } = await supabase.rpc('user_self_hard_delete', {
      p_email: email,
      p_confirmation_code: process.env.EXPO_PUBLIC_SECRET_PASS_KEY_FOR_DELETE_ACCOUNT
    });

    if (error) {
      logger.error('Error deleting account:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    logger.error('Error in userSelfHardDelete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
