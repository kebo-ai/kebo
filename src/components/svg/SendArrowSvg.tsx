import React from "react";
import { Svg, Path, Rect } from "react-native-svg";

interface SendArrowSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const SendArrowSvg: React.FC<SendArrowSvgProps> = ({
  width = 30,
  height = 30,
}) => (
  <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
    <Path
      d="M11.8881 5.28755L22.5881 10.6375C27.3881 13.0375 27.3881 16.9625 22.5881 19.3625L11.8881 24.7125C4.68807 28.3125 1.75057 25.3625 5.35057 18.175L6.43807 16.0125C6.71307 15.4625 6.71307 14.55 6.43807 14L5.35057 11.825C1.75057 4.63755 4.70057 1.68755 11.8881 5.28755Z"
      fill="#D9D9D9"
    />
    <Path
      d="M11.8881 5.28755L22.5881 10.6375C27.3881 13.0375 27.3881 16.9625 22.5881 19.3625L11.8881 24.7125C4.68807 28.3125 1.75057 25.3625 5.35057 18.175L6.43807 16.0125C6.71307 15.4625 6.71307 14.55 6.43807 14L5.35057 11.825C1.75057 4.63755 4.70057 1.68755 11.8881 5.28755Z"
      fill="#6934D2"
    />
    <Path
      d="M6.80078 15H13.5508"
      stroke="#FFFBFE"
      stroke-width="1.24"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);
