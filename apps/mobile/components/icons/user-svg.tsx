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
import { colors } from "@/theme/colors";

interface UserSvgProps {
  width?: number;
  height?: number;
  color?: string;
  isPressed?: boolean;
}

export const UserSvg: React.FC<UserSvgProps> = ({
  width = 17,
  height = 16,
}) => (
  <Svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <G clipPath="url(#clip0_13_5134)">
      <Path
        d="M8 8.66667C10.206 8.66667 12 6.87267 12 4.66667V4C12 1.794 10.206 0 8 0C5.794 0 4 1.794 4 4V4.66667C4 6.87267 5.794 8.66667 8 8.66667Z"
        fill="#606A84"
      />
      <Path
        d="M12.8814 10.6539C9.74535 9.78527 6.25535 9.78527 3.11869 10.6539C1.67535 11.0539 0.666687 12.3759 0.666687 13.8699V15.9999H15.3334V13.8699C15.3334 12.3759 14.3247 11.0539 12.8814 10.6539Z"
        fill="#606A84"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_13_5134">
        <Rect
          width="16"
          height="16"
          fill="white"
        />
      </ClipPath>
    </Defs>
  </Svg>
);
