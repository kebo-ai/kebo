import logger from "@/utils/logger";
import React, { FC } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { Screen } from "@/components";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { BackBlackSvg } from "@/components/icons/BackBlackSvg";
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

    const renderHeader = () => (
      <View style={tw`justify-between flex-row items-center`}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
        >
          <BackBlackSvg width={15} height={15} />
        </TouchableOpacity>

        <Text
          style={tw`text-black text-lg text-center font-medium`}
          weight="medium"
        >
          {translate("languageScreen:selectLanguage")}
        </Text>
        <View style={tw`w-12 h-12`} />
      </View>
    );

    return (
      <Screen
        safeAreaEdges={["top"]}
        preset="scroll"
        statusBarStyle="dark"
        header={renderHeader()}
        backgroundColor="white"
      >
        <View style={tw`px-4 mt-6`}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={tw`flex-row items-center p-4 border-b border-[#606A84]/10`}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={tw`text-3xl mr-4`}>{lang.flag}</Text>
              <View>
                <Text
                  style={tw`text-base`}
                  weight="medium"
                  color="#110627"
                >
                  {lang.name}
                </Text>
                <Text
                  style={tw`text-sm`}
                  weight="light"
                  color="#606A84"
                >
                  {lang.nativeName}
                </Text>
              </View>
              {i18n.language === lang.code && (
                <View style={tw`ml-auto`}>
                  <View
                    style={tw`w-4 h-4 rounded-full bg-[${colors.primary}]`}
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Screen>
    );
  }
);
