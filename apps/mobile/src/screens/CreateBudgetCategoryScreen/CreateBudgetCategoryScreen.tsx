import logger from "../../utils/logger";
import { observer } from "mobx-react-lite";
import React, {
  FC,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { AppStackScreenProps } from "../../navigators";
import { Screen } from "../../components/Screen";
import {
  View,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import tw from "../../utils/useTailwind";
import { translate } from "../../i18n";
import CustomHeaderSecondary from "../../components/custom/CustomHeaderSecondary";
import { CategoryItem } from "../../components/custom/CategoryItem";
import { showToast } from "../../components/ui/CustomToast";
import { InputAmount } from "../../components/InputAmount";
import { budgetService } from "../../services/BudgetService";
import { useStores } from "../../models";
import CustomButton from "../../components/custom/CustomButton";
import { colors } from "../../theme/colors";
import CustomBudgetCategoryModal from "../../components/custom/CustomBudgetCategoryModal";
import {
  currencyMap,
  useCurrencyFormatter,
} from "../../components/custom/CurrencyFormatter";
import { useFocusEffect } from "@react-navigation/native";
import { EditIconSvg } from "../../components/svg/EditIconSvg";
import { useAnalytics } from "../../hooks/useAnalytics";

interface CreateBudgetCategoryScreenProps
  extends AppStackScreenProps<"CreateBudgetCategory"> {}

export const CreateBudgetCategoryScreen: FC<CreateBudgetCategoryScreenProps> =
  observer(function CreateBudgetCategoryScreen({ navigation, route }) {
    const analytics = useAnalytics();
    const {
      budgetId,
      selectedCategory,
      isEditing,
      categoryId,
      amount: initialAmount,
    } = route.params;
    const [amount, setAmount] = useState("");
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [currentSelectedCategory, setCurrentSelectedCategory] =
      useState(selectedCategory);
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const { categoryStoreModel } = useStores();
    const inputRef = useRef<any>(null);
    const { region } = useCurrencyFormatter();

    useEffect(() => {
      const hideKeyboard = () => {
        Keyboard.dismiss();
      };

      hideKeyboard();

      return () => {
        hideKeyboard();
      };
    }, []);

    useEffect(() => {
      if (isEditing && initialAmount !== undefined && initialAmount !== null) {
        const amountStr = initialAmount.toString();
        setAmount(amountStr === "0" ? "" : amountStr);
      } else {
        setAmount("");
      }
    }, [isEditing, initialAmount]);

    useEffect(() => {
      if (showCategoryModal) {
        Keyboard.dismiss();
      }
    }, [showCategoryModal]);

    useFocusEffect(
      useCallback(() => {
        const timeout = setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 800); // Adjust if still failing

        return () => clearTimeout(timeout);
      }, [])
    );

    useEffect(() => {
      const getExistingCategories = async () => {
        if (budgetId) {
          try {
            const budgetData = await budgetService.getBudgetById(budgetId);
            if (budgetData && budgetData.budget_lines) {
              const categoryIds = budgetData.budget_lines.map(
                (line: any) => line.category_id
              );
              setExistingCategories(categoryIds);
            }
          } catch (error) {
            logger.error("Error getting exirsting categories:", error);
          }
        }
      };

      getExistingCategories();
    }, [budgetId]);

    const handleAmountChange = (value: string) => {
      setAmount(value);
    };

    const handleCategorySelect = (category: any) => {
      setCurrentSelectedCategory(category);
      setShowCategoryModal(false);
      Keyboard.dismiss();
    };

    const filteredCategories = useMemo(() => {
      if (isEditing) {
        return categoryStoreModel.categories.filter(
          (cat) => !existingCategories.includes(cat.id) || cat.id === categoryId
        );
      }
      return categoryStoreModel.categories.filter(
        (cat) => !existingCategories.includes(cat.id)
      );
    }, [
      categoryStoreModel.categories,
      existingCategories,
      isEditing,
      categoryId,
    ]);

    const handleSave = async () => {
      const numericAmount = parseFloat(amount);
      if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
        showToast(
          "error",
          translate("createBudgetCategoryScreen:amountRequired")
        );
        return;
      }

      try {
        let success;

        if (isEditing && categoryId) {
          if (currentSelectedCategory.id !== categoryId) {
            success = await budgetService.changeBudgetCategory(
              budgetId,
              categoryId,
              currentSelectedCategory.id,
              numericAmount
            );
          } else {
            success = await budgetService.updateBudgetCategory(
              budgetId,
              categoryId,
              numericAmount
            );
          }
        } else {
          success = await budgetService.addBudgetCategory(
            budgetId,
            currentSelectedCategory.id,
            numericAmount
          );
        }

        if (success) {
          showToast(
            "success",
            isEditing
              ? translate("createBudgetCategoryScreen:categoryUpdated")
              : translate("createBudgetCategoryScreen:categoryAdded")
          );
          if (isEditing) {
            navigation.navigate("Budget", {
              budgetId: budgetId,
              categoryId: currentSelectedCategory.id,
            });
          } else {
            navigation.goBack();
          }
        } else {
          showToast(
            "error",
            isEditing
              ? translate("createBudgetCategoryScreen:errorUpdatingCategory")
              : translate("createBudgetCategoryScreen:errorAddingCategory")
          );
        }
      } catch (error) {
        logger.error("Error saving budget category:", error);
        showToast(
          "error",
          isEditing
            ? translate("createBudgetCategoryScreen:errorUpdatingCategory")
            : translate("createBudgetCategoryScreen:errorAddingCategory")
        );
      }
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#FAFAFA" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Screen
          safeAreaEdges={["top"]}
          preset="scroll"
          backgroundColor="#FAFAFA"
          statusBarBackgroundColor="#FAFAFA"
          header={
            <CustomHeaderSecondary
              title={
                isEditing
                  ? translate("newBudgetScreen:editBudget")
                  : translate("createBudgetCategoryScreen:title")
              }
              onPress={() => navigation.goBack()}
            />
          }
        >
          <View style={tw`px-6 flex-1`}>
            <View style={tw`mt-4`}>
              <InputAmount
                ref={inputRef}
                value={amount}
                onChange={handleAmountChange}
                showSymbol={true}
                currency={currencyMap[region] || "USD"}
                inputAccessoryViewID="inputAccessoryViewID"
              />
            </View>
            <View style={tw`mt-6`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text
                  style={[
                    tw`text-black text-base`,
                    { fontFamily: "SFUIDisplayMedium" },
                  ]}
                >
                  {translate("createBudgetCategoryScreen:selectedCategory")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCategoryModal(true);
                    Keyboard.dismiss();
                  }}
                  style={tw`flex-row items-center`}
                >
                  <EditIconSvg width={16} height={16} color={colors.primary} />
                  <Text
                    style={[
                      tw`ml-1 text-sm`,
                      {
                        color: colors.primary,
                        fontFamily: "SFUIDisplayMedium",
                      },
                    ]}
                  >
                    {translate("components:categoryModal.edit")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={tw`bg-white p-4 rounded-[20px] border border-[#E3E3E5]`}
              >
                <CategoryItem
                  item={currentSelectedCategory}
                  onSelect={() => {}}
                  showActions={false}
                  setShowActions={() => {}}
                  screenName="CreateBudgetCategory"
                />
              </View>
            </View>
          </View>
        </Screen>
        <CustomButton
          title={
            isEditing
              ? translate("budgetScreen:save")
              : translate("createBudgetCategoryScreen:title")
          }
          onPress={handleSave}
          isEnabled={!!amount && !!currentSelectedCategory}
          variant="primary"
          adaptToKeyboard={true}
          enableAnalytics={true}
          analyticsEvent="create_budget_category_save_button_clicked"
          analyticsProperties={{
            screen_name: "CreateBudgetCategoryScreen",
            action_type: "click",
            interaction_type: "button",
          }}
        />
        <CustomBudgetCategoryModal
          visible={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            Keyboard.dismiss();
          }}
          onSelect={handleCategorySelect}
          navigation={navigation}
          categories={filteredCategories}
          screenName="CreateBudgetCategory"
          hideActions={false}
        />
      </KeyboardAvoidingView>
    );
  });
