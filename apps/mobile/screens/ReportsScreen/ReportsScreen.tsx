import { observer } from "mobx-react-lite";
import { FC } from "react";
import { useRouter } from "expo-router";
import { View, ScrollView } from "react-native";
import { Text } from "@/components/ui";
import { showToast } from "@/components/ui/CustomToast";
import tw from "@/hooks/useTailwind";
import { useTheme } from "@/hooks/useTheme";
import { translate } from "@/i18n";
import CustomReportCard from "@/components/common/CustomReportCard";
import { EXTERNAL_URLS } from "@/config/urls";

interface ReportsScreenProps {}

export const ReportsScreen: FC<ReportsScreenProps> = observer(
  function ReportsScreen() {
    const router = useRouter();
    const { theme } = useTheme();

    const handleReportPress = () => {
      showToast("warning", translate("alertMessage:comminSoon"));
    };

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`px-6 pb-24`}>
            <Text
              style={tw`text-center text-sm pb-6 mt-1`}
              weight="semibold"
              color={theme.headerTitle}
            >
              {translate("reportsScreen:title")}
            </Text>
            <View style={tw`gap-4`}>
              <CustomReportCard
                title={translate("reportsScreen:reportTitle1")}
                subtitle={translate("reportsScreen:reportBody1")}
                imageSource={require("../../assets/images/income.png")}
                onPress={() => router.push("/(authenticated)/reports-income")}
                colorTop="#D3C0FF"
                colorBottom="#D3C0FF"
              />
              <CustomReportCard
                title={translate("reportsScreen:reportTitle2")}
                subtitle={translate("reportsScreen:reportBody2")}
                imageSource={require("../../assets/images/categories.png")}
                onPress={() => router.push("/(authenticated)/reports-category")}
                colorTop="#E4E6E9"
                colorBottom="#F4F1FB"
              />
              <CustomReportCard
                title={translate("reportsScreen:reportTitle5")}
                subtitle={translate("reportsScreen:reportBody5")}
                imageSource={require("../../assets/images/credit.png")}
                onPress={() =>
                  router.push({
                    pathname: "/(authenticated)/webview",
                    params: {
                      url: EXTERNAL_URLS.LEARNING_BASE,
                      title: "Calculadora Credito",
                    },
                  })
                }
                colorTop="#D3C0FF"
                colorBottom="#D3C0FF"
              />
              <CustomReportCard
                title={translate("reportsScreen:reportTitle6")}
                subtitle={translate("reportsScreen:reportBody6")}
                imageSource={require("../../assets/images/investment.png")}
                onPress={() =>
                  router.push({
                    pathname: "/(authenticated)/webview",
                    params: {
                      url: EXTERNAL_URLS.LEARNING_INVESTMENT,
                      title: "Calculadora Inversion",
                    },
                  })
                }
                colorTop="#E4E6E9"
                colorBottom="#F4F1FB"
              />
              <View style={tw`relative pointer-events-none`}>
                <CustomReportCard
                  title={translate("reportsScreen:reportTitle3")}
                  subtitle={translate("reportsScreen:reportBody3")}
                  imageSource={require("../../assets/images/budget.png")}
                  onPress={handleReportPress}
                  colorTop="#D3C0FF"
                  colorBottom="#D3C0FF"
                />
                <View
                  style={tw`absolute inset-0 bg-black/45 rounded-xl items-center justify-center`}
                  pointerEvents="none"
                >
                  <Text style={tw`text-white font-bold`}>
                    {translate("alertMessage:comminSoon")}
                  </Text>
                </View>
              </View>

              <View style={tw`relative pointer-events-none`}>
                <CustomReportCard
                  title={translate("reportsScreen:reportTitle4")}
                  subtitle={translate("reportsScreen:reportBody4")}
                  imageSource={require("../../assets/images/transactions.png")}
                  onPress={handleReportPress}
                  colorTop="#E4E6E9"
                  colorBottom="#F4F1FB"
                />
                <View
                  style={tw`absolute inset-0 bg-black/45 rounded-xl items-center justify-center`}
                  pointerEvents="none"
                >
                  <Text style={tw`text-white font-bold`}>
                    {translate("alertMessage:comminSoon")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
      </ScrollView>
    );
  }
);
