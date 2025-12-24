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

interface StarCategoryIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const StarCategoryIconSvg: React.FC<StarCategoryIconSvgProps> = ({
  width = 50,
  height = 50,
}) => (
  <Svg width={width} height={height} viewBox="0 0 50 50" fill="none">
    <Path
      d="M25 12L28.0635 21.9365H38L29.9626 28.0635L33.0374 38L25 31.8617L16.9626 38L20.0374 28.0635L12 21.9365H21.9365L25 12Z"
      stroke="#6934D2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
