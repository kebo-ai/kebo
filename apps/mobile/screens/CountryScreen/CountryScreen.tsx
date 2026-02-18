import logger from "@/utils/logger";
import React, { FC, useEffect } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import tw from "twrnc";
import { Stack, useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { showToast } from "@/components/ui/CustomToast";
import { useStores } from "@/models/helpers/useStores";
import { translate } from "@/i18n";
import { updateUserProfile } from "@/services/UserService";
import { getUserInfo } from "@/utils/authUtils";
import * as Localization from "expo-localization";

interface CountryScreenProps {}

const countries = [
  {
    code: "PE",
    name: "Peru",
    flag: "🇵🇪",
    currency: "PEN",
    currencySymbol: "S/",
    currencyName: "Sol Peruano",
  },
  {
    code: "CO",
    name: "Colombia",
    flag: "🇨🇴",
    currency: "COP",
    currencySymbol: "$",
    currencyName: "Peso Colombiano",
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    currency: "MXN",
    currencySymbol: "$",
    currencyName: "Peso Mexicano",
  },
  {
    code: "EC",
    name: "Ecuador",
    flag: "🇪🇨",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "Dolar Estadounidense",
  },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    currency: "ARS",
    currencySymbol: "$",
    currencyName: "Peso Argentino",
  },
  {
    code: "VE",
    name: "Venezuela",
    flag: "🇻🇪",
    currency: "VES",
    currencySymbol: "Bs.",
    currencyName: "Bolivar Soberano",
  },
  {
    code: "ES",
    name: "Espana",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "E",
    currencyName: "Euro",
  },
  {
    code: "CL",
    name: "Chile",
    flag: "🇨🇱",
    currency: "CLP",
    currencySymbol: "$",
    currencyName: "Peso Chileno",
  },
  {
    code: "US",
    name: "Estados Unidos",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "Dolar Estadounidense",
  },
  {
    code: "BO",
    name: "Bolivia",
    flag: "🇧🇴",
    currency: "BOB",
    currencySymbol: "Bs",
    currencyName: "Boliviano",
  },
  {
    code: "DO",
    name: "Republica Dominicana",
    flag: "🇩🇴",
    currency: "DOP",
    currencySymbol: "RD$",
    currencyName: "Peso Dominicano",
  },
  {
    code: "HN",
    name: "Honduras",
    flag: "🇭🇳",
    currency: "HNL",
    currencySymbol: "L",
    currencyName: "Lempira",
  },
  {
    code: "SV",
    name: "El Salvador",
    flag: "🇸🇻",
    currency: "USD",
    currencySymbol: "$",
    currencyName: "Dolar Estadounidense",
  },
  {
    code: "GT",
    name: "Guatemala",
    flag: "🇬🇹",
    currency: "GTQ",
    currencySymbol: "Q",
    currencyName: "Quetzal",
  },
  {
    code: "PY",
    name: "Paraguay",
    flag: "🇵🇾",
    currency: "PYG",
    currencySymbol: "G",
    currencyName: "Guarani",
  },
  {
    code: "CR",
    name: "Costa Rica",
    flag: "🇨🇷",
    currency: "CRC",
    currencySymbol: "C",
    currencyName: "Colon Costarricense",
  },
  {
    code: "PA",
    name: "Panama",
    flag: "🇵🇦",
    currency: "PAB",
    currencySymbol: "B/.",
    currencyName: "Balboa",
  },
  {
    code: "UY",
    name: "Uruguay",
    flag: "🇺🇾",
    currency: "UYU",
    currencySymbol: "$U",
    currencyName: "Peso Uruguayo",
  },
  {
    code: "BR",
    name: "Brasil",
    flag: "🇧🇷",
    currency: "BRL",
    currencySymbol: "R$",
    currencyName: "Real Brasileno",
  },
  {
    code: "NI",
    name: "Nicaragua",
    flag: "🇳🇮",
    currency: "NIO",
    currencySymbol: "C$",
    currencyName: "Cordoba Nicaraguense",
  },
];

export const CountryScreen: FC<CountryScreenProps> = observer(
  function CountryScreen() {
    const router = useRouter();
    const rootStore = useStores();
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
            headerShown: true,
            headerLargeTitle: true,
            headerTransparent: true,
            headerBlurEffect: "extraLight",
            headerBackTitle: translate("common:back"),
            headerTintColor: colors.primary,
            title: translate("countryScreen:selectCountry"),
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
            {countries.map((country, index) => (
              <TouchableOpacity
                key={country.code}
                style={tw`flex-row items-center p-4 ${
                  index < countries.length - 1 ? "border-b border-[#EBEBEF]" : ""
                }`}
                onPress={() => handleCountryChange(country.code)}
              >
                <Text style={tw`text-3xl mr-4`}>{country.flag}</Text>
                <View style={tw`flex-1`}>
                  <Text weight="medium" color="#110627">
                    {country.name}
                  </Text>
                  <Text type="xs" weight="light" color="#606A84">
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
