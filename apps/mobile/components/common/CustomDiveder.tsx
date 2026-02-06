import { View } from "react-native";

import React from "react";
import tw from "twrnc";

type CustomDividerProps = {};

const CustomDivider: React.FC<CustomDividerProps> = ({}) => {
  return (
    <View
      style={[tw`border-t py-2`, { borderColor: "rgba(96, 106, 132, 0.15)" }]}
    />
  );
};

export default CustomDivider;
