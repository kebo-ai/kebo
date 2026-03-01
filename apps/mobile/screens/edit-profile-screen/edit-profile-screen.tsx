import React, { FC, useState, useEffect, useRef, useCallback } from "react";
import { View, TouchableOpacity, Image, TextInput } from "react-native";
import tw from "twrnc";
import { Screen } from "@/components/screen";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { showToast } from "@/components/ui/custom-toast";
import { useStores } from "@/models/helpers/use-stores";
import { translate } from "@/i18n";
import { useProfile, useUpdateProfile } from "@/lib/api/hooks";
import { useAnalytics } from "@/hooks/use-analytics";
import CustomButton from "@/components/common/custom-button";
import CustomHeaderSecondary from "@/components/common/custom-header-secondary";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";

interface EditProfileScreenProps {}

export const EditProfileScreen: FC<EditProfileScreenProps> = observer(
  function EditProfileScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { data: profile } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const [tempName, setTempName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const nameInputRef = useRef<TextInput>(null);
    const {
      uiStoreModel: { showLoader, hideLoader },
    } = useStores();
    const analytics = useAnalytics();

    useEffect(() => {
      analytics.trackProfileScreenView();
      analytics.trackScreen("Profile");
    }, [analytics]);

    useEffect(() => {
      if (profile) {
        const name = profile.full_name || "";
        setTempName(name);
        setDisplayName(name);
      }
    }, [profile]);

    const handleSaveName = useCallback(async () => {
      if (!tempName.trim()) {
        showToast("error", translate("profileScreen:nameRequired"));
        return;
      }

      const oldName = profile?.full_name || "";
      const newName = tempName.trim();

      try {
        showLoader();
        setDisplayName(newName);

        await updateProfileMutation.mutateAsync({ full_name: newName });

        showToast("success", translate("profileScreen:nameUpdated"));
        router.back();
      } catch (error) {
        setDisplayName(oldName);
        setTempName(oldName);
        showToast("error", translate("profileScreen:errorUpdatingName"));
      } finally {
        hideLoader();
      }
    }, [tempName, profile, showLoader, hideLoader, updateProfileMutation, router]);

    return (
      <>
        <Screen
          safeAreaEdges={["top"]}
          preset="scroll"
          statusBarStyle={isDark ? "light" : "dark"}
          backgroundColor={theme.background}
        >
          <CustomHeaderSecondary
            title={translate("profileScreen:editProfile")}
            onPress={() => router.back()}
          />
          <View style={tw`px-4`}>
            <View style={tw`items-center`}>
              <View
                style={[
                  tw`flex justify-center items-center shadow-lg w-24 h-24 rounded-full mt-3.5 border-[3px]`,
                  {
                    backgroundColor: isDark ? "#2D1B69" : "#EAE0FF",
                    borderColor: theme.surface,
                    shadowColor: isDark ? "#000" : "#606A84",
                    shadowOffset: { width: 8, height: 14 },
                    shadowOpacity: 0.3,
                    shadowRadius: 27,
                  },
                ]}
              >
                <Image
                  source={
                    profile?.avatar_url
                      ? { uri: profile.avatar_url }
                      : require("../../assets/icons/kebo-profile.png")
                  }
                  style={tw`w-full h-full rounded-full`}
                />
              </View>
            </View>

            <View style={tw`mt-6`}>
              <View>
                <Text
                  style={tw`ml-3 mb-2 mt-2 text-sm`}
                  color={theme.textTertiary}
                >
                  {translate("profileScreen:name")}
                </Text>
                <View style={tw`flex-row items-center`}>
                  <TextInput
                    ref={nameInputRef}
                    style={[
                      tw`flex-1 rounded-lg p-4 text-base`,
                      {
                        borderWidth: 1,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                        fontFamily: "SFUIDisplayMedium",
                      },
                    ]}
                    value={tempName}
                    placeholder={translate("profileScreen:noName")}
                    placeholderTextColor={theme.textTertiary}
                    editable={true}
                    onChangeText={setTempName}
                  />
                </View>
              </View>

              <View style={tw`mt-6`}>
                <Text
                  style={tw`ml-3 mb-2 text-sm`}
                  color={theme.textTertiary}
                >
                  {translate("profileScreen:mail")}
                </Text>
                <TextInput
                  style={[
                    tw`rounded-lg p-4 text-base`,
                    {
                      borderWidth: 1,
                      borderColor: theme.border,
                      color: theme.textSecondary,
                      backgroundColor: isDark ? theme.surface : "#F0F0F080",
                      fontFamily: "SFUIDisplayMedium",
                    },
                  ]}
                  value={
                    profile?.email || translate("profileScreen:noMail")
                  }
                  editable={false}
                />
              </View>
            </View>
          </View>
        </Screen>
        <View style={[tw`mb-10`, { backgroundColor: theme.background }]}>
          <CustomButton
            title={translate("accountBalanceScreen:saveChanges")}
            onPress={handleSaveName}
            isEnabled={true}
            adaptToKeyboard={true}
          />
        </View>
      </>
    );
  }
);
