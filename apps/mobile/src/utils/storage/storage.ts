import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Loads a string from storage.
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(key)) ?? null;
  } catch {
    return null;
  }
}

/**
 * Saves a string to storage.
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 * @param key The key to fetch.
 */
export async function load<T>(key: string): Promise<T | null> {
  try {
    const almostThere = await loadString(key);
    return almostThere ? (JSON.parse(almostThere) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Saves an object to storage.
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: unknown): Promise<boolean> {
  try {
    await saveString(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes something from storage.
 * @param key The key to remove.
 */
export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

/**
 * Clears all stored data.
 */
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch {}
}

/**
 * Storage object for easier usage (mimicking MMKV API).
 */
export const storage = {
  getString: loadString,
  set: saveString,
  delete: remove,
  clearAll: clear,
};
