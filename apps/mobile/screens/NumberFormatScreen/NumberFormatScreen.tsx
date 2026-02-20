import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { useStores } from "@/models/helpers/useStores";
import { translate } from "@/i18n";

const FORMAT_OPTIONS = [
  "1,234.56",
  "1.234,56",
  "1 234.56",
  "1 234,56",
] as const;

export const NumberFormatScreen = observer(function NumberFormatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profileModel } = useStores();
  const current = profileModel.number_format ?? "1,234.56";

  const handleSelect = (format: string) => {
    profileModel.setNumberFormat(format);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBlurEffect: theme.blurEffect,
          headerBackTitle: translate("common:back"),
          headerTintColor: colors.primary,
          title: translate("profileScreen:numberFormat"),
          headerTitleStyle: {
            fontFamily: "SFUIDisplaySemiBold",
            color: theme.headerTitle,
          },
          contentStyle: { backgroundColor: theme.background },
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={tw`px-4 pt-4 pb-24`}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            tw`rounded-2xl overflow-hidden`,
            { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
          ]}
        >
          {FORMAT_OPTIONS.map((format, index) => (
            <TouchableOpacity
              key={format}
              style={[
                tw`flex-row items-center px-4 py-4`,
                index < FORMAT_OPTIONS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={() => handleSelect(format)}
            >
              <Text
                weight="medium"
                color={theme.textPrimary}
                style={tw`flex-1`}
              >
                {format}
              </Text>
              {current === format && (
                <Ionicons name="checkmark" size={22} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
});
