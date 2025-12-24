import * as Localization from "expo-localization";
import { I18nManager } from "react-native";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "intl-pluralrules";
import { LanguageService } from "../services/LanguageService";
import logger from "../utils/logger";

import en, { Translations } from "./en";
import es from "./es";
import fr from "./fr";
import it from "./it";
import de from "./de";
import zh from "./zh";
import hi from "./hi";
import pt from "./pt";

const fallbackLocale = "en";

const systemLocales = Localization.getLocales();

const resources = {
  en,
  es,
  fr,
  pt,
  it,
  de,
  zh,
  hi,
};

const supportedTags = Object.keys(resources);

const systemTagMatchesSupportedTags = (deviceTag: string) => {
  try {
    const primaryTag = deviceTag.split("-")[0];
    const fullTag = deviceTag.toLowerCase();

    if (fullTag.startsWith("pt")) return supportedTags.includes("pt");

    return (
      supportedTags.includes(fullTag) || supportedTags.includes(primaryTag)
    );
  } catch (error) {
    logger.warn("Error matching language tag:", error);
    return false;
  }
};

const pickSupportedLocale: () => Localization.Locale | undefined = () => {
  try {
    const foundLocale = systemLocales.find((locale) =>
      systemTagMatchesSupportedTags(locale.languageTag)
    );

    if (!foundLocale) return undefined;

    if (foundLocale.languageTag.toLowerCase().startsWith("pt")) {
      return {
        ...foundLocale,
        languageTag: "pt",
      };
    }

    return foundLocale;
  } catch (error) {
    logger.warn("Error picking supported locale:", error);
    return undefined;
  }
};

const locale = pickSupportedLocale();

export let isRTL = false;

if (locale?.languageTag && locale?.textDirection === "rtl") {
  I18nManager.allowRTL(true);
  isRTL = true;
} else {
  I18nManager.allowRTL(false);
}

export const initI18n = async () => {
  try {
    i18n.use(initReactI18next);

    const savedLanguage = await LanguageService.getSelectedLanguage();

    const selectedLocale =
      savedLanguage || locale?.languageTag || fallbackLocale;

    logger.debug("Initializing i18n with locale:", selectedLocale);
    logger.debug("Saved language from storage:", savedLanguage);
    logger.debug("System locale:", locale?.languageTag);

    await i18n.init({
      resources,
      lng: selectedLocale,
      fallbackLng: fallbackLocale,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      debug: __DEV__,
      defaultNS: "common",
      ns: ["common"],
      keySeparator: ".",
      nsSeparator: ":",
      compatibilityJSON: "v4",
      load: "languageOnly",
    });

    logger.info("i18n initialized successfully");
    return i18n;
  } catch (error) {
    logger.error("Error initializing i18n:", error);
    try {
      await i18n.init({
        resources,
        lng: fallbackLocale,
        fallbackLng: fallbackLocale,
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
        debug: __DEV__,
        defaultNS: "common",
        ns: ["common"],
        keySeparator: ".",
        nsSeparator: ":",
        compatibilityJSON: "v4",
        load: "languageOnly",
      });
      return i18n;
    } catch (fallbackError) {
      logger.error("Critical error initializing i18n:", fallbackError);
      throw fallbackError;
    }
  }
};

export default i18n;

export type TxKeyPath = RecursiveKeyOf<Translations>;

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`,
    true
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`,
    false
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean
> = TValue extends any[]
  ? Text
  : TValue extends object
  ? IsFirstLevel extends true
    ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
    : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
  : Text;
