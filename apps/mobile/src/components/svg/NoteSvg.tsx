import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface NoteSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const NoteSvg: React.FC<NoteSvgProps> = ({
  width = 24,
  height = 24,
  color = colors.primary,
}) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none">
    <Path
      d="M11.1806 19.8886L7.46295 20.1342L7.70846 16.4165M11.1806 19.8886L21.5971 9.47216L18.1249 6L7.70846 16.4165M11.1806 19.8886L7.70846 16.4165M16.1469 7.98509L19.619 11.4573M14.7159 22H7"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
