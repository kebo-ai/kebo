import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerBlurEffect: "extraLight",
        headerLargeStyle: { backgroundColor: "transparent" },
        headerLargeTitleStyle: {
          fontFamily: "SFUIDisplayBold",
          color: "#110627",
          fontSize: 20,
        },
        headerTitleStyle: {
          fontFamily: "SFUIDisplaySemiBold",
          color: "#110627",
        },
        headerTintColor: "#6934D2",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
