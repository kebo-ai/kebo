import React from "react";
import {
  Svg,
  Path,
  Circle,
  G,
  Defs,
  ClipPath,
  Rect,
  Filter,
  FeFlood,
  FeBlend,
  FeGaussianBlur,
  Ellipse,
} from "react-native-svg";
import { colors } from "../../theme/colors";

interface ChevronRightIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ChevronRightIconSvg: React.FC<ChevronRightIconSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 14 15"
    fill="none"
  >
    <Path
      d="M10.8889 5.94434L6.99997 9.83322L3.11108 5.94434"
      stroke={colors.primary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
