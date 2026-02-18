import logger from "@/utils/logger";
import React, { FC } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { showToast } from "@/components/ui/CustomToast";
import { translate } from "@/i18n";
import { LanguageService } from "@/services/LanguageService";

interface LanguageScreenProps {}

const languages = [
  {
    code: "es",
    name: "Espanol",
    flag: "🇪🇸",
    nativeName: "Espanol",
  },
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    nativeName: "English",
  },
  {
    code: "pt",
    name: "Portugues",
    flag: "🇧🇷",
    nativeName: "Portugues",
  },
];

export const LanguageScreen: FC<LanguageScreenProps> = observer(
  function LanguageScreen() {
    const router = useRouter();
    const { i18n } = useTranslation();

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
            headerBlurEffect: "extraLight",
            headerBackTitle: translate("common:back"),
            headerTintColor: colors.primary,
            title: translate("languageScreen:selectLanguage"),
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
            contentStyle: { backgroundColor: "#FAFAFA" },
          }}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={tw`px-4 pt-4 pb-24`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`bg-white rounded-2xl overflow-hidden border border-[#EBEBEF]`}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={tw`flex-row items-center p-4 ${
                  index < languages.length - 1 ? "border-b border-[#EBEBEF]" : ""
                }`}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={tw`text-3xl mr-4`}>{lang.flag}</Text>
                <View style={tw`flex-1`}>
                  <Text weight="medium" color="#110627">
                    {lang.name}
                  </Text>
                  <Text type="xs" weight="light" color="#606A84">
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
