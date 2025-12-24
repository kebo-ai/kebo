import React from "react";
import {
  Svg,
  Path,
} from "react-native-svg";
import { colors } from "../../theme/colors";

interface BackBlackSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const BackBlackSvg: React.FC<BackBlackSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 9 15"
    fill="none"
  >
    <Path
      d="M7.11133 13.2222L1.00022 7.11111L7.11133 1"
      stroke={colors.black}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
