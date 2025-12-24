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

interface RecurrenceIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const RecurrenceIconSvg: React.FC<RecurrenceIconSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <Path
      d="M6 14C6 9.58261 9.58261 6 14 6C17.2557 6 20.0591 7.94783 21.3043 10.7374M21.3043 7.3913V10.8696H17.8261M6.69565 17.2626C7.94087 20.0522 10.7443 22 14 22C18.4174 22 22 18.4174 22 14M6.69565 20.6087V17.1304H10.1739"
      stroke="#6934D2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
