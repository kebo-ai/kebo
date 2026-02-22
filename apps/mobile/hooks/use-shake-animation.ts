import { useCallback } from "react";
import {
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export function useShakeAnimation(): {
  offset: SharedValue<number>;
  shake: () => void;
} {
  const offset = useSharedValue(0);

  const shake = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    offset.value = withSequence(
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [offset]);

  return { offset, shake };
}
