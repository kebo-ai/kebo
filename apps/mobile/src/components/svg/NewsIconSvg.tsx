import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface NewsIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const NewsIconSvg: React.FC<NewsIconSvgProps> = ({}) => (
  <Svg width="26" height="25" viewBox="0 0 26 25" fill="none">
    <Path
      d="M6.38458 5.98265H4.23075C2.44307 5.98265 1 7.42571 1 9.21339V16.7518C1 18.5395 2.44307 19.9826 4.23075 19.9826H6.38458M6.38458 5.98265V19.9826M6.38458 5.98265C11.7692 5.98265 16.6476 3.18267 20.0183 1.11499C20.6537 0.727298 21.4614 1.38422 21.4614 2.12729V22.8687C21.4614 23.5795 20.7183 24.2579 20.0937 23.9025C16.5507 21.8564 11.7692 19.9826 6.38458 19.9826M21.4614 9.21339H22.5383C23.7229 9.21339 24.6921 10.1826 24.6921 11.3672V15.6749C24.6921 16.8595 23.7229 17.8287 22.5383 17.8287H21.4614V9.21339Z"
      stroke="#6934D2"
      stroke-miterlimit="10"
    />
  </Svg>
);
