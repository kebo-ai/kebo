import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/header-options";
import { useTheme } from "@/hooks/useTheme";
import { useStores } from "@/models/helpers/use-stores";
import { translate } from "@/i18n";
import { NumberFormatService } from "@/services/number-format-service";

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
    NumberFormatService.saveSelectedFormat(format);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...standardHeader(theme),
          headerShown: true,
          headerBackTitle: translate("common:back"),
          title: translate("profileScreen:numberFormat"),
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
