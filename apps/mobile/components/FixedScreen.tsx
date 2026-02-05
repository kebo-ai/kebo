import { StatusBar, StatusBarProps, StatusBarStyle } from "expo-status-bar";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StatusBar as RNStatusBar,
} from "react-native";
import {
  ExtendedEdge,
  useSafeAreaInsetsStyle,
} from "@/hooks/useSafeAreaInsetsStyle";

interface FixedScreenProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  safeAreaEdges?: ExtendedEdge[];
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
  keyboardOffset?: number;
  StatusBarProps?: StatusBarProps;
  statusBarBackgroundColor?: string;
  header?: ReactNode;
}

const isIos = Platform.OS === "ios";

export function FixedScreen(props: FixedScreenProps) {
  const {
    backgroundColor = "#FAFAFA",
    keyboardOffset = 0,
    safeAreaEdges,
    StatusBarProps,
    statusBarStyle = "light",
    statusBarBackgroundColor = "transparent",
    header,
    children,
    style,
  } = props;

  const $containerInsets = useSafeAreaInsetsStyle(safeAreaEdges);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[{ flex: 1, backgroundColor }]}>
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
            {...StatusBarProps}
          />
        </SafeAreaView>
        <SafeAreaView style={[{ flex: 1, backgroundColor }]}>
          {header}
          <KeyboardAvoidingView
            behavior={isIos ? "padding" : "height"}
            keyboardVerticalOffset={keyboardOffset}
            style={[{ flex: 1 }, style]}
          >
            {children}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
} 