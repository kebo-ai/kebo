import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import tw from "twrnc";

const TypingDots = () => {
  const [activeDots, setActiveDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDots((prev) => (prev === 3 ? 1 : prev + 1));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={tw`flex-row`}>
      {[1, 2, 3].map((dot) => (
        <Text
          key={dot}
          style={[
            tw`text-gray-600 text-xl`,
            { opacity: dot <= activeDots ? 1 : 0.3 },
          ]}
        >
          •
        </Text>
      ))}
    </View>
  );
};

export default TypingDots;
