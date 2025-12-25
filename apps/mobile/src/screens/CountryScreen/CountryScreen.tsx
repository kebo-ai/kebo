import logger from "../../utils/logger";
import React, { FC, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Screen } from "../../components";
import { AppStackScreenProps } from "../../navigators/AppNavigator";
import { observer } from "mobx-react-lite";
import { colors } from "../../theme/colors";
import { BackBlackSvg } from "../../components/svg/BackBlackSvg";
import { showToast } from "../../components/ui/CustomToast";
import { useStores } from "../../models/helpers/useStores";
import { translate } from "../../i18n";
import { updateUserProfile } from "../../services/UserService";
import { getUserInfo } from "../../utils/authUtils";
import * as Localization from "expo-localization";

interface CountryScreenProps extends AppStackScreenProps<"Country"> {}

const countries = [
  {
    code: "PE",
    name: "Perú",
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
    name: "México",
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
    currencyName: "Dólar Estadounidense",
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
    currencyName: "Bolívar Soberano",
  },
  {
    code: "ES",
    name: "España",
    flag: "🇪🇸",
    currency: "EUR",
    currencySymbol: "€",
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
    currencyName: "Dólar Estadounidense",
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
    name: "República Dominicana",
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
    currencyName: "Dólar Estadounidense",
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
    currencySymbol: "₲",
    currencyName: "Guaraní",
  },
  {
    code: "CR",
    name: "Costa Rica",
    flag: "🇨🇷",
    currency: "CRC",
    currencySymbol: "₡",
    currencyName: "Colón Costarricense",
  },
  {
    code: "PA",
    name: "Panamá",
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
    currencyName: "Real Brasileño",
  },
  {
    code: "NI",
    name: "Nicaragua",
    flag: "🇳🇮",
    currency: "NIO",
    currencySymbol: "C$",
    currencyName: "Córdoba Nicaragüense",
  },
];

export const CountryScreen: FC<CountryScreenProps> = observer(
  function CountryScreen({ navigation }) {
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
            navigation.goBack();
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

    const renderHeader = () => (
      <View style={tw`justify-between flex-row items-center`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
        >
          <BackBlackSvg width={15} height={15} />
        </TouchableOpacity>

        <Text
          style={[
            tw`text-black text-lg text-center font-medium`,
            { fontFamily: "SFUIDisplayMedium" },
          ]}
        >
          {translate("countryScreen:selectCountry")}
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
          {countries.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={tw`flex-row items-center p-4 border-b border-[#606A84]/10`}
              onPress={() => handleCountryChange(country.code)}
            >
              <Text style={tw`text-3xl mr-4`}>{country.flag}</Text>
              <View style={tw`flex-1`}>
                <Text
                  style={[
                    tw`text-base text-[#110627]`,
                    { fontFamily: "SFUIDisplayMedium" },
                  ]}
                >
                  {country.name}
                </Text>
                <Text
                  style={[
                    tw`text-sm text-[#606A84]`,
                    { fontFamily: "SFUIDisplayLight" },
                  ]}
                >
                  {country.currencyName} ({country.currencySymbol}{" "}
                  {country.currency})
                </Text>
              </View>
              {selectedCountry === country.code && (
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
