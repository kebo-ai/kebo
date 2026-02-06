import React, { useState } from "react";
import { View, TouchableWithoutFeedback } from "react-native";
import { TooltipProps } from "gifted-charts-core/dist/utils/types";
import tw from "twrnc";

const Tooltip = (props: TooltipProps) => {
  const {
    barWidth,
    item,
    index,
    leftSpacing,
    renderTooltip,
    autoCenterTooltip,
    horizontal,
    bottom,
  } = props;

  const [leftShiftTooltipForCentering, setLeftShiftTooltipForCentering] =
    useState(0);

  if (!item) return null;

  let tooltipX = leftSpacing + index * (barWidth + 24);
  tooltipX = tooltipX - barWidth / 2;

  tooltipX = Math.max(tooltipX, 4);
  tooltipX = Math.min(
    tooltipX,
    leftSpacing + (index + 1) * (barWidth + 24) - 4
  );

  const tooltipY = bottom + 50;

  return (
    <TouchableWithoutFeedback>
      <View
        style={{
          position: "absolute",
          bottom: tooltipY,
          left: tooltipX,
          zIndex: 1000,
          transform: [{ rotate: horizontal ? "-90deg" : "0deg" }],
        }}
        onLayout={(event) => {
          if (!autoCenterTooltip) return;
          const { width } = event.nativeEvent.layout;
          setLeftShiftTooltipForCentering((width - barWidth) / 2);
        }}
      >
        {renderTooltip?.(item, index)}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Tooltip;
