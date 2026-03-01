import React, { FC, useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import tw from "twrnc";
import { Screen } from "@/components/screen";
import { useRouter } from "expo-router";
import { observer } from "mobx-react-lite";
import { colors } from "@/theme/colors";
import { BackBlackSvg } from "@/components/icons/back-black-svg";
import { EditIconSvg } from "@/components/icons/edit-icon-svg";
import { showToast } from "@/components/ui/custom-toast";
import { useStores } from "@/models/helpers/use-stores";
import { translate } from "@/i18n";
import { useProfile, useUpdateProfile } from "@/lib/api/hooks";
import { useAnalytics } from "@/hooks/use-analytics";
import CustomButton from "@/components/common/custom-button";
import CustomHeader from "@/components/common/custom-header";
import CustomHeaderSecondary from "@/components/common/custom-header-secondary";

interface EditProfileScreenProps {}

export const EditProfileScreen: FC<EditProfileScreenProps> = observer(
  function EditProfileScreen() {
    const router = useRouter();
    const { data: profile } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const [isEditingName, setIsEditingName] = useState(false);
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
        setIsEditingName(false);

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

    const renderInput = () => {
      return (
        <View style={tw`mt-6`}>
          <View style={tw``}>
            <Text
              style={tw`ml-3 mb-2 mt-2 text-sm text-[rgba(96,106,132,0.3)]`}
            >
              {translate("profileScreen:name")}
            </Text>
            <View style={tw`flex-row items-center`}>
              <TextInput
                ref={nameInputRef}
                style={tw`flex-1 border border-[#606A84]/15 rounded-lg p-4 text-[#110627] text-base font-medium`}
                value={tempName || translate("profileScreen:noName")}
                editable={true}
                onChangeText={setTempName}
              />
            </View>
          </View>

          <View style={tw`mt-6`}>
            <Text style={tw`ml-3 mb-2 text-sm text-[rgba(96,106,132,0.3)]`}>
              {translate("profileScreen:mail")}
            </Text>
            <TextInput
              style={tw`border border-[#606A84]/15 rounded-lg p-4 text-[#606A84]/50 text-base font-medium bg-[#F0F0F0]/50`}
              value={
                profile?.email || translate("profileScreen:noMail")
              }
              editable={false}
            />
          </View>
        </View>
      );
    };

    return (
      <>
        <Screen
          safeAreaEdges={["top"]}
          preset="scroll"
          statusBarStyle={"dark"}
          backgroundColor="white"
        >
          <CustomHeaderSecondary
            title={translate("profileScreen:editProfile")}
            onPress={() => router.back()}
          />
          <View style={tw`px-4`}>
            <View style={tw`items-center`}>
              <View
                style={[
                  tw`flex justify-center items-center shadow-lg w-24 h-24 rounded-full bg-[#EAE0FF] mt-3.5 border-[3px] border-white`,
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
                    profile?.avatar_url
                      ? { uri: profile.avatar_url }
                      : require("../../assets/icons/kebo-profile.png")
                  }
                  style={tw`w-full h-full rounded-full`}
                />
                {/* <TouchableOpacity
                  style={tw`absolute bottom-0 right-0 w-8 h-8 rounded-full flex justify-center items-center bg-[#6934D2]`}
                  onPress={() => {
                    showToast("warning", translate("alertMessage:comminSoon"));
                  }}
                >
                  <EditIconSvg />
                </TouchableOpacity> */}
              </View>
            </View>
            {renderInput()}
          </View>
        </Screen>
        <View style={tw`mb-10`}>
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
