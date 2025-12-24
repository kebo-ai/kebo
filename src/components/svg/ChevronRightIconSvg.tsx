import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface ChevronRightIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const ChevronRightIconSvg: React.FC<ChevronRightIconSvgProps> = ({}) => (
  <Svg width="7" height="12" viewBox="0 0 7 12" fill="none">
    <Path
      d="M1 11L6 6L1 1"
      stroke="#110627"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
