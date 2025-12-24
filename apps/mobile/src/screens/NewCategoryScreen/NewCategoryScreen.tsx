import logger from "../utils/logger";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Image,
} from "react-native";
import tw from "twrnc";
import { colors } from "../../theme/colors";
import { AppStackScreenProps } from "../../navigators/AppNavigator";
import { translate } from "../../i18n";
import { Screen } from "../../components/Screen";
import CustomHeader from "../../components/custom/CustomHeader";
import CustomIconModal from "../../components/custom/CustomIconModal";
import { useStores } from "../../models/helpers/useStores";
import { IconModel } from "../../models/icon/icon";
import CustomButton from "../../components/custom/CustomButton";
import {
  createCategoryUser,
  updateCategoryService,
  getIconSuggestions,
} from "../../services/CategoryService";
import { ArrowDownIconSvg } from "../../components/svg/ArrowDownIcon";
import { showToast } from "../../components/ui/CustomToast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Instance } from "mobx-state-tree";
import { EditIconSvg } from "../../components/svg/EditIconSvg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmojiKeyboard, { EmojiType } from "rn-emoji-keyboard";
import { KeboIconSvg } from "../../components/svg/KeboIconSvg";
import { SvgUri } from "react-native-svg";

interface CategoryFormValues {
  name: string;
  icon_url: string;
  type: "Income" | "Expense" | "Transfer" | "Investment" | "Other";
}

interface NewCategoryScreenParams {
  isEditing?: boolean;
  isNew?: boolean;
  categoryData?: {
    id: string;
    name: string;
    icon_url: string;
    type: "Income" | "Expense" | "Transfer" | "Investment" | "Other";
  };
  previousScreen?: string;
}

export const NewCategoryScreen: React.FC<
  AppStackScreenProps<"NewCategoryScreen">
