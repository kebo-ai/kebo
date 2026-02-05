import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import tw from "twrnc";
import { colors } from "@/theme/colors";
import { useTranslation } from "react-i18next";
import { IconCustom } from "./assets/Icon";
import { supabase } from "@/config/supabase";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useStores } from "@/models/helpers/useStores";
import { useAnalytics } from "@/hooks/useAnalytics";
import { AUTH_EVENTS, EVENT_PROPERTIES } from "@/services/AnalyticsService";
import logger from "@/utils/logger";

interface AuthButtonProps {
  icon: JSX.Element;
  text: string;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  icon,
  text,
  onPress,
  backgroundColor = colors.black,
  textColor = colors.white,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        tw`flex-row items-center justify-center p-3 rounded-[16px] border-gray-400 bg-[${backgroundColor}] my-1`,
        style,
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={tw`text-[${textColor}] ml-2 text-base`}>{text}</Text>
    </TouchableOpacity>
  );
};

interface AuthButtonsProps {
  showEmail?: boolean;
}

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();
const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token) return;

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
};

const performOAuth = async (provider: "google" | "apple") => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });
  if (error) throw error;

  const res = await WebBrowser.openAuthSessionAsync(
    data?.url ?? "",
    redirectTo
  );
  if (res.type === "success") {
    await createSessionFromUrl(res.url);
  }
};

const AuthButtons: React.FC<AuthButtonsProps> = ({ showEmail = true }) => {
  if (Platform.OS === "android") {
    GoogleSignin.configure({
      scopes: ["openid", "email", "profile"],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }
  const { t } = useTranslation();
  const { uiStoreModel, accountStoreModel } = useStores();
  const analytics = useAnalytics();
  const url = Linking.useURL();
  if (url) createSessionFromUrl(url);

  const handleGoogleSignIn = async () => {
    if (__DEV__) {
      await performOAuth("google");
    } else {
      try {
        // analytics.trackAuthStart("google");

        uiStoreModel.showLoader();
        if (Platform.OS === "ios") {
          await performOAuth("google");
        } else {
          try {
            await GoogleSignin.hasPlayServices({
              showPlayServicesUpdateDialog: true,
            });
            const userInfo = await GoogleSignin.signIn();
            if (userInfo.data?.idToken) {
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: userInfo.data?.idToken,
              });

              if (error) {
                logger.error("Supabase Auth Error:", error.message);
                // analytics.trackAuthError("google", error);
                throw error;
              }

              if (data.user) {
                // analytics.trackAuthSuccess(
                //   "google",
                //   data.user.id,
                //   !data.user.last_sign_in_at
                // );

                const userName = data.user.user_metadata?.full_name || "";

                analytics.identify(data.user.id, {
                  [EVENT_PROPERTIES.USER_ID]: data.user.id,
                  [EVENT_PROPERTIES.EMAIL]: data.user.email,
                  full_name: userName,
                  [EVENT_PROPERTIES.REGISTRATION_DATE]: data.user.created_at,
                });

                await accountStoreModel.getListAccount();
              }
            } else {
              const noTokenError = new Error("No ID token present!");
              // analytics.trackAuthError("google", noTokenError);
              throw noTokenError;
            }
          } catch (error: any) {
            logger.error("Google Sign-In Error:", error.code);

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              logger.debug("User cancelled the login flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
              logger.debug("Operation in progress");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              logger.debug("Play services not available");
            } else {
              logger.error("Auth error code:", error.code);
            }
            throw error;
          }
        }
      } catch (error: any) {
        logger.error("Auth failed:", error.code);
        if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
          // analytics.trackAuthError("google", error);
        }
      } finally {
        uiStoreModel.hideLoader();
      }
    }
  };

  return (
    <View style={tw`w-full max-w-[350px] self-center`}>
      {Platform.OS === "ios" && (
        <AuthButton
          icon={<AntDesign name="apple1" size={24} color="white" />}
          text={t("loginButtons:apple")}
          backgroundColor="black"
          style={[
            tw`mb-2 py-3 px-4 flex-row items-center justify-center rounded-xl border border-gray-300`,
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            },
          ]}
          onPress={async () => {
            try {
              // analytics.trackAuthStart("apple");

              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });

              if (credential.identityToken) {
                const {
                  error,
                  data: { user },
                } = await supabase.auth.signInWithIdToken({
                  provider: "apple",
                  token: credential.identityToken,
                });

                if (error) {
                  // analytics.trackAuthError("apple", error);
                  throw error;
                }

                if (user) {
                  // analytics.trackAuthSuccess(
                  //   "apple",
                  //   user.id,
                  //   !user.last_sign_in_at
                  // );

                  const userName = user.user_metadata?.full_name || "";

                  analytics.identify(user.id, {
                    [EVENT_PROPERTIES.USER_ID]: user.id,
                    [EVENT_PROPERTIES.EMAIL]: user.email,
                    full_name: userName,
                    [EVENT_PROPERTIES.REGISTRATION_DATE]: user.created_at,
                  });

                  await accountStoreModel.getListAccount();
                }
              } else {
                const noTokenError = new Error("No identityToken.");
                // analytics.trackAuthError("apple", noTokenError);
                throw noTokenError;
              }
            } catch (e: any) {
              if (e.code === "ERR_REQUEST_CANCELED") {
                // analytics.trackAuthEvent(AUTH_EVENTS.AUTH_CANCELLED, {
                //   [EVENT_PROPERTIES.AUTH_METHOD]: "apple",
                //   [EVENT_PROPERTIES.ERROR_CODE]: "user_cancelled",
                // });
              } else {
                // analytics.trackAuthError("apple", e);
              }
            }
          }}
        />
      )}
      {/* Google Button */}
      <AuthButton
        icon={<IconCustom icon="google" size={24} color="black" />}
        text={t("loginButtons:google")}
        backgroundColor="white"
        textColor="black"
        style={[
          tw`mb-2 py-3 px-4 flex-row items-center justify-center rounded-xl border border-gray-300`,
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
          },
        ]}
        onPress={handleGoogleSignIn}
      />

      {/* Email Button */}
      {/* {showEmail && (
        <AuthButton
          icon={<Ionicons name="mail" size={20} color="black" />}
          text={t("loginButtons:email")}
          backgroundColor="white"
          textColor="black"
          style={tw`border border-[${colors.gray}]`}
          onPress={() => {
            navigation.navigate("MagicLink");
          }}
        />
      )} */}
    </View>
  );
};

export default AuthButtons;
