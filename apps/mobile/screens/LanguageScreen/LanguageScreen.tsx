import logger from "@/utils/logger";
import React, { FC } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { showToast } from "@/components/ui/CustomToast";
import { translate } from "@/i18n";
import { LanguageService } from "@/services/LanguageService";

interface LanguageScreenProps {}

const languages = [
  {
    code: "es",
    name: "Espanol",
    flag: "\u{1F1EA}\u{1F1F8}",
    nativeName: "Espanol",
  },
  {
    code: "en",
    name: "English",
    flag: "\u{1F1FA}\u{1F1F8}",
    nativeName: "English",
  },
  {
    code: "pt",
    name: "Portugues",
    flag: "\u{1F1E7}\u{1F1F7}",
    nativeName: "Portugues",
  },
];

export const LanguageScreen: FC<LanguageScreenProps> = observer(
  function LanguageScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();
    const { theme } = useTheme();

    const handleLanguageChange = async (langCode: string) => {
      try {
        await i18n.changeLanguage(langCode);

        const saveSuccess = await LanguageService.saveSelectedLanguage(
          langCode
        );

        if (saveSuccess) {
          showToast("success", translate("languageScreen:sucessLanguage"));
          router.back();
        } else {
          showToast("error", translate("languageScreen:errorLanguage"));
        }
      } catch (error) {
        logger.error("Error changing language:", error);
        showToast("error", translate("languageScreen:errorLanguage"));
      }
    };

    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerLargeTitle: true,
            headerTransparent: true,
            headerBlurEffect: theme.blurEffect,
            headerBackTitle: translate("common:back"),
            headerTintColor: colors.primary,
            title: translate("languageScreen:selectLanguage"),
            headerLargeStyle: { backgroundColor: "transparent" },
            headerLargeTitleStyle: {
              fontFamily: "SFUIDisplayBold",
              color: theme.headerTitle,
              fontSize: 20,
            },
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
          <View style={[tw`rounded-2xl overflow-hidden border`, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  tw`flex-row items-center p-4`,
                  index < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={tw`text-3xl mr-4`}>{lang.flag}</Text>
                <View style={tw`flex-1`}>
                  <Text weight="medium" color={theme.textPrimary}>
                    {lang.name}
                  </Text>
                  <Text type="xs" weight="light" color={theme.textSecondary}>
                    {lang.nativeName}
                  </Text>
                </View>
                {i18n.language === lang.code && (
                  <View
                    style={tw`w-5 h-5 rounded-full bg-[${colors.primary}] items-center justify-center`}
                  >
                    <View style={tw`w-2 h-2 rounded-full bg-white`} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </>
    );
  }
);
