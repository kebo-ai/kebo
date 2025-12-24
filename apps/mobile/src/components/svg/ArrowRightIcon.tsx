import React from "react";
import { Svg, Path, Rect } from "react-native-svg";

interface ArrowRightIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ArrowRightIconSvg: React.FC<ArrowRightIconSvgProps> = ({
  width = 9,
  height = 16,
}) => (
  <Svg width={width} height={height} viewBox="0 0 9 16" fill="none">
    <Path
      d="M1 1L6 6L1 11"
      stroke="#6934D2"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
