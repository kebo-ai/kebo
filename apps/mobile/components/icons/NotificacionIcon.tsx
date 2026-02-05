import React from "react";
import { Svg, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

interface NotificacionIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const NotificacionIconSvg: React.FC<NotificacionIconSvgProps> = ({
  width = 12,
  height = 14,
}) => (
  <Svg width={width} height={height} viewBox="0 0 12 14" fill="none">
    <Path
      d="M9.6087 7.52174V4.91304C9.6087 2.87826 7.9913 1 5.95652 1C3.92174 1 2.30435 2.87826 2.30435 4.91304V7.52174C2.30435 9.6087 1 11.4348 1 11.4348H10.913C10.913 11.4348 9.6087 9.6087 9.6087 7.52174Z"
      stroke={colors.black}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.95652 13C5.23652 13 4.65217 12.4157 4.65217 11.6957V11.4348H7.26087V11.6957C7.26087 12.4157 6.67652 13 5.95652 13Z"
      stroke={colors.black}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
