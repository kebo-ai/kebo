import { BlurView } from "expo-blur";
import React, { FC, PropsWithChildren } from "react";
import { StyleSheet, Platform } from "react-native";
import Animated, {
  interpolate,
  useAnimatedProps,
  Extrapolation,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

// fuse-home-tabs-transition-animation 🔽

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Parallax gaps tuned for the compact field area (smaller than full-screen Fuse pages)
const _translateXGap = 12;
const _translateYGap = 3;

type Props = {
  index: number;
  activeIndex: SharedValue<number>;
  prevActiveIndex: SharedValue<number>;
};

export const TransactionContentContainer: FC<PropsWithChildren<Props>> = ({
  children,
  index,
  activeIndex,
  prevActiveIndex,
}) => {
  const rContainerStyle = useAnimatedStyle(() => {
    // Android fallback: skip layered fades + blur for perf
    if (Platform.OS === "android") {
      const isActive = Math.round(activeIndex.value) === index;
      return {
        opacity: isActive ? 1 : 0,
        position: isActive ? "relative" as const : "absolute" as const,
      };
    }

    // Skip rendering offscreen during long jumps (>1 tab)
    if (
      Math.abs(Math.round(activeIndex.value) - Math.round(prevActiveIndex.value)) > 1 &&
      Math.round(activeIndex.value) !== index
    ) {
      return { opacity: 0, position: "absolute" as const };
    }

    const progress = activeIndex.value;

    // Opacity cross-fade
    const fadeOut = interpolate(progress, [index, index + 0.7], [1, 0], Extrapolation.CLAMP);
    const fadeIn = interpolate(progress, [index - 0.7, index], [0, 1], Extrapolation.CLAMP);

    // X parallax
    const translateXOut = interpolate(
      progress,
      [index, index + 0.7],
      [0, _translateXGap],
      Extrapolation.CLAMP,
    );
    const translateXIn = interpolate(
      progress,
      [index - 0.7, index],
      [-_translateXGap, 0],
      Extrapolation.CLAMP,
    );

    // Y parallax
    const translateYOut = interpolate(
      progress,
      [index, index + 0.7],
      [0, -_translateYGap],
      Extrapolation.CLAMP,
    );
    const translateYIn = interpolate(
      progress,
      [index - 0.7, index],
      [-_translateYGap, 0],
      Extrapolation.CLAMP,
    );

    const opacity = fadeOut * fadeIn;
    const isVisible = opacity > 0.01;

    return {
      opacity,
      position: isVisible ? "relative" as const : "absolute" as const,
      transform: [
        { translateX: translateXOut + translateXIn },
        { translateY: translateYOut + translateYIn },
      ],
    };
  });

  const blurAnimatedProps = useAnimatedProps(() => {
    if (Platform.OS === "android") {
      return { intensity: 0 };
    }

    const intensity = interpolate(
      activeIndex.value,
      [index - 1, index, index + 1],
      [50, 0, 50],
      Extrapolation.CLAMP,
    );

    return { intensity };
  });

  return (
    <Animated.View style={rContainerStyle}>
      {children}
      {Platform.OS === "ios" && (
        <AnimatedBlurView
          tint="light"
          style={[StyleSheet.absoluteFill, styles.blur]}
          animatedProps={blurAnimatedProps}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  blur: {
    pointerEvents: "none",
  },
});

// fuse-home-tabs-transition-animation 🔼
