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

interface SearchIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const SearchIconSvg: React.FC<SearchIconSvgProps> = ({
  width = 28,
  height = 28,
}) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <Path
      d="M25.3781 23.275L19.1906 18.25C21.7406 14.7625 21.4781 9.775 18.2906 6.625C16.6031 4.9375 14.3531 4 11.9531 4C9.55312 4 7.30313 4.9375 5.61563 6.625C2.12813 10.1125 2.12813 15.8125 5.61563 19.3C7.30313 20.9875 9.55312 21.925 11.9531 21.925C14.2406 21.925 16.3781 21.0625 18.0656 19.525L24.3281 24.5875C24.4781 24.7 24.6656 24.775 24.8531 24.775C25.1156 24.775 25.3406 24.6625 25.4906 24.475C25.7906 24.1 25.7531 23.575 25.3781 23.275ZM11.9531 20.2375C10.0031 20.2375 8.20312 19.4875 6.81563 18.1C3.96563 15.25 3.96563 10.6375 6.81563 7.825C8.20312 6.4375 10.0031 5.6875 11.9531 5.6875C13.9031 5.6875 15.7031 6.4375 17.0906 7.825C19.9406 10.675 19.9406 15.2875 17.0906 18.1C15.7406 19.4875 13.9031 20.2375 11.9531 20.2375Z"
      fill="#6934D2"
    />
  </Svg>
);
