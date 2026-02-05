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

interface CategoryIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const CategoryIconSvg: React.FC<CategoryIconSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <Path
      d="M11.0556 9.44444H22.6111M11.0556 14.5H22.6111M11.0556 19.5556H22.6111M8.88889 9.44444C8.88889 10.2422 8.24219 10.8889 7.44444 10.8889C6.6467 10.8889 6 10.2422 6 9.44444C6 8.6467 6.6467 8 7.44444 8C8.24219 8 8.88889 8.6467 8.88889 9.44444ZM8.88889 14.5C8.88889 15.2977 8.24219 15.9444 7.44444 15.9444C6.6467 15.9444 6 15.2977 6 14.5C6 13.7023 6.6467 13.0556 7.44444 13.0556C8.24219 13.0556 8.88889 13.7023 8.88889 14.5ZM8.88889 19.5556C8.88889 20.3533 8.24219 21 7.44444 21C6.6467 21 6 20.3533 6 19.5556C6 18.7578 6.6467 18.1111 7.44444 18.1111C8.24219 18.1111 8.88889 18.7578 8.88889 19.5556Z"
      stroke="#6934D2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
