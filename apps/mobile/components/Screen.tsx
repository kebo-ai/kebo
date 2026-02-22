import { useScrollToTop } from "@react-navigation/native";
import { StatusBar, StatusBarProps, StatusBarStyle } from "expo-status-bar";
import { ReactNode, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from "react-native";
import { $styles } from "@/theme";
import {
  ExtendedEdge,
  useSafeAreaInsetsStyle,
} from "@/hooks/useSafeAreaInsetsStyle";
import CustomHeader from "./common/CustomHeader";

export const DEFAULT_BOTTOM_OFFSET = 50;

interface BaseScreenProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: ExtendedEdge[];
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
  keyboardOffset?: number;
  keyboardBottomOffset?: number;
  StatusBarProps?: StatusBarProps;
  statusBarBackgroundColor?: string;
  header?: ReactNode;
}

interface FixedScreenProps extends BaseScreenProps {
  preset?: "fixed";
}

interface ScrollScreenProps extends BaseScreenProps {
  preset?: "scroll";
  scrollEnabled?: boolean;
  keyboardShouldPersistTaps?: "handled" | "always" | "never";
}

export type ScreenProps = ScrollScreenProps | FixedScreenProps;

const isIos = Platform.OS === "ios";

function isNonScrolling(preset?: ScreenProps["preset"]) {
  return !preset || preset === "fixed";
}

export function Screen(props: ScreenProps) {
  const {
    backgroundColor = "#FAFAFA",
    keyboardOffset = 0,
    safeAreaEdges,
    StatusBarProps,
    statusBarStyle = "dark",
    statusBarBackgroundColor = "transparent",
    header,
  } = props;

  const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor }}>
        <SafeAreaView style={{ backgroundColor: statusBarBackgroundColor }}>
          <View
            style={{
              height: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
              backgroundColor: statusBarBackgroundColor,
            }}
          />
          <StatusBar
            style={statusBarStyle}
            backgroundColor={statusBarBackgroundColor}
            translucent={true}
            animated={true}
            {...StatusBarProps}
          />
        </SafeAreaView>
        <SafeAreaView style={{ flex: 1, backgroundColor }}>
          {header}
          <KeyboardAvoidingView
            behavior={isIos ? "padding" : undefined}
            keyboardVerticalOffset={keyboardOffset}
            style={{ flex: 1 }}
          >
            {isNonScrolling(props.preset) ? (
              <View style={props.style}>{props.children}</View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps={
                  !isNonScrolling(props.preset) && (props as ScrollScreenProps).keyboardShouldPersistTaps
                    ? (props as ScrollScreenProps).keyboardShouldPersistTaps
                    : "handled"
                }
                style={props.style}
                contentContainerStyle={props.contentContainerStyle}
                scrollEnabled={
                  !isNonScrolling(props.preset) 
                    ? (props as ScrollScreenProps).scrollEnabled !== false
                    : true
                }
              >
                {props.children}
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}
