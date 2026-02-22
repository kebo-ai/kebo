import logger from "@/utils/logger";
import React, { FC, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { largeTitleHeader } from "@/theme/header-options";
import { useTheme } from "@/hooks/useTheme";
import { showToast } from "@/components/ui/CustomToast";
import { useStores } from "@/models/helpers/use-stores";
import { translate } from "@/i18n";
import { updateUserProfile } from "@/services/UserService";
import { getUserInfo } from "@/utils/auth-utils";
import * as Localization from "expo-localization";

interface CountryScreenProps {}

const countries = [
  {
    code: "PE",
    name: "Peru",
    flag: "\u{1F1F5}\u{1F1EA}",
    currency: "PEN",
    currencySymbol: "S/",
    currencyName: "Sol Peruano",
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "\u{1F1E8}\u{1F1F4}",
    currency: "COP",
    currencySymbol: "$",
    currencyName: "Peso Colombiano",
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "\u{1F1F2}\u{1F1FD}",
    currency: "MXN",
    currencySymbol: "$",
    currencyName: "Peso Mexicano",
  },
  {
    code: "EC",
    name: "Ecuador",
    flag: "\u{1F1EA}\u{1F1E8}",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "Dolar Estadounidense",
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    currency: "ARS",
    currencySymbol: "$",
    currencyName: "Peso Argentino",
  },
  {
    code: "VE",
    name: "Venezuela",
    flag: "\u{1F1FB}\u{1F1EA}",
    currency: "VES",
    currencySymbol: "Bs.",
    currencyName: "Bolivar Soberano",
  },
  {
    code: "ES",
    name: "Espana",
    flag: "\u{1F1EA}\u{1F1F8}",
    currency: "EUR",
    currencySymbol: "E",
    currencyName: "Euro",
  },
  {
    code: "CL",
    name: "Chile",
    flag: "\u{1F1E8}\u{1F1F1}",
    currency: "CLP",
    currencySymbol: "$",
    currencyName: "Peso Chileno",
  },
  {
    code: "US",
    name: "Estados Unidos",
    flag: "\u{1F1FA}\u{1F1F8}",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "Dolar Estadounidense",
  },
  {
    code: "BO",
    name: "Bolivia",
    flag: "\u{1F1E7}\u{1F1F4}",
    currency: "BOB",
    currencySymbol: "Bs",
    currencyName: "Boliviano",
  },
  {
    code: "DO",
    name: "Republica Dominicana",
    flag: "\u{1F1E9}\u{1F1F4}",
    currency: "DOP",
    currencySymbol: "RD$",
    currencyName: "Peso Dominicano",
  },
  {
    code: "HN",
    name: "Honduras",
    flag: "\u{1F1ED}\u{1F1F3}",
    currency: "HNL",
    currencySymbol: "L",
    currencyName: "Lempira",
  },
  {
    code: "SV",
    name: "El Salvador",
    flag: "\u{1F1F8}\u{1F1FB}",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "Dolar Estadounidense",
  },
  {
    code: "GT",
    name: "Guatemala",
    flag: "\u{1F1EC}\u{1F1F9}",
    currency: "GTQ",
    currencySymbol: "Q",
    currencyName: "Quetzal",
  },
  {
    code: "PY",
    name: "Paraguay",
    flag: "\u{1F1F5}\u{1F1FE}",
    currency: "PYG",
    currencySymbol: "G",
    currencyName: "Guarani",
  },
  {
    code: "CR",
    name: "Costa Rica",
    flag: "\u{1F1E8}\u{1F1F7}",
    currency: "CRC",
    currencySymbol: "C",
    currencyName: "Colon Costarricense",
  },
  {
    code: "PA",
    name: "Panama",
    flag: "\u{1F1F5}\u{1F1E6}",
    currency: "PAB",
    currencySymbol: "B/.",
    currencyName: "Balboa",
  },
  {
    code: "UY",
    name: "Uruguay",
    flag: "\u{1F1FA}\u{1F1FE}",
    currency: "UYU",
    currencySymbol: "$U",
    currencyName: "Peso Uruguayo",
  },
  {
    code: "BR",
    name: "Brasil",
    flag: "\u{1F1E7}\u{1F1F7}",
    currency: "BRL",
    currencySymbol: "R$",
    currencyName: "Real Brasileno",
  },
  {
    code: "NI",
    name: "Nicaragua",
    flag: "\u{1F1F3}\u{1F1EE}",
    currency: "NIO",
    currencySymbol: "C$",
    currencyName: "Cordoba Nicaraguense",
  },
];

export const CountryScreen: FC<CountryScreenProps> = observer(
  function CountryScreen() {
    const router = useRouter();
    const rootStore = useStores();
    const { theme } = useTheme();
    const {
      profileModel,
      uiStoreModel: { showLoader, hideLoader },
      bankStoreModel: { getListBanksByCountry },
    } = rootStore;

    const [selectedCountry, setSelectedCountry] = React.useState(
      profileModel.country || Localization.getLocales()[0]?.regionCode || "CO"
    );

    useEffect(() => {
      if (profileModel.country) {
        setSelectedCountry(profileModel.country);
      }
    }, [profileModel.country]);

    const handleCountryChange = async (countryCode: string) => {
      try {
        showLoader();
        const selectedCountryData = countries.find((c) => c.code === countryCode);

        if (!selectedCountryData) {
          throw new Error("Country not found");
        }

        const response = await updateUserProfile({
          country: countryCode,
          currency: selectedCountryData.currency,
        });

        if (response.success) {
          setSelectedCountry(countryCode);

          profileModel.setCountryAndCurrency(
            countryCode,
            selectedCountryData.currency
          );

          await getUserInfo(rootStore);
          await getListBanksByCountry(countryCode);

          showToast("success", translate("countryScreen:successChangeCountry"));

          setTimeout(() => {
            router.back();
          }, 100);
        } else {
          throw new Error(response.error || "Failed to update country");
        }
      } catch (error) {
        logger.error("Error updating country:", error);
        showToast("error", translate("countryScreen:errorChangeCountry"));
      } finally {
        hideLoader();
      }
    };

    return (
      <>
        <Stack.Screen
          options={{
            ...largeTitleHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: translate("countryScreen:selectCountry"),
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={tw`px-4 pt-4 pb-24`}
          showsVerticalScrollIndicator={false}
        >
          <View style={[tw`rounded-2xl overflow-hidden border`, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {countries.map((country, index) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  tw`flex-row items-center p-4`,
                  index < countries.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
                onPress={() => handleCountryChange(country.code)}
              >
                <Text style={tw`text-3xl mr-4`}>{country.flag}</Text>
                <View style={tw`flex-1`}>
                  <Text weight="medium" color={theme.textPrimary}>
                    {country.name}
                  </Text>
                  <Text type="xs" weight="light" color={theme.textSecondary}>
                    {country.currencyName} ({country.currencySymbol}{" "}
                    {country.currency})
                  </Text>
                </View>
                {selectedCountry === country.code && (
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
