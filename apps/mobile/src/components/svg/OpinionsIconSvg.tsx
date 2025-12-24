import React from "react";
import Svg, { Path } from "react-native-svg";

interface OpinionsIconSvgProps {
  width?: number;
  height?: number;
  color?: string; // optional to override color
  isPressed?: boolean;
}

export const OpinionsIconSvg: React.FC<OpinionsIconSvgProps> = ({
  width = 19,
  height = 20,
  color = "#6934D2",
}) => (
  <Svg width={width} height={height} viewBox="0 0 19 20" fill="none">
    <Path
      d="M4.91211 9.92298C9.45697 0.468695 15.1161 0.359674 17.3776 1.48695C18.3876 4.01105 18.2899 10.3274 9.8193 15.4C9.73147 14.8364 9.24294 13.3599 7.99145 11.9631C6.73996 10.5663 5.4171 10.021 4.91211 9.92298Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.9609 14.95C12.6082 15.85 12.784 17.4638 13.0122 19C13.0122 19 16.4622 16.1535 14.2554 12.25"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5.31608 8.72694C4.50972 6.88844 3.06382 6.69215 1.6875 6.43746C1.6875 6.43746 4.23784 2.58682 7.73517 5.04993"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4.39278 12.9113C3.9342 13.4231 3.15461 14.9074 3.70491 16.75C5.3558 17.3642 6.68569 16.4941 7.14427 15.9823"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.5011 6.4502C14.5011 5.4837 13.7991 4.7002 12.9332 4.7002C12.0672 4.7002 11.3652 5.4837 11.3652 6.4502C11.3652 7.41669 12.0672 8.2002 12.9332 8.2002C13.7991 8.2002 14.5011 7.41669 14.5011 6.4502Z"
      stroke={color}
      strokeWidth={1.5}
    />
  </Svg>
);
