import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";
import * as Localization from "expo-localization";
import { AppStackScreenProps, navigate } from "../../navigators";
import { Screen } from "../../components/Screen";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ImageCustom, imageRegistry } from "../../components/assets/Image";
import { showToast } from "../../components/ui/CustomToast";
import tw from "../../utils/useTailwind";
import { Image } from "react-native";
import { translate } from "../../i18n";
import CustomReportCard from "../../components/custom/CustomReportCard";
import i18n from "../../i18n/i18n";
import { EXTERNAL_URLS } from "../../config/urls";

interface ReportCardProps {
  image: React.ReactNode;
  onPress: () => void;
}

const ReportCard: FC<ReportCardProps> = ({ image, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View>{image}</View>
  </TouchableOpacity>
);

interface ReportsScreenProps extends AppStackScreenProps<"Reports"> {}

export const ReportsScreen: FC<ReportsScreenProps> = observer(
  function ReportsScreen({ navigation }) {
    const handleReportPress = () => {
      showToast("warning", translate("alertMessage:comminSoon"));
    };

    return (
      <Screen safeAreaEdges={["top"]} preset="scroll" statusBarStyle={"dark"}>
        <ScrollView
          style={tw`flex-1`}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <View style={tw`flex-1 min-h-screen px-6 pb-24`}>
            <Text
              style={[
                tw`text-center text-sm pb-6 mt-4`,
                { fontFamily: "SFUIDisplaySemiBold" },
              ]}
            >
              {translate("reportsScreen:title")}
            </Text>
            <View style={tw`gap-4`}>
              <CustomReportCard
                title={translate("reportsScreen:reportTitle1")}
                subtitle={translate("reportsScreen:reportBody1")}
                imageSource={require("../../assets/images/income.png")}
                onPress={() => navigation.navigate("ReportsIncomeScreen")}
                colorTop="#D3C0FF"
                colorBottom="#D3C0FF"
              />
              <CustomReportCard
                title={translate("reportsScreen:reportTitle2")}
                subtitle={translate("reportsScreen:reportBody2")}
                imageSource={require("../../assets/images/categories.png")}
                onPress={() => navigation.navigate("ReportsCategoryScreen")}
                colorTop="#E4E6E9"
                colorBottom="#F4F1FB"
              />
              <CustomReportCard
                title={translate("reportsScreen:reportTitle5")}
                subtitle={translate("reportsScreen:reportBody5")}
                imageSource={require("../../assets/images/credit.png")}
                onPress={() =>
                  navigation.navigate("WebView", {
                    url: EXTERNAL_URLS.LEARNING_BASE,
                    title: "Calculadora Crédito",
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
                  navigation.navigate("WebView", {
                    url: EXTERNAL_URLS.LEARNING_INVESTMENT,
                    title: "Calculadora Inversión",
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
      </Screen>
    );
  }
);
