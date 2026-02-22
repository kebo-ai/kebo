import React from "react";
import { Svg, Path, Rect } from "react-native-svg";

interface ArrowLeftIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ArrowLeftIconSvg: React.FC<ArrowLeftIconSvgProps> = ({
  width = 9,
  height = 16,
}) => (
  <Svg width={width} height={height} viewBox="0 0 9 16" fill="none">
    <Path
      d="M7.44531 14.1109L1.3342 7.99978L7.44531 1.88867"
      stroke="#6934D2"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
