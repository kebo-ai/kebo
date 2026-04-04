import { createClient } from "@supabase/supabase-js";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import logger from "@/utils/logger";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

const HybridStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const secureValue = await SecureStore.getItemAsync(key);
      if (secureValue) return secureValue;
      
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (value.length < 2000) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      logger.error('Error storing value:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing value:', error);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: HybridStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Sync auth token to App Groups for the Apple Pay Shortcuts intent (iOS only)
if (Platform.OS === "ios") {
  import("@/modules/apple-pay-intent").then(({ syncToken, clearToken, syncApiUrl }) => {
    // Sync the API URL so the intent knows where to POST
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) syncApiUrl(apiUrl);

    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token && session?.refresh_token) {
        syncToken(session.access_token, session.refresh_token);
      } else if (event === "SIGNED_OUT") {
        clearToken();
      }
    });
  }).catch(() => {
    // Module not available (e.g. Android, web)
  });
}
