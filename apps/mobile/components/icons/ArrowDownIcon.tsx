import React from "react";
import { Svg, Path, Rect } from "react-native-svg";

interface ArrowDownIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ArrowDownIconSvg: React.FC<ArrowDownIconSvgProps> = ({
  width = 50,
  height = 50,
}) => (
  <Svg width={width} height={height} viewBox="0 0 50 50" fill="none">
    <Rect width={50} height={50} rx={8} fill="#6934D2" fillOpacity={0.15} />
    <Rect
      x={0.5}
      y={0.5}
      width={49}
      height={49}
      rx={7.5}
      stroke="#6934D2"
      strokeOpacity={0.22}
    />
    <Path
      d="M32.2223 22.1113L25.0001 29.3336L17.7778 22.1113"
      stroke="#6934D2"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
