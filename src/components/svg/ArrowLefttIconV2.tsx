import React from "react";
import { Svg, Path } from "react-native-svg";

interface ArrowLefttIconV2Props {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const ArrowLefttIconV2: React.FC<ArrowLefttIconV2Props> = ({
  width = 9,
  height = 16,
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 12 17"
    fill="none"
  >
    <Path
      d="M11.1836 2.04531L4.72891 8.5L11.1836 14.9547L9.18672 16.9375L0.749218 8.5L9.18672 0.0625L11.1836 2.04531Z"
      fill="#6934D2"
    />
  </Svg>
);
