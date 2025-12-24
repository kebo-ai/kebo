import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { SvgProps } from "react-native-svg";
export const SettingsSvg = (props: SvgProps) => (
  <Svg width={21} height={21} viewBox="0 0 21 21" fill="none" {...props}>
    <Path
      d="M4.37 7.088 2.908 4.66l1.752-1.751 2.428 1.462a8.003 8.003 0 0 1 1.487-.62L9.26 1h2.478l.686 2.75c.529.15 1.024.356 1.487.621l2.429-1.462 1.751 1.751-1.462 2.429c.264.462.471.957.62 1.487L20 9.26v2.478l-2.751.686a7.967 7.967 0 0 1-.62 1.487l1.462 2.429-1.751 1.751-2.429-1.462a7.967 7.967 0 0 1-1.487.62L11.74 20H9.26l-.685-2.751a7.967 7.967 0 0 1-1.487-.62L4.66 18.092l-1.751-1.751 1.462-2.429a7.967 7.967 0 0 1-.62-1.487L1 11.74V9.26l2.751-.685c.15-.529.356-1.024.62-1.487Z"
      stroke="#6934D2"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.5 14.217a3.717 3.717 0 1 0 0-7.434 3.717 3.717 0 0 0 0 7.434Z"
      stroke="#6934D2"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
