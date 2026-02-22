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
import { colors } from "@/theme/colors";

interface EndDateIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const EndDateIconSvg: React.FC<EndDateIconSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 28 28"
    fill="none"
  >
    <Path
      d="M9.47826 9.47826L18.5217 18.5217M18.5217 9.47826L9.47826 18.5217M22 14C22 18.4183 18.4183 22 14 22C9.58172 22 6 18.4183 6 14C6 9.58172 9.58172 6 14 6C18.4183 6 22 9.58172 22 14Z"
      stroke="#6934D2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
