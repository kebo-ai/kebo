import React, { FC, useEffect, useState, useCallback } from "react";
import { AppStackScreenProps } from "../../navigators/AppNavigator";
import { observer } from "mobx-react-lite";
import { useStores } from "../../models/helpers/useStores";
import tw from "../../utils/useTailwind";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../theme/colors";
import CustomHeader from "../../components/custom/CustomHeader";
import { SearchIconSvg } from "../../components/svg/SearchSvg";
import { FixedScreen } from "../../components/FixedScreen";
import * as Localization from "expo-localization";
import { translate } from "../../i18n";

// Define the route params interface
interface SelectBankRouteParams {
  isTransfer?: boolean;
  transferType?: "from" | "to";
  fromBankModal?: boolean;
  fromScreen?: string;
}

interface SelectBankScreenProps extends AppStackScreenProps<"SelectBank"> {
  route: {
    params?: SelectBankRouteParams;
  };
}

interface Bank {
  id: string;
  name: string;
  bank_url: string;
}

export const SelectBankScreen: FC<SelectBankScreenProps> = observer(
  function SelectBankScreen({ navigation, route }) {
    const {
      bankStoreModel: { getListBanksByCountry, banks, searchBanksByCountry },
      uiStoreModel: { showLoader, hideLoader, isLoading },
      profileModel,
    } = useStores();
    const [searchQuery, setSearchQuery] = useState("");

    const { fromScreen, isTransfer, transferType, fromBankModal } =
      route.params || {};

    const deviceRegion = Localization.getLocales()[0]?.regionCode || "US";
    const userCountry = profileModel?.country || deviceRegion;

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (searchQuery.trim()) {
          showLoader();
          searchBanksByCountry(searchQuery, userCountry).finally(() => hideLoader());
        } else {
          showLoader();
          getListBanksByCountry(userCountry).finally(() => hideLoader());
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }, [searchQuery, userCountry]);

    return (
      <FixedScreen
        safeAreaEdges={["top"]}
        backgroundColor="#FAFAFA"
        statusBarBackgroundColor={colors.primary}
        header={
          <CustomHeader
            onPress={() => navigation.goBack()}
            title={translate("components:bankModal.addAccount")}
          />
        }
      >
        <View style={tw`flex-1`}>
          <View style={tw`px-6`}>
            <Text
              style={[
                tw`text-base text-[${colors.textGray}] mt-4`,
                { fontFamily: "SFUIDisplayMedium" },
              ]}
            >
              {translate("components:bankModal.chooseBank")}
            </Text>
            <Text
              style={[
                tw`text-[14px] text-[#606A8480]`,
                { fontFamily: "SFUIDisplayLight" },
              ]}
            >
              {translate("components:bankModal.selectBank")}
            </Text>
            <View
              style={tw`flex-row items-center my-4 h-[44px] rounded-[15px] border border-[#606A8426] bg-[${colors.white}] px-4 py-2 gap-2`}
            >
              <SearchIconSvg />
              <TextInput
                placeholder={translate("components:bankModal.searchBank")}
                style={[
                  tw`text-base text-[${colors.textGray}] leading-[21px] tracking-0 flex-1`,
                  { fontFamily: "SFUIDisplayMedium" },
                ]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView
            style={tw`flex-1 px-6`}
            contentContainerStyle={tw`pb-6`}
            showsVerticalScrollIndicator={false}
          >
            {banks?.map((bank) => (
              <TouchableOpacity
                key={bank.id}
                onPress={() => {
                  navigation.navigate("AccountBalance", {
                    selectedBank: {
                      id: bank.id,
                      name: bank.name,
                      bank_url: bank.bank_url || "",
                    } as Bank,
                    isTransfer: route.params?.isTransfer,
                    transferType: route.params?.transferType,
                    fromScreen:
                      fromScreen || (fromBankModal ? "BankModal" : undefined),
                  });
                }}
                style={tw`flex-row items-center rounded h-[54px] gap-2 pl-2.5 mb-2`}
              >
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${bank.bank_url}`,
                  }}
                  style={tw`w-[22px] h-[22px] border border-[#6934D2]/15 rounded-full`}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    tw`text-base text-[${colors.textGray}]`,
                    { fontFamily: "SFUIDisplayMedium" },
                  ]}
                >
                  {bank.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : bank.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : bank.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </FixedScreen>
    );
  }
);
