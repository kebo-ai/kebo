import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import tw from "twrnc";

import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { translate } from "@/i18n";
import { useStores } from "@/models/helpers/use-stores";
import {
  ThemePreferenceService,
  type ThemePreference,
} from "@/services/theme-preference-service";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";

type Option = {
  value: ThemePreference;
  labelKey: Parameters<typeof translate>[0];
  descriptionKey: Parameters<typeof translate>[0];
  symbol: keyof typeof Ionicons.glyphMap;
};

const OPTIONS: readonly Option[] = [
  {
    value: "system",
    labelKey: "profileScreen:appearanceSystem",
    descriptionKey: "profileScreen:appearanceSystemDescription",
    symbol: "phone-portrait-outline",
  },
  {
    value: "light",
    labelKey: "profileScreen:appearanceLight",
    descriptionKey: "profileScreen:appearanceLightDescription",
    symbol: "sunny-outline",
  },
  {
    value: "dark",
    labelKey: "profileScreen:appearanceDark",
    descriptionKey: "profileScreen:appearanceDarkDescription",
    symbol: "moon-outline",
  },
];

export const AppearanceScreen = observer(function AppearanceScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profileModel } = useStores();
  const current: ThemePreference = profileModel.theme_preference;

  const handleSelect = async (preference: ThemePreference) => {
    profileModel.setThemePreference(preference);
    await ThemePreferenceService.savePreference(preference);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...standardHeader(theme),
          headerShown: true,
          headerBackTitle: translate("common:back"),
          title: translate("profileScreen:appearance"),
          contentStyle: { backgroundColor: theme.background },
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={tw`px-4 pt-4 pb-24`}
        showsVerticalScrollIndicator={false}
      >
        <Text
          type="sm"
          color={theme.textSecondary}
          style={tw`px-1 mb-4`}
        >
          {translate("profileScreen:appearanceDescription")}
        </Text>
        <View
          style={[
            tw`rounded-2xl overflow-hidden`,
            {
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            },
          ]}
        >
          {OPTIONS.map((option, index) => {
            const selected = current === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  tw`flex-row items-center px-4 py-4`,
                  index < OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Ionicons
                  name={option.symbol}
                  size={22}
                  color={colors.primary}
                />
                <View style={tw`flex-1 ml-3`}>
                  <Text weight="medium" color={theme.textPrimary}>
                    {translate(option.labelKey)}
                  </Text>
                  <Text
                    type="xs"
                    color={theme.textTertiary}
                    style={tw`mt-0.5`}
                  >
                    {translate(option.descriptionKey)}
                  </Text>
                </View>
                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
});
