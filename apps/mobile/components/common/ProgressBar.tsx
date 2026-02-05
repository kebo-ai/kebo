import React from "react";
import { View, Animated, Image } from "react-native";
import tw from "twrnc";
import { IconSliderSvg } from "@/components/icons/IconSliderSvg";
interface ProgressBarProps {
  progress: number; // valor entre 0 y 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  backgroundColor = "#9563F8",
  progressColor = "#110627",
}) => {
  const width = progress * 100;

  return (
    <View style={tw`relative w-full`}>
      <View
        style={[tw`rounded-full overflow-hidden`, { height, backgroundColor }]}
      >
        <Animated.View
          style={[
            tw`h-full rounded-full`,
            {
              width: `${Math.min(Math.max(width, 0), 100)}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>
      {/* Kebito (Koala) Icon */}
      <View
        style={[
          tw`absolute -top-4`,
          {
            left: `${Math.min(Math.max(width, 0), 100)}%`,
            transform: [{ translateX: -18 }],
          },
        ]}
      >
        <View
          style={tw`w-9 h-9 bg-white rounded-full items-center justify-center shadow-sm`}
        >
          <IconSliderSvg />
        </View>
      </View>
    </View>
  );
};
