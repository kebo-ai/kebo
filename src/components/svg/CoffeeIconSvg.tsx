import React from "react";
import { Svg, Rect, Path } from "react-native-svg";
import { colors } from "../../theme/colors";

interface CoffeeIconSvgProps {
  width?: number;
  height?: number;
  color?: string;
}

export const CoffeeIconSvg: React.FC<CoffeeIconSvgProps> = ({
  width = 24,
  height = 24,
}) => (
  <Svg width={width} height={height} viewBox="0 0 22 22" fill="none">
    <Path
      d="M17.2505 9.50024H18.6403C20.4918 9.50024 21.0421 9.76575 20.9975 11.084C20.9237 13.2676 19.939 15.8049 16 16.5002"
      stroke="#6934D2"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M4.94627 19.6147C1.57185 17.0203 1.07468 13.3403 1.00143 9.50036C0.969786 7.84154 1.45126 7.50024 3.65919 7.50024H14.3408C16.5487 7.50024 17.0302 7.84154 16.9986 9.50036C16.9253 13.3403 16.4281 17.0203 13.0537 19.6147C12.0934 20.353 11.2831 20.5002 9.91936 20.5002H8.08064C6.71686 20.5002 5.90658 20.353 4.94627 19.6147Z"
      stroke="#6934D2"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M10.3089 1.50024C9.76215 1.83885 9.00125 3.00024 9.00125 4.50024M6.53971 3.00024C6.53971 3.00024 6 3.50024 6 4.50024M13.0012 3.00024C12.7279 3.16955 12.5 4.00024 12.5 4.50024"
      stroke="#6934D2"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
