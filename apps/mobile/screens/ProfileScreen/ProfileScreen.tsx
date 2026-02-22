import React, { FC, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useFocusEffect, useRouter, Stack } from "expo-router";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  ScrollView,
  RefreshControl,
  Share,
} from "react-native";
import tw from "twrnc";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { largeTitleHeader } from "@/theme/header-options";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/config/supabase";
import { getUserInfo } from "@/utils/auth-utils";
import { showToast } from "@/components/ui/custom-toast";
import { Text, Button, Icon } from "@/components/ui";
import DeleteAccountModal from "@/components/common/DeleteAccountModal";
import CustomCategoryModal from "@/components/common/CustomCategoryModal";
import { useStores } from "@/models/helpers/use-stores";
import { translate } from "@/i18n";
import { updateUserProfile } from "@/services/user-service";
import logger from "@/utils/logger";
import { EXTERNAL_URLS } from "@/config/urls";
import { APP_VERSION } from "@/config/config.base";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  PROFILE_EVENTS,
  EVENT_PROPERTIES,
  ProfileEventName,
} from "@/services/analytics-service";
import { updateUserAnalyticsProperties } from "@/utils/analytics-utils";
import { useNotifications } from "@/hooks/use-notifications";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { PencilSvg } from "@/components/icons/pencil-svg";
import { LanguageService } from "@/services/language-service";
import * as StoreReview from "expo-store-review";

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
    const { theme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [refreshing, setRefreshing] = useState(false);
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
          trackProfileEvent(PROFILE_EVENTS.PROFILE_SCREEN_VIEWED, {
            [EVENT_PROPERTIES.ACTION_TYPE]: "view",
            [EVENT_PROPERTIES.PROFILE_SECTION]: "notifications",
            [EVENT_PROPERTIES.PUSH_NOTIFICATIONS_ENABLED]: permissionsGranted,
            [EVENT_PROPERTIES.EMAIL_NOTIFICATIONS_ENABLED]:
              user?.profile?.email_notifications || false,
          });

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

        try {
          await GoogleSignin.revokeAccess();
        } catch {
          // Ignore — user may have signed in with Apple
        }
        await GoogleSignin.signOut();

        const { error } = await supabase.auth.signOut({ scope: "global" });
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
          } catch (error) {
            logger.debug("Analytics error in handleSaveName success:", error);
          }
        } else {
          setDisplayName(oldName);
          setTempName(oldName);
          showToast("error", translate("profileScreen:errorUpdatingName"));
        }
      } catch (error) {
        setDisplayName(oldName);
        setTempName(oldName);
        showToast("error", translate("profileScreen:errorUpdatingName"));
      } finally {
        hideLoader();
      }
    }, [tempName, user, analytics, rootStore, showLoader, hideLoader]);

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await loadUserInfo();
      setRefreshing(false);
    }, [loadUserInfo]);

    const handleDeleteModalClose = useCallback(() => {
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

    const sections = useMemo(() => [
      {
        title: translate("profileScreen:settings"),
        rows: [
          { symbol: "globe", label: translate("profileScreen:language"), onPress: () => router.push("/(authenticated)/language") },
          { symbol: "dollarsign.circle", label: translate("profileScreen:currency"), onPress: () => router.push("/(authenticated)/country") },
          { symbol: "textformat.123", label: translate("profileScreen:numberFormat"), onPress: () => router.push("/(authenticated)/number-format") },
          { symbol: "building.columns", label: translate("accountScreen:myAccounts"), onPress: () => router.push("/(authenticated)/accounts") },
          { symbol: "tag", label: translate("profileScreen:myCategories"), onPress: handleOpenCategoryModal },
        ],
      },
      {
        title: translate("profileScreen:enjoyingApp"),
        rows: [
          { symbol: "star", label: translate("profileScreen:rateUs"), onPress: () => StoreReview.requestReview() },
          { symbol: "square.and.arrow.up", label: translate("profileScreen:shareWithFriends"), onPress: () => Share.share({ message: translate("profileScreen:shareMessage") }) },
        ],
      },
      {
        title: translate("profileScreen:getInTouch"),
        rows: [
          { symbol: "message", label: translate("profileScreen:help"), onPress: () => Linking.openURL(EXTERNAL_URLS.WHATSAPP_SUPPORT) },
          { symbol: "lightbulb", label: translate("profileScreen:featureRequests"), onPress: () => router.push({ pathname: "/(authenticated)/webview", params: { url: EXTERNAL_URLS.FEATURE_REQUESTS, title: translate("profileScreen:featureRequests") } }) },
        ],
      },
      {
        title: translate("profileScreen:followUs"),
        rows: [
          { symbol: "camera", label: translate("profileScreen:instagram"), onPress: () => Linking.openURL(EXTERNAL_URLS.INSTAGRAM) },
          { symbol: "person.3", label: translate("profileScreen:discord"), onPress: () => Linking.openURL(EXTERNAL_URLS.DISCORD_COMMUNITY) },
        ],
      },
      {
        title: translate("profileScreen:legal"),
        rows: [
          { symbol: "doc.text", label: translate("profileScreen:termsConditions"), onPress: () => router.push({ pathname: "/(authenticated)/webview", params: { url: EXTERNAL_URLS.TERMS_CONDITIONS, title: translate("profileScreen:termsConditions") } }) },
          { symbol: "lock.shield", label: translate("profileScreen:privacyPolicy"), onPress: () => router.push({ pathname: "/(authenticated)/webview", params: { url: EXTERNAL_URLS.PRIVACY_POLICY, title: translate("profileScreen:privacyPolicy") } }) },
        ],
      },
    ], [router, handleOpenCategoryModal]);

    return (
      <>
        <Stack.Screen
          options={{
            ...largeTitleHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: translate("profileScreen:profile"),
            contentStyle: { backgroundColor: theme.background },
          }}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={tw`px-4 pt-4 pb-24`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Account Card */}
          <View
            style={tw`flex-row items-center bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 border border-[#EBEBEF] dark:border-[#3A3A3C] mb-6`}
          >
            <View
              style={[
                tw`w-16 h-16 rounded-full bg-[#EAE0FF] border-[3px] border-white overflow-hidden`,
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
                style={tw`w-full h-full`}
              />
            </View>
            <View style={tw`flex-1 ml-4`}>
              <Text weight="medium" color={theme.textPrimary}>
                {displayName || translate("profileScreen:noName")}
              </Text>
              <Text type="xs" color={theme.textTertiary}>
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

          {/* Your Plan */}
          <Text
            type="xs"
            weight="semibold"
            color={theme.textSecondary}
            style={tw`uppercase tracking-wide px-1 mb-2`}
          >
            {translate("profileScreen:keboPlan")}
          </Text>
          <View style={tw`mb-6`}>
            <View
              style={tw`bg-[${colors.primary}]/10 rounded-t-2xl px-4`}
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
                  <Text type="xs" weight="light" color={theme.textPrimary}>
                    {translate("profileScreen:keboBody")}
                  </Text>
                  <Text type="xs" weight="medium" color={theme.textPrimary}>
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

          {/* Data-driven sections */}
          {sections.map((section) => (
            <View key={section.title}>
              <Text
                type="xs"
                weight="semibold"
                color="#606A84"
                style={tw`uppercase tracking-wide px-1 mb-2`}
              >
                {section.title}
              </Text>
              <View
                style={tw`bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[#EBEBEF] dark:border-[#3A3A3C] mb-6`}
              >
                {section.rows.map((row, index) => (
                  <TouchableOpacity
                    key={row.label}
                    style={tw`flex-row items-center px-4 py-3.5 ${
                      index < section.rows.length - 1
                        ? "border-b border-[#EBEBEF] dark:border-[#3A3A3C]"
                        : ""
                    }`}
                    onPress={row.onPress}
                  >
                    <Icon symbol={row.symbol} size={18} color={colors.primary} />
                    <Text
                      weight="medium"
                      color={theme.textPrimary}
                      style={tw`flex-1 ml-3`}
                    >
                      {row.label}
                    </Text>
                    <Icon symbol="chevron.right" size={14} color={theme.chevron} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Danger Zone */}
          <Text
            type="xs"
            weight="semibold"
            color={theme.textSecondary}
            style={tw`uppercase tracking-wide px-1 mb-2`}
          >
            {translate("profileScreen:dangerZone")}
          </Text>
          <View
            style={tw`bg-white dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-[#EBEBEF] dark:border-[#3A3A3C] mb-6`}
          >
            <TouchableOpacity
              style={tw`flex-row items-center px-4 py-3.5`}
              onPress={() => setIsDeleteModalVisible(true)}
            >
              <Icon symbol="trash" size={18} color="#EF4444" />
              <Text weight="medium" color="#EF4444" style={tw`flex-1 ml-3`}>
                {translate("profileScreen:deleteAccount")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <Button
            variant="solid"
            color="primary"
            onPress={handleLogout}
            title={translate("profileScreen:logOut")}
            radius="lg"
          />

          {/* Version */}
          <Text type="xs" color={colors.textGray} style={tw`text-center my-4`}>
            {translate("profileScreen:version")} {APP_VERSION}
          </Text>
        </ScrollView>

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
      </>
    );
  }
);
