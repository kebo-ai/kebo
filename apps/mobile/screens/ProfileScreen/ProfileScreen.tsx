import React, { FC, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  SafeAreaView,
  ScrollView,
} from "react-native";
import tw from "twrnc";
import { Screen } from "@/components";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { BackBlackSvg } from "@/components/icons/BackBlackSvg";
import { supabase } from "@/config/supabase";
import { getUserInfo } from "@/utils/authUtils";
import { showToast } from "@/components/ui/CustomToast";
import { Text, Button } from "@/components/ui";
import { DocumentIconSvg } from "@/components/icons/DocumentIcon";
import { ChatHelpIconSvg } from "@/components/icons/ChatHelpIcon";
import { ChevronRightIconSvg } from "@/components/icons/ChevronRightIconSvg";
import DeleteAccountModal from "@/components/common/DeleteAccountModal";
import CustomCategoryModal from "@/components/common/CustomCategoryModal";
import { useStores } from "@/models/helpers/useStores";
import { translate } from "@/i18n";
import { updateUserProfile } from "@/services/UserService";
import logger from "@/utils/logger";
import { EXTERNAL_URLS } from "@/config/urls";
import { APP_VERSION } from "@/config/config.base";
import { useAnalytics } from "@/hooks/useAnalytics";
import {
  PROFILE_EVENTS,
  EVENT_PROPERTIES,
  ProfileEventName,
} from "@/services/AnalyticsService";
import { updateUserAnalyticsProperties } from "@/utils/analyticsUtils";
import { useNotifications } from "@/hooks/useNotifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { PencilSvg } from "@/components/icons/PencilSvg";
import { InstagramIconSvg } from "@/components/icons/InstagramIconSvg";
import { DiscordIconSvg } from "@/components/icons/DiscordIconSvg";
import { LanguageIconSvg } from "@/components/icons/LanguageIconSvg";
import { CurrenceIconSvg } from "@/components/icons/CurrenceIconSvg";
import { AccountsIconSvg } from "@/components/icons/AccountsIconSvg";
import { CategoryIconSvg } from "@/components/icons/CategoryIcon";
import { LanguageService } from "@/services/LanguageService";
import { CoinIconSvg } from "@/components/icons/CoinsSvg";
import { CategoriesIconSvg } from "@/components/icons/CategoriesIconSvg";
import { OpinionsIconSvg } from "@/components/icons/OpinionsIconSvg";
import { CommentsIconSvg } from "@/components/icons/CommentsIconSvg";

let DeviceInfo: any = null;
if (__DEV__) {
  try {
    DeviceInfo = require("react-native-device-info");
  } catch (error) {
    logger.debug("DeviceInfo not available", error);
  }
}

interface ProfileScreenProps {}

