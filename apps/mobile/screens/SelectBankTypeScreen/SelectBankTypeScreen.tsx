import React, { FC } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { observer } from "mobx-react-lite";
import tw from "@/hooks/useTailwind";
import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui";
import { colors } from "@/theme/colors";
import CustomHeader from "@/components/common/CustomHeader";
import { FixedScreen } from "@/components/FixedScreen";
import { ManualSvg } from "@/components/icons/ManualSvg";
import { UserSvg } from "@/components/icons/UserSvg";
import CustomButton from "@/components/common/CustomButton";
import { showToast } from "@/components/ui/CustomToast";
import { translate } from "@/i18n";

interface SelectBankTypeScreenProps {}

export const SelectBankTypeScreen: FC<SelectBankTypeScreenProps> = observer(
  function SelectBankTypeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
      bankId: string;
      selectedBank?: string;
    }>();

    // Parse selected bank from params
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
        <FixedScreen
          safeAreaEdges={["top"]}
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor={colors.primary}
          header={
            <CustomHeader
              onPress={() => router.back()}
              title={translate("selectBankScreen:addAccountTitle")}
            />
          }
        >
          <View style={tw`flex-1 mt-4`}>
            <View style={tw`px-6`}>
              <TouchableOpacity
                disabled
                onPress={() => {
                  router.back();
                }}
                style={tw`h-[60px] rounded-[20px] border border-[rgba(96,106,132,0.15)] p-[14px] pr-[18px] pl-[16px] gap-[16px] flex-row items-center`}
              >
                <Image
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_SUPABASE_URL}${selectedBank.bank_url}`,
                  }}
                  style={tw`w-[22px] h-[22px] border border-[#6934D2]/15 rounded-full`}
                />
                <Text
                  style={tw`text-base`}
                  weight="medium"
                  color={colors.textGray}
                >
                  {selectedBank.name}
                </Text>
              </TouchableOpacity>
              <Text
                style={tw`text-base mt-5`}
                weight="semibold"
                color={colors.textGray}
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
                  style={tw`text-[14px]`}
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
                  style={tw`mt-5 h-auto rounded-[20px] gap-[8px]  p-[16px] bg-[rgba(235,236,240,0.5)] border border-[rgba(96,106,132,0.15)]`}
                >
                  <View style={tw`flex-row items-center gap-[8px]`}>
                    <UserSvg />
                    <Text
                      style={tw`text-[16px] font-semibold`}
                      weight="normal"
                      color="rgba(96,106,132,1)"
                    >
                      {translate("selectBankScreen:automaticText")}
                    </Text>
                    <View
                      style={tw`bg-[rgba(96,106,132,0.2)] px-[8px] py-[2px] rounded-[10px]`}
                    >
                      <Text
                        style={tw`text-[12px] font-medium text-[rgba(96,106,132,1)]`}
                      >
                         {translate("selectBankScreen:openFinance")}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={tw`text-[14px] leading-[18px] font-light mt-[8px]`}
                    weight="normal"
                    color="rgba(96,106,132,1)"
                  >
                     {translate("selectBankScreen:alertText")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </FixedScreen>
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
