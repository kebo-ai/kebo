import React from "react";
import { Svg, Path, Rect } from "react-native-svg";

interface ArrowUpIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ArrowUpIconSvg: React.FC<ArrowUpIconSvgProps> = ({
  width = 16,
  height = 9,
}) => (
  <Svg width={width} height={height} viewBox="0 0 16 9" fill="none">
    <Path
      d="M1.94477 7.1665L8.05588 1.05539L14.167 7.1665"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