export const ProfileScreen: FC<ProfileScreenProps> = observer(
  function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const nameInputRef = useRef<TextInput>(null);
    const {
      uiStoreModel: { showLoader, hideLoader },
      categoryStoreModel: { expenseCategories, incomeCategories },
    } = useStores();
    const rootStore = useStores();
    const analytics = useAnalytics();
    const { permissionsGranted } = useNotifications();

    const trackProfileEvent = useCallback(
      (eventName: ProfileEventName, properties: Record<string, any> = {}) => {
        try {
          analytics.trackProfileEvent(eventName, properties);
        } catch (error) {
          logger.debug(`Analytics error in ${eventName}:`, error);
        }
      },
      [analytics]
    );

    // const trackButtonClick = useCallback(
    //   (
    //     eventName: ProfileEventName,
    //     section: string,
    //     interactionType: "button" | "link" = "button",
    //     externalUrl?: string
    //   ) => {
    //     try {
    //       analytics.trackProfileButtonClick(
    //         eventName,
    //         section,
    //         interactionType,
    //         externalUrl
    //       );
    //     } catch (error) {
    //       console.log(`Analytics error in ${eventName}:`, error);
    //     }
    //   },
    //   [analytics]
    // );

    useEffect(() => {
      analytics.trackProfileScreenView();
      analytics.trackScreen("Profile");
    }, [analytics]);

    const loadUserInfo = useCallback(async () => {
      const userInfo = await getUserInfo(rootStore);
      setUser(userInfo);
      const name =
        userInfo?.profile?.full_name ||
        userInfo?.user?.user_metadata?.full_name ||
        "";
      setTempName(name);
      setDisplayName(name);
    }, [rootStore]);

    useEffect(() => {
      loadUserInfo();
    }, [loadUserInfo]);

    useFocusEffect(
      useCallback(() => {
        loadUserInfo();
      }, [loadUserInfo])
    );

    useEffect(() => {
      if (user?.user?.id) {
        try {
          // updateUserAnalyticsProperties(analytics, {
          //   push_notifications_enabled: permissionsGranted,
          //   email_notifications_enabled:
          //     user?.profile?.email_notifications || false,
          // });

          trackProfileEvent(PROFILE_EVENTS.PROFILE_SCREEN_VIEWED, {
            [EVENT_PROPERTIES.ACTION_TYPE]: "view",
            [EVENT_PROPERTIES.PROFILE_SECTION]: "notifications",
            [EVENT_PROPERTIES.PUSH_NOTIFICATIONS_ENABLED]: permissionsGranted,
            [EVENT_PROPERTIES.EMAIL_NOTIFICATIONS_ENABLED]:
              user?.profile?.email_notifications || false,
          });

          // trackProfileEvent(PROFILE_EVENTS.NOTIFICATION_STATUS_CHECKED, {
          //   [EVENT_PROPERTIES.ACTION_TYPE]: "check",
          //   [EVENT_PROPERTIES.PROFILE_SECTION]: "notifications",
          //   [EVENT_PROPERTIES.PUSH_NOTIFICATIONS_ENABLED]: permissionsGranted,
          //   [EVENT_PROPERTIES.EMAIL_NOTIFICATIONS_ENABLED]:
          //     user?.profile?.email_notifications || false,
          // });

          logger.debug("Notification status captured:", {
            push_notifications_enabled: permissionsGranted,
            email_notifications_enabled:
              user?.profile?.email_notifications || false,
          });
        } catch (error) {
          logger.debug("Error capturing notification status:", error);
        }
      }
    }, [user, permissionsGranted, analytics, trackProfileEvent]);

    const handleLogout = useCallback(async () => {
      try {
        trackProfileEvent(PROFILE_EVENTS.LOGOUT_CLICKED, {
          [EVENT_PROPERTIES.ACTION_TYPE]: "click",
          [EVENT_PROPERTIES.PROFILE_SECTION]: "account_management",
        });

        await GoogleSignin.signOut();

        const { error } = await supabase.auth.signOut();
        if (error) {
          analytics.trackLogout(false, error);
          throw error;
        }

        await LanguageService.clearSelectedLanguage();

        analytics.trackLogout(true);
        analytics.reset();
      } catch (error) {
        logger.error(translate("profileScreen:errorLogOut"), error);
        analytics.trackLogout(false, error);
      }
    }, [analytics, trackProfileEvent]);

    const handleStartEditing = useCallback(() => {
      // trackProfileEvent(PROFILE_EVENTS.PROFILE_NAME_EDIT_STARTED, {
      //   [EVENT_PROPERTIES.ACTION_TYPE]: "edit",
      //   [EVENT_PROPERTIES.PROFILE_SECTION]: "personal_info",
      //   [EVENT_PROPERTIES.INTERACTION_TYPE]: "button",
      // });

      setIsEditingName(true);
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 500);
    }, [trackProfileEvent]);

    const handleSaveName = useCallback(async () => {
      if (!tempName.trim()) {
        showToast("error", translate("profileScreen:nameRequired"));
        return;
      }

      const oldName =
        user?.profile?.full_name || user?.user?.user_metadata?.full_name || "";
      const newName = tempName.trim();

      try {
        showLoader();
        setDisplayName(newName);
        setIsEditingName(false);

        const response = await updateUserProfile({
          full_name: newName,
        });

        if (response.success) {
          const userInfo = await getUserInfo(rootStore);
          setUser(userInfo);
          showToast("success", translate("profileScreen:nameUpdated"));

          try {
            updateUserAnalyticsProperties(analytics, {
              full_name: newName,
              email: userInfo?.user?.email,
            });
            // analytics.trackProfileNameEdit(oldName, newName, true);
          } catch (error) {
            logger.debug("Analytics error in handleSaveName success:", error);
          }
        } else {
          setDisplayName(oldName);
          setTempName(oldName);
          showToast("error", translate("profileScreen:errorUpdatingName"));

          try {
            // analytics.trackProfileNameEdit(oldName, newName, false);
          } catch (error) {
            logger.debug("Analytics error in handleSaveName failure:", error);
          }
        }
      } catch (error) {
        setDisplayName(oldName);
        setTempName(oldName);
        showToast("error", translate("profileScreen:errorUpdatingName"));

        try {
          // analytics.trackProfileNameEdit(oldName, newName, false);
        } catch (error) {
          logger.debug("Analytics error in handleSaveName catch:", error);
        }
      } finally {
        hideLoader();
      }
    }, [tempName, user, analytics, rootStore, showLoader, hideLoader]);

    const renderHeader = () => {
      return (
        <View style={tw`justify-between flex-row items-center`}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={tw`w-12 h-12 flex justify-center items-center shadow-md`}
          >
            <BackBlackSvg width={15} height={15} />
          </TouchableOpacity>

          <Text type="lg" weight="medium">
            {translate("profileScreen:profile")}
          </Text>
          <TouchableOpacity>
            <View style={tw`w-12 h-12`}></View>
          </TouchableOpacity>
        </View>
      );
    };

    const renderKeboPlan = () => {
      return (
        <View>
          <View
            style={tw`bg-[${colors.primary}]/10 rounded-t-2xl shadow-lg px-4`}
          >
            <View style={tw`p-4 my-1 flex-row justify-between items-center`}>
              <View>
                <Text type="xs" weight="medium" color={colors.primary}>
                  {translate("profileScreen:keboPlan")}
                </Text>
                <Text type="2xl" weight="medium">
                  {translate("profileScreen:kebo")}
                </Text>
                <Text type="2xl" weight="medium">
                  {translate("profileScreen:free")}
                </Text>
              </View>
              <View style={tw`flex-1 ml-6`}>
                <Text type="xs" weight="light" color="#110627">
                  {translate("profileScreen:keboBody")}
                </Text>
                <Text type="xs" weight="medium" color="#110627">
                  {translate("profileScreen:keboBody2")}
                </Text>
              </View>
            </View>
          </View>
          <View style={tw`bg-[#6934D2] rounded-b-2xl px-4`}>
            <View style={tw`p-4 my-1 flex-row justify-between items-center`}>
              <View>
                <Text type="xs" weight="medium" color={colors.white}>
                  {translate("profileScreen:keboPro")}
                </Text>
              </View>
              <TouchableOpacity
                style={tw`bg-white px-4 py-3 rounded-full`}
                onPress={() => {
                  // trackButtonClick(
                  //   PROFILE_EVENTS.KEBO_PRO_UPGRADE_CLICKED,
                  //   "subscription",
                  //   "button"
                  // );

                  showToast("warning", translate("alertMessage:comminSoon"));
                }}
              >
                <Text type="sm" weight="medium" color="#110627">
                  {translate("profileScreen:keboChange")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    };

    const options = [
      {
        id: 1,
        icon: <DocumentIconSvg />,
        text: translate("profileScreen:termsConditions"),
        onPress: () => {
          router.push({
            pathname: "/(authenticated)/webview",
            params: { url: EXTERNAL_URLS.TERMS_CONDITIONS, title: "Términos y Condiciones" },
          });
        },
      },
      {
        id: 2,
        icon: <ChatHelpIconSvg />,
        text: translate("profileScreen:help"),
        onPress: () => {
          Linking.openURL(EXTERNAL_URLS.WHATSAPP_SUPPORT);
        },
      },
      {
        id: 3,
        icon: <DocumentIconSvg />,
        text: translate("profileScreen:privacyPolicy"),
        onPress: () => {
          router.push({
            pathname: "/(authenticated)/webview",
            params: { url: EXTERNAL_URLS.PRIVACY_POLICY, title: "Políticas" },
          });
        },
      },
    ];

    const settingsOptions = [
      {
        id: 1,
        icon: <LanguageIconSvg />,
        text: translate("profileScreen:language"),
        onPress: () => {
          router.push("/(authenticated)/language");
        },
      },
      // {
      //   id: 2,
      //   icon: <CurrenceIconSvg />,
      //   text: translate("profileScreen:country"),
      //   onPress: () => {
      //     router.push("/(authenticated)/country");
      //   },
      // },
      {
        id: 3,
        icon: <CoinIconSvg />,
        text: translate("profileScreen:currency"),
        onPress: () => {
          router.push("/(authenticated)/country");
        },
      },
      {
        id: 4,
        icon: <AccountsIconSvg />,
        text: translate("accountScreen:myAccounts"),
        onPress: () => {
          router.push("/(authenticated)/accounts");
        },
      },
      {
        id: 5,
        icon: <CategoriesIconSvg />,
        text: translate("profileScreen:myCategories"),
        onPress: () => {
          handleOpenCategoryModal();
        },
      },
    ];

    const functionsOptions = [
      {
        id: 1,
        icon: <OpinionsIconSvg />,
        text: translate("profileScreen:comment"),
        onPress: () => {
          router.push({
            pathname: "/(authenticated)/webview",
            params: { url: EXTERNAL_URLS.FEATURE_REQUESTS, title: translate("profileScreen:comment") },
          });
        },
      },
    ];

    const communityOptions = [
      {
        id: 1,
        icon: <InstagramIconSvg />,
        text: translate("profileScreen:networks"),
        onPress: () => {
          Linking.openURL(EXTERNAL_URLS.INSTAGRAM);
        },
      },
      {
        id: 2,
        icon: <DiscordIconSvg />,
        text: translate("profileScreen:support"),
        onPress: () => {
          Linking.openURL(EXTERNAL_URLS.DISCORD_COMMUNITY);
        },
      },
      {
        id: 4,
        icon: <></>,
        text: translate("profileScreen:deleteAccount"),
        onPress: () => {
          setIsDeleteModalVisible(true);
        },
      },
    ];
    const handleDeleteModalClose = useCallback(() => {
      // trackProfileEvent(PROFILE_EVENTS.DELETE_ACCOUNT_CANCELLED, {
      //   [EVENT_PROPERTIES.ACTION_TYPE]: "cancel",
      //   [EVENT_PROPERTIES.PROFILE_SECTION]: "account_management",
      //   [EVENT_PROPERTIES.INTERACTION_TYPE]: "modal",
      // });

      setIsDeleteModalVisible(false);
    }, [trackProfileEvent]);

    const allCategories = useMemo(() => {
      return [...expenseCategories, ...incomeCategories];
    }, [expenseCategories, incomeCategories]);

    const categoryModalNavigation = useMemo(() => ({
      navigate: (route: string, params?: any) => {
        if (route === "NewCategoryScreen") {
          router.push({
            pathname: "/(authenticated)/new-category",
            params,
          });
        }
      },
    }), [router]);

    const handleOpenCategoryModal = useCallback(() => {
      setIsCategoryModalVisible(true);
    }, []);

    const handleCloseCategoryModal = useCallback(() => {
      setIsCategoryModalVisible(false);
    }, []);

    const handleSelectCategory = useCallback(
      (selected: any) => {
        handleCloseCategoryModal();
      },
      [handleCloseCategoryModal]
    );

    return (
      <>
        <SafeAreaView style={tw`flex-1 bg-[#FAFAFA]`}>
          <ScrollView
            contentContainerStyle={tw`px-4 pt-6 pb-24`}
            showsVerticalScrollIndicator={false}
          >
            <Screen
              safeAreaEdges={["top"]}
              statusBarStyle={"dark"}
              header={renderHeader()}
            >
              <View
                style={tw`flex-row items-start gap-4 border border-[#606A84]/15 bg-white rounded-3xl p-4`}
              >
                <View
                  style={[
                    tw`flex justify-center items-center shadow-lg w-16 h-16 rounded-full bg-[#EAE0FF] border-[3px] border-white`,
                    {
                      shadowColor: "#606A84",
                      shadowOffset: { width: 8, height: 14 },
                      shadowOpacity: 0.3,
                      shadowRadius: 27,
                    },
                  ]}
                >
                  <Image
                    source={
                      user?.profile?.avatar_url ||
                      user?.user?.user_metadata?.avatar_url
                        ? {
                            uri:
                              user?.profile?.avatar_url ||
                              user?.user?.user_metadata?.avatar_url,
                          }
                        : require("@/assets/icons/kebo-profile.png")
                    }
                    style={tw`w-full h-full rounded-full`}
                  />
                  {/* <TouchableOpacity
                  style={tw`absolute bottom-0 right-0 w-8 h-8 rounded-full flex justify-center items-center bg-[#6934D2]`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    showToast("warning", translate("alertMessage:comminSoon"));
                  }}
                >
                  <EditIconSvg />
                </TouchableOpacity> */}
                </View>
                <View style={tw`flex-1 justify-center self-center`}>
                  <Text weight="medium" color="#110627">
                    {displayName || translate("profileScreen:noName")}
                  </Text>
                  <Text type="xs" color="rgba(96, 106, 132, 0.5)">
                    {user?.profile?.email ||
                      user?.user?.email ||
                      translate("profileScreen:noMail")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(authenticated)/edit-profile")}
                  style={tw`justify-center items-center`}
                >
                  <PencilSvg />
                </TouchableOpacity>
              </View>

              <View style={tw`mt-6`}>
                <View style={tw`flex-row justify-between gap-2`}>
                  {options.map(({ id, icon, text, onPress }) => (
                    <TouchableOpacity
                      key={id}
                      style={tw`flex-1 flex-row items-center justify-center bg-[#606A84]/8 rounded-lg px-4 py-2 h-[33px]`}
                      activeOpacity={0.8}
                      onPress={onPress}
                    >
                      <View style={tw`items-start`}>{icon}</View>
                      <Text type="xs" weight="light" color="#110627" style={tw`ml-2 text-center`}>
                        {text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={tw`mt-6`}>
                <Text weight="medium">
                  {translate("profileScreen:settings")}
                </Text>
                <View style={tw`mt-4 px-4`}>
                  {settingsOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={tw`flex-row items-center justify-between py-3 border-b border-[#606A84]/10`}
                      onPress={option.onPress}
                    >
                      <View style={tw`flex-row items-center`}>
                        <View style={tw`mr-2.5`}>{option.icon}</View>
                        <Text weight="medium" color="#110627">
                          {option.text}
                        </Text>
                      </View>
                      <ChevronRightIconSvg />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={tw`mt-6`}>
                <Text weight="medium">
                  {translate("profileScreen:functions")}
                </Text>
                <View style={tw`mt-4 px-4`}>
                  {functionsOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={tw`flex-row items-center justify-between py-3 border-b border-[#606A84]/10`}
                      onPress={option.onPress}
                    >
                      <View style={tw`flex-row items-center`}>
                        <View style={tw`mr-2.5`}>{option.icon}</View>
                        <Text weight="medium" color="#110627">
                          {option.text}
                        </Text>
                      </View>
                      <ChevronRightIconSvg />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={tw`mt-6`}>
                <Text weight="medium">
                  {translate("profileScreen:community")}
                </Text>
                <View style={tw`mt-4 px-4`}>
                  {communityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={tw`flex-row items-center justify-between py-3 border-b border-[#606A84]/10`}
                      onPress={option.onPress}
                    >
                      <View style={tw`flex-row items-center`}>
                        <View style={tw`mr-2.5`}>{option.icon}</View>
                        <Text weight="medium" color="#110627">
                          {option.text}
                        </Text>
                      </View>
                      <ChevronRightIconSvg />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <DeleteAccountModal
                visible={isDeleteModalVisible}
                onClose={handleDeleteModalClose}
              />
              <CustomCategoryModal
                categories={allCategories}
                visible={isCategoryModalVisible}
                onClose={handleCloseCategoryModal}
                onSelect={handleSelectCategory}
                navigation={categoryModalNavigation}
                screenName="Profile"
                disableTouch={true}
              />
            </Screen>
          </ScrollView>
          <View style={tw`mt-7 px-4 mb-2`}>
            <Button
              variant="solid"
              color="primary"
              onPress={() => handleLogout()}
              title={translate("profileScreen:logOut")}
              radius="lg"
            />

            <Text type="xs" color={colors.textGray} style={tw`text-center my-2`}>
              {translate("profileScreen:version")} {APP_VERSION}
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }
);
