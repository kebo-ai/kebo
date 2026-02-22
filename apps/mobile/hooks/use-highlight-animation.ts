import { useCallback } from "react";
import {
  useSharedValue,
  withTiming,
  withSequence,
  type SharedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export function useHighlightAnimation(): {
  progress: SharedValue<number>;
  scale: SharedValue<number>;
  highlight: () => void;
} {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  const highlight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    progress.value = 1;
    progress.value = withTiming(0, { duration: 1200 });
    scale.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 350 }),
    );
  }, [progress, scale]);

  return { progress, scale, highlight };
}
