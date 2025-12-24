import { observer } from "mobx-react-lite";
import { FC } from "react";
import { Text, View } from "react-native";
import { AppStackScreenProps } from "../../navigators";
import { Screen } from "../../components/Screen";
import AuthButtons from "../../components/AuthButton";
import tw from "../../utils/useTailwind";
import { translate } from "../../i18n";
import CustomButton from "../../components/custom/CustomButton";
import CustomCheckbox from "../../components/custom/CustomCheckBox";
import CustomInput from "../../components/custom/CustomInput";

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = observer(
  function LoginScreen() {
    const handleApplePress = () => {
      // Apple button logic
    };

    const handleGooglePress = () => {
      // Google button logic
    };

    const handleEmailPress = () => {
      // Email button logic
    };
    return (
      <Screen
        safeAreaEdges={["top"]}
        preset="scroll"
        backgroundColor="white"
        statusBarBackgroundColor="#FFFFFF"
      >
        <View style={tw`px-6`}></View>
        <View style={tw`mt-6`}>
          <View style={tw`mt-10`}>
            <Text style={tw`text-[32px] font-sfu700 text-secondary`}>
              {translate("loginScreen:title")}
            </Text>
          </View>
          <View style={tw`mt-6`}>
            <CustomInput
              label={translate("loginScreen:name")}
              placeholder={translate("loginScreen:name")}
            />
            <CustomInput
              label={translate("loginScreen:email")}
              placeholder={translate("loginScreen:email")}
              type="email"
            />
            <CustomInput
              label={translate("loginScreen:password")}
              placeholder={translate("loginScreen:password")}
              type="password"
            />
          </View>

          <CustomCheckbox text={translate("loginScreen:termsAndConditions")} />
          <View style={tw`mt-6`}>
            <Text style={tw`text-base text-center font-sfu300 text-primary`}>
              {translate("loginScreen:forgotPassword")}
            </Text>
          </View>
          <View style={tw`mt-6`}>
            <CustomButton
              variant="primary"
              isEnabled={true}
              onPress={() => {}}
              title={translate("loginScreen:registerAccount")}
            />
          </View>
          <View style={tw`flex-row items-center w-full my-[34px]`}>
            <View style={tw`flex-1 h-[1px] bg-border-gray`} />
            <Text style={tw`mx-2 text-[#4D4D4D] text-sm font-sfu300`}>
              {translate("loginScreen:orRegister")}
            </Text>
            <View style={tw`flex-1 h-[1px] bg-border-gray`} />
          </View>

          <View style={tw`mb-8`}>
            <AuthButtons showEmail={false} />
          </View>
        </View>
      </Screen>
    );
  }
);
