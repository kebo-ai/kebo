import logger from "@/utils/logger";
import { observer } from "mobx-react-lite";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@/components/Screen";
import tw from "@/hooks/useTailwind";
import { ImageCustom } from "@/components/assets/Image";
import CustomInput from "@/components/common/CustomInput";
import CustomButton from "@/components/common/CustomButton";
import { colors } from "@/theme/colors";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/config/supabase";
import { useFormik } from "formik";
import * as Yup from "yup";
import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { useStores } from "@/models/helpers/useStores";
import { showToast } from "@/components/ui/CustomToast";
import { BackBlackSvg } from "@/components/icons/BackBlackSvg";
import { translate } from "@/i18n";

interface MagicLinkScreenProps {}

const redirectTo = makeRedirectUri();

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;
  if (!access_token) return;
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

export const MagicLinkScreen: FC<MagicLinkScreenProps> = observer(
  function MagicLinkScreen() {
    const router = useRouter();
    const {
      uiStoreModel: { showLoader, hideLoader },
    } = useStores();

    const formik = useFormik({
      initialValues: { email: "" },
      validationSchema: Yup.object().shape({
        email: Yup.string()
          .email(translate("magicLinkScreen:errorMail"))
          .required(translate("magicLinkScreen:requiredMail")),
      }),
      onSubmit: async (values) => {
        try {
          showLoader();
          const { data, error } = await supabase.auth.signInWithOtp({
            email: values.email,
            options: {
              emailRedirectTo: redirectTo,
            },
          });
          if (error) {
            logger.error("Error sending magic link:", error.message);

            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));

          showToast("success", translate("magicLinkScreen:sendMail"));
        } catch (error) {
          logger.error("Failed to send magic link:", error);
          showToast("error", translate("magicLinkScreen:errorSendMail"));
        } finally {
          hideLoader();
        }
      },
    });

    const url = Linking.useURL();
    if (url) createSessionFromUrl(url);

    const renderHeader = () => {
      return (
        <View style={tw`justify-between flex-row items-center`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
          >
            <BackBlackSvg width={15} height={15} />
          </TouchableOpacity>

          <Text
            style={[
              tw`text-black text-lg text-center font-medium`,
              { fontFamily: "SFUIDisplayMedium" },
            ]}
          ></Text>
          <TouchableOpacity>
            <View style={tw`w-4 h-4`}></View>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <Screen
        safeAreaEdges={["top"]}
        preset="scroll"
        statusBarStyle={"dark"}
        header={renderHeader()}
      >
        <View style={tw`px-6`}>
          <View style={tw`mt-4`}>
            <ImageCustom
              icon={"keboLogoHeader"}
              size={{ width: 130, height: 58 }}
            />
          </View>
          <View style={tw`mt-12`}>
            <Text
              style={[
                tw`text-[32px] text-[${colors.secondary}]`,
                { fontFamily: "SFUIDisplayBold" },
              ]}
            >
              {translate("magicLinkScreen:loginMagic")}
            </Text>
          </View>
          <View style={tw`mt-[50px]`}>
            <CustomInput
              label={""}
              placeholder={translate("magicLinkScreen:email")}
              type="email"
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              value={formik.values.email}
            />
          </View>
          <View style={tw`pb-10 justify-between`}>
            <CustomButton
              variant="primary"
              isEnabled={formik.isValid && formik.dirty}
              onPress={() => formik.handleSubmit()}
              title={translate("magicLinkScreen:continue")}
            />
          </View>
        </View>
      </Screen>
    );
  }
);
