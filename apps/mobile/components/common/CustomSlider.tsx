import React, { useState } from 'react';
import { View, Text, PanResponder, Animated, Image, Dimensions } from 'react-native';
import tw from '@/hooks/use-tailwind';
import { colors } from '@/theme/colors';
const { width: screenWidth } = Dimensions.get('window');

interface Props {
  value?: number;
  onChange?: (value: number) => void;
}

export const CustomSlider: React.FC<Props> = ({ value = 0.5, onChange }) => {
  const sliderWidth = screenWidth * 0.9;
  const thumbSize = 36;
  const [pan] = useState(new Animated.ValueXY({ x: value * (sliderWidth - thumbSize), y: 0 }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      let newX = gesture.dx + Number(JSON.parse(JSON.stringify(pan.x)));
      newX = Math.max(0, Math.min(newX, sliderWidth - thumbSize));
      pan.setValue({ x: newX, y: 0 });
      if (onChange) {
        const percentage = newX / (sliderWidth - thumbSize);
        onChange(percentage);
      }
    },
  });

  return (
    <View style={tw`items-center justify-center my-4`}>
      {/* Track Background */}
      <View style={[tw`h-3 rounded-full`, { width: sliderWidth, backgroundColor: `${colors.gray}33` }]}>
        {/* Filled Track */}
        <Animated.View
          style={[
            tw`h-3 rounded-full`,
            {
              width: Animated.add(pan.x, new Animated.Value(thumbSize / 2)),
              backgroundColor: colors.secondary,
              position: 'absolute',
              left: 0,
              top: 0,
            },
          ]}
        />
      </View>

      {/* Thumb */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          {
            transform: [{ translateX: pan.x }],
            position: 'absolute',
            top: -thumbSize / 2 + 1.5, // Center it on the track
          },
        ]}
      >
        <View
          style={[
            tw`items-center justify-center`,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: colors.white,
              borderWidth: 2,
              borderColor: colors.secondary,
            },
          ]}
        >
          {/* Icon or Image inside */}
          <Image
            source={require('../../assets/images/kebito-slider.png')} // Replace with your icon path
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
};
