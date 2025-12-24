import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface HistorySvgProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export const HistorySvg: React.FC<HistorySvgProps> = ({
  width = 22,
  height = 11,
}) => (
  <Svg width={width} height={height} viewBox="0 0 22 11" fill="none">
    <Path
      d="M20 2H2"
      stroke="#6934D2"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M20 9H7"
      stroke="#6934D2"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
