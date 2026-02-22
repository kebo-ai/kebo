import { useState, useEffect } from "react";
import { Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Global singleton so the height persists across mounts once captured
let cachedRawHeight = 0;

/**
 * Returns the keyboard keys-area height (excluding the bottom safe area).
 * Listens for real keyboard events so the value matches the system keyboard exactly.
 * Falls back to a sensible default until the first keyboard event fires.
 */
export function useKeyboardHeight(): number {
  const insets = useSafeAreaInsets();
  const [rawHeight, setRawHeight] = useState(cachedRawHeight);

  useEffect(() => {
    const event =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(event, (e) => {
      cachedRawHeight = e.endCoordinates.height;
      setRawHeight(e.endCoordinates.height);
    });
    return () => sub.remove();
  }, []);

  // System keyboard frame includes safe area; subtract it since
  // the NumberPad sits inside a SafeAreaView.
  if (rawHeight > 0) {
    return rawHeight - insets.bottom;
  }

  // Default fallback until a real keyboard event fires
  return 260;
}