> = ({ navigation, route }) => {
  const [isCategoryIconVisible, setCategoryIconVisible] =
    useState<boolean>(false);
  const [selectedIcon, setSelectedIcon] = useState<Instance<
    typeof IconModel
  > | null>(null);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [suggestedIcons, setSuggestedIcons] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(0);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);

  const params = route.params as NewCategoryScreenParams;
  const insets = useSafeAreaInsets();

  const handleEmojiSelect = (emoji: string) => {
    if (emoji && !emoji.startsWith("/storage/")) {
      formik.setFieldValue("icon_url", emoji);
    } else {
      formik.setFieldValue("icon_url", "kebo_icon");
    }
    setIsEmojiPickerVisible(false);
  };

  const {
    categoryStoreModel: { getIcons, getCategories, icons, createCategory },
    transactionModel,
  } = useStores();

  const formik = useFormik<CategoryFormValues>({
    initialValues: {
      name: "",
      icon_url: "kebo_icon",
      type: transactionModel.transaction_type as CategoryFormValues["type"],
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().required(
        translate("components:newCategory.formikName")
      ),
      icon_url: Yup.string()
        .required(translate("components:newCategory.formikIcon"))
        .test(
          "is-valid-icon",
          "Debe ser un emoji válido o un icono del sistema",
          (value) => {
            if (!value) return false;
            if (value === "kebo_icon") return true;
            if (value.startsWith("/storage/")) return true;
            return /^[\p{Emoji}\u{200D}\u{FE0F}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+$/u.test(
              value
            );
          }
        ),
      type: Yup.string().required(
        translate("components:newCategory.formikType")
      ),
    }),

    onSubmit: async (values) => {
      try {
        let categoryId;

        if (params?.isEditing) {
          await updateCategoryService(params?.categoryData?.id || "", {
            name: values.name,
            icon_url: values.icon_url,
            type: values.type,
          });
          categoryId = params?.categoryData?.id;
        } else {
          Keyboard.dismiss();
          const category = await createCategory({
            type: values.type,
            name: values.name,
            icon_url: values.icon_url,
          });

          categoryId = category.id;
          showToast(
            "success",
            translate("components:newCategory.categorySuccess")
          );
        }

        getCategories();
        transactionModel.setSelectedCategory({
          id: categoryId || "",
          name: values.name,
          icon_url: values.icon_url,
        });

        const previousScreen = params?.previousScreen;

        if (previousScreen === "EditTransaction") {
          navigation.goBack();
        } else if (previousScreen === "CreateBudgetCategory") {
          navigation.goBack();
        } else if (previousScreen === "Budget") {
          navigation.goBack();
        } else {
          navigation.navigate("Transaction", {
            transactionType: transactionModel.transaction_type as
              | "Income"
              | "Expense"
              | "Transfer",
            fromCategoryScreen: true,
          });
        }
      } catch (error) {
        showToast("error", translate("components:newCategory.errorCategory"));
      }
    },
  });

  useEffect(() => {
    const initializeForm = async () => {
      await getIcons();

      setSuggestedIcons([]);
      setSelectedSuggestionIndex(0);

      if (params?.isNew) {
        formik.resetForm({
          values: {
            name: "",
            icon_url: "kebo_icon",
            type: transactionModel.transaction_type as CategoryFormValues["type"],
          },
        });
      } else if (params?.isEditing && params?.categoryData) {
        const iconUrl = params.categoryData.icon_url;
        const foundIcon = icons.find((icon) => icon.url === iconUrl);

        if (foundIcon) {
          setSelectedIcon(foundIcon);
        }

        formik.resetForm({
          values: {
            name: params.categoryData.name || "",
            icon_url: params.categoryData.icon_url || "kebo_icon",
            type:
              params.categoryData.type ||
              (transactionModel.transaction_type as CategoryFormValues["type"]),
          },
        });
      } else {
        setSelectedIcon(null);
        formik.resetForm({
          values: {
            name: "",
            icon_url: "kebo_icon",
            type: transactionModel.transaction_type as CategoryFormValues["type"],
          },
        });
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    initializeForm();
  }, [route.params]);

  const handleIconSelect = (icon: Instance<typeof IconModel>) => {
    setSelectedIcon(icon);
    formik.setFieldValue("icon_url", icon.url);
    setCategoryIconVisible(false);
  };

  const handleNameChange = async (text: string) => {
    formik.setFieldValue("name", text);

    if (!text.trim()) {
      setSuggestedIcons([]);
      setSelectedSuggestionIndex(0);
      formik.setFieldValue("icon_url", "kebo_icon");
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const suggestions = await getIconSuggestions(text);

        if (suggestions && suggestions.length > 0) {
          setSuggestedIcons(suggestions);
          formik.setFieldValue("icon_url", suggestions[0]);
          setSelectedSuggestionIndex(0);
        } else {
          setSuggestedIcons([]);
          setSelectedSuggestionIndex(0);
          formik.setFieldValue("icon_url", "kebo_icon");
        }
      } catch (error) {
        setSuggestedIcons([]);
        setSelectedSuggestionIndex(0);
        formik.setFieldValue("icon_url", "kebo_icon");
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };

  const handleSuggestionSelect = (index: number) => {
    setSelectedSuggestionIndex(index);
    formik.setFieldValue("icon_url", suggestedIcons[index]);
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 2}
      >
        <Screen
          safeAreaEdges={["top", "bottom"]}
          preset="scroll"
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor={colors.primary}
          header={
            <CustomHeader
              onPress={() => navigation.goBack()}
              title={
                params?.isEditing
                  ? translate("components:newCategory.editCategory")
                  : translate("components:header.addCategory")
              }
            />
          }
        >
          <View style={tw`flex-1 px-6 py-3 justify-center`}>
            <View style={tw`items-center`}>
              <Text
                style={[
                  tw`mt-6 text-base text-center text-[#110627]`,
                  { fontFamily: "SFUIDisplaySemiBold" },
                ]}
              >
                {params?.isEditing
                  ? translate("components:newCategory.editCategory")
                  : translate("components:newCategory.title")}
              </Text>

              {/* Sugerencias de iconos */}
              {isLoadingSuggestions && formik.values.name.trim() && (
                <View style={tw`mt-4`}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}

              {suggestedIcons.length > 0 &&
                !isLoadingSuggestions &&
                formik.values.name.trim() && (
                  <View style={tw`mt-4 flex-row justify-center items-center`}>
                    {suggestedIcons.map((icon, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          tw`mx-2 border border-[#6934D226] w-[35px] h-[35px] rounded-xl items-center justify-center`,
                          selectedSuggestionIndex === index &&
                            tw`border-2 border-[${colors.primary}]`,
                        ]}
                        onPress={() => handleSuggestionSelect(index)}
                      >
                        <Text style={tw`text-lg`}>{icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

              <View style={tw`items-center w-full mt-4`}>
                <View style={tw`items-center`}>
                  <View
                    style={tw`bg-[#6934D226] w-[76px] h-[76px] rounded-3xl items-center justify-center`}
                  >
                    {(() => {
                      logger.debug("Current icon_url:", formik.values.icon_url);
                      if (formik.values.icon_url === "kebo_icon") {
                        return <KeboIconSvg width={50} height={50} />;
                      } else if (
                        formik.values.icon_url &&
                        formik.values.icon_url.startsWith("/storage/")
                      ) {
                        return (
                          <SvgUri
                            width={50}
                            height={50}
                            uri={
                              selectedIcon
                                ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}${selectedIcon.url}`
                                : params?.categoryData?.icon_url
                                ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}${params.categoryData.icon_url}`
                                : ""
                            }
                          />
                        );
                      } else if (formik.values.icon_url) {
                        return (
                          <Text style={tw`text-3xl`}>
                            {formik.values.icon_url}
                          </Text>
                        );
                      }
                      return <KeboIconSvg width={50} height={50} />;
                    })()}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setIsEmojiPickerVisible(true);
                    }}
                    style={tw`absolute bottom-[-10px] right-[-10px] bg-[${colors.primary}] w-8 h-8 rounded-full items-center justify-center border-2 border-white`}
                  >
                    <EditIconSvg />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={tw`flex-col w-[80%] mt-6`}>
                <TextInput
                  ref={inputRef}
                  style={[
                    tw`h-[50px] flex-1 text-base  bg-[${colors.white}] text-[#606A84] border border-[#606A84]/15 px-4 rounded-2xl`,
                    { fontFamily: "SFUIDisplaySemiBold" },
                  ]}
                  placeholderTextColor="rgba(96,106,132,0.3)"
                  placeholder={translate("components:newCategory.nameCategory")}
                  value={formik.values.name}
                  onChangeText={handleNameChange}
                  onBlur={formik.handleBlur("name")}
                  autoCorrect={false}
                  autoCapitalize="none"
                  spellCheck={false}
                  textContentType="none"
                />
              </View>
              {formik.touched.name && formik.errors.name && (
                <Text style={tw`text-red-500 mt-1`}>{formik.errors.name}</Text>
              )}
            </View>

            <CustomIconModal
              icons={icons}
              showLabel={false}
              visible={isCategoryIconVisible}
              onClose={() => setCategoryIconVisible(false)}
              onSelect={(icon: any) => handleIconSelect(icon)}
              navigation={navigation}
            />
          </View>
        </Screen>
        <CustomButton
          variant="primary"
          isEnabled={
            formik.isValid &&
            formik.values.name !== "" &&
            formik.values.icon_url !== ""
          }
          onPress={() => formik.handleSubmit()}
          title={
            params?.isEditing
              ? translate("components:newCategory.saveChanges")
              : translate("components:newCategory.continue")
          }
          adaptToKeyboard={true}
        />
      </KeyboardAvoidingView>
      <EmojiKeyboard
        onEmojiSelected={(emoji: EmojiType) => handleEmojiSelect(emoji.emoji)}
        open={isEmojiPickerVisible}
        onClose={() => {
          logger.debug("Closing emoji picker");
          setIsEmojiPickerVisible(false);
        }}
        allowMultipleSelections={false}
        theme={{
          backdrop: "rgba(0, 0, 0, 0.25)",
          container: colors.white,
          header: "transparent",
          category: {
            icon: colors.primary,
            iconActive: colors.white,
            container: colors.white,
            containerActive: colors.primary,
          },
          emoji: {
            selected: colors.primary,
          },
        }}
      />
    </>
  );
};
