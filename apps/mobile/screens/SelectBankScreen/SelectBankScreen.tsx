import React, { FC, useEffect, useState } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { observer } from "mobx-react-lite";
import { useStores } from "@/models/helpers/useStores";
import tw from "@/hooks/useTailwind";
import {
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/headerOptions";
import { SearchIconSvg } from "@/components/icons/SearchSvg";
import * as Localization from "expo-localization";
import { translate } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";

interface Bank {
  id: string;
  name: string;
  bank_url: string;
}

interface SelectBankScreenProps {}

export const SelectBankScreen: FC<SelectBankScreenProps> = observer(
  function SelectBankScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
      isTransfer?: string;
      transferType?: "from" | "to";
      fromBankModal?: string;
      fromScreen?: string;
    }>();

    const {
      bankStoreModel: { getListBanksByCountry, banks, searchBanksByCountry },
      uiStoreModel: { showLoader, hideLoader, isLoading },
      profileModel,
    } = useStores();
    const [searchQuery, setSearchQuery] = useState("");
    const { theme, isDark } = useTheme();

    const isTransfer = params.isTransfer === "true";
    const transferType = params.transferType;
    const fromBankModal = params.fromBankModal === "true";
    const fromScreen = params.fromScreen;

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
      <>
        <Stack.Screen
          options={{
            ...standardHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: translate("components:bankModal.addAccount"),
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={tw`px-4 pt-4 pb-24`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`px-2`}>
            <Text
              style={tw`text-base`}
              weight="medium"
              color={theme.textPrimary}
            >
              {translate("components:bankModal.chooseBank")}
            </Text>
            <Text
              style={tw`text-sm mt-1`}
              weight="light"
              color={theme.textTertiary}
            >
              {translate("components:bankModal.selectBank")}
            </Text>
            <View
              style={[
                tw`flex-row items-center my-4 h-[44px] rounded-2xl px-4 py-2 gap-2`,
                { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
              ]}
            >
              <SearchIconSvg />
              <TextInput
                placeholder={translate("components:bankModal.searchBank")}
                placeholderTextColor={theme.textTertiary}
                style={[
                  tw`text-base leading-[21px] flex-1`,
                  { fontFamily: "SFUIDisplayMedium", color: theme.textPrimary },
                ]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View
            style={[tw`rounded-2xl overflow-hidden`, { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            {banks?.map((bank, index) => (
              <TouchableOpacity
                key={bank.id}
                onPress={() => {
                  router.push({
                    pathname: "/(authenticated)/account-balance",
                    params: {
                      selectedBank: JSON.stringify({
                        id: bank.id,
                        name: bank.name,
                        bank_url: bank.bank_url || "",
                      } as Bank),
                      isTransfer: isTransfer ? "true" : "false",
                      transferType: transferType,
                      fromScreen: fromScreen || (fromBankModal ? "BankModal" : undefined),
                    },
                  });
                }}
                style={[
                  tw`flex-row items-center h-[54px] gap-3 px-4`,
                  index < (banks?.length ?? 0) - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
              >
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${bank.bank_url}`,
                  }}
                  style={[tw`w-[22px] h-[22px] rounded-full`, { borderWidth: 1, borderColor: theme.border }]}
                  resizeMode="contain"
                />
                <Text
                  style={tw`text-base`}
                  weight="medium"
                  color={theme.textPrimary}
                >
                  {bank.name === "Banco Personalizado"
                    ? translate("components:bankModal.customBank")
                    : bank.name === "Efectivo"
                    ? translate("modalAccount:cash")
                    : bank.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </>
    );
  }
);
