import React, { FC } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { observer } from "mobx-react-lite";
import tw from "@/hooks/useTailwind";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import CustomButton from "@/components/common/CustomButton";
import { colors } from "@/theme/colors";
import { standardHeader } from "@/theme/headerOptions";
import { ManualSvg } from "@/components/icons/ManualSvg";
import { UserSvg } from "@/components/icons/UserSvg";
import { showToast } from "@/components/ui/CustomToast";
import { translate } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";

interface SelectBankTypeScreenProps {}

export const SelectBankTypeScreen: FC<SelectBankTypeScreenProps> = observer(
  function SelectBankTypeScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const params = useLocalSearchParams<{
      bankId: string;
      selectedBank?: string;
    }>();

    let selectedBank;
    try {
      selectedBank = params.selectedBank
        ? JSON.parse(params.selectedBank)
        : { id: params.bankId, name: "", bank_url: "" };
    } catch (e) {
      selectedBank = { id: params.bankId, name: "", bank_url: "" };
    }

    return (
      <>
        <Stack.Screen
          options={{
            ...standardHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: translate("selectBankScreen:addAccountTitle"),
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={tw`px-4 pt-4 pb-24`}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`px-2`}>
            <View
              style={[
                tw`h-[60px] rounded-[20px] p-[14px] pr-[18px] pl-[16px] gap-[16px] flex-row items-center`,
                { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${selectedBank.bank_url}`,
                }}
                style={[tw`w-[22px] h-[22px] rounded-full`, { borderWidth: 1, borderColor: theme.border }]}
              />
              <Text
                style={tw`text-base`}
                weight="medium"
                color={theme.textPrimary}
              >
                {selectedBank.name}
              </Text>
            </View>
            <Text
              style={tw`text-base mt-5`}
              weight="semibold"
              color={theme.textPrimary}
            >
              {translate("selectBankScreen:titleText")}
            </Text>
            <View
              style={tw`mt-5 rounded-[20px] gap-[8px] p-4 bg-[rgba(105,52,210,0.15)]`}
            >
              <View style={tw`flex-row items-center`}>
                <ManualSvg />
                <Text
                  style={tw`text-base ml-2`}
                  weight="semibold"
                  color={colors.primary}
                >
                  {translate("selectBankScreen:manualText")}
                </Text>
              </View>
              <Text
                style={tw`text-sm`}
                weight="light"
                color={colors.primary}
              >
                {translate("selectBankScreen:bodyText")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => showToast("warning", translate("alertMessage:comminSoon"))}
            >
              <View
                style={[
                  tw`mt-5 h-auto rounded-[20px] gap-[8px] p-[16px]`,
                  { backgroundColor: theme.surfaceSecondary, borderWidth: 1, borderColor: theme.border },
                ]}
              >
                <View style={tw`flex-row items-center gap-[8px]`}>
                  <UserSvg />
                  <Text
                    style={tw`text-base`}
                    weight="normal"
                    color={theme.textSecondary}
                  >
                    {translate("selectBankScreen:automaticText")}
                  </Text>
                  <View
                    style={[tw`px-[8px] py-[2px] rounded-[10px]`, { backgroundColor: theme.surfaceSecondary }]}
                  >
                    <Text
                      style={tw`text-xs`}
                      weight="medium"
                      color={theme.textSecondary}
                    >
                      {translate("selectBankScreen:openFinance")}
                    </Text>
                  </View>
                </View>
                <Text
                  style={tw`text-sm leading-[18px] mt-[8px]`}
                  weight="normal"
                  color={theme.textSecondary}
                >
                  {translate("selectBankScreen:alertText")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={tw`px-6 pb-10 justify-between`}>
          <CustomButton
            variant="primary"
            isEnabled={true}
            onPress={() => {}}
            title={translate("selectBankScreen:continue")}
          />
        </View>
      </>
    );
  }
);
