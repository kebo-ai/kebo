import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import Toast, { ToastConfig } from "react-native-toast-message";
import tw from "twrnc";
import { ImageCustom } from "@/components/assets/Image";
import { colors } from "@/theme";
const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <View
      style={[
        tw`flex-row items-center p-3 shadow-lg bg-black w-[90%] mx-auto rounded-full`,
      ]}
    >
      <ImageCustom
        icon="successToast"
        size={{ width: 35, height: 33 }}
        style={tw`rounded-full`}
      />
      <Text
        style={[
          tw`text-white text-[15px] flex-1 ml-[10px]`,
          { fontFamily: "SFUIDisplaySemiBold", lineHeight: 18 },
        ]}
      >
        {text1}
      </Text>
      <Pressable onPress={() => Toast.hide()} style={tw`p-2`}>
        <Text>✖</Text>
      </Pressable>
    </View>
  ),
  warning: ({ text1 }) => (
    <View
      style={[
        tw`flex-row items-center p-3 shadow-lg bg-black w-[90%] mx-auto rounded-full`,
      ]}
    >
      <ImageCustom icon="warningToast" size={{ width: 35, height: 33 }} style={tw`rounded-full`} />
      <Text
        style={[
          tw`text-white text-[15px] flex-1 ml-[10px]`,
          { fontFamily: "SFUIDisplaySemiBold", lineHeight: 18 },
        ]}
      >
        {text1}
      </Text>
      <Pressable onPress={() => Toast.hide()} style={tw`p-2`}>
        <Text>✖</Text>
      </Pressable>
    </View>
  ),
  error: ({ text1 }) => (
    <View
      style={[
        tw`flex-row items-center p-3 shadow-lg bg-black w-[90%] mx-auto rounded-full`,
      ]}
    >
      <ImageCustom icon="errorToast" size={{ width: 35, height: 33 }} style={tw`rounded-full`} />
      <Text
        style={[
          tw`text-white text-[15px] flex-1 ml-[10px]`,
          { fontFamily: "SFUIDisplaySemiBold", lineHeight: 18 },
        ]}
      >
        {text1}
      </Text>
      <Pressable onPress={() => Toast.hide()} style={tw`p-2`}>
        <Text>✖</Text>
      </Pressable>
    </View>
  ),
};

const CustomToast = () => <Toast config={toastConfig} />;

export const showToast = (
  type: "success" | "warning" | "error",
  message: string
) => {
  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 2000,
    autoHide: true,
  });
};

export default CustomToast;
