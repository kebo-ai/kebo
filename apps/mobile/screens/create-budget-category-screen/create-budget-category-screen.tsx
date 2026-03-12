import logger from "@/utils/logger";
import { observer } from "mobx-react-lite";
import React, {
  FC,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  View,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "@/hooks/use-tailwind";
import { translate } from "@/i18n";
import { showToast } from "@/components/ui/custom-toast";
import { standardHeader } from "@/theme/header-options";
import { budgetService } from "@/services/budget-service";
import { useCategories } from "@/lib/api/hooks";
import { colors } from "@/theme/colors";
import { useTheme } from "@/hooks/use-theme";
import { useNumberEntry } from "@/hooks/use-number-entry";
import { useShakeAnimation } from "@/hooks/use-shake-animation";
import { AmountDisplay } from "@/components/transaction/amount-display";
import { NumberPad } from "@/components/transaction/number-pad";
import { useCurrencyFormatter } from "@/components/common/currency-formatter";
import CustomBudgetCategoryModal from "@/components/common/custom-budget-category-modal";
import { EditIconSvg } from "@/components/icons/edit-icon-svg";
import { translateCategoryName } from "@/utils/category-translations";
import { SvgUri } from "react-native-svg";
import { useAnalytics } from "@/hooks/use-analytics";

interface CreateBudgetCategoryScreenProps {}

export const CreateBudgetCategoryScreen: FC<CreateBudgetCategoryScreenProps> =
  observer(function CreateBudgetCategoryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
      budgetId: string;
      selectedCategory?: string;
      isEditing?: string;
      categoryId?: string;
      amount?: string;
    }>();

    const budgetId = params.budgetId;
    let selectedCategory;
    try {
      selectedCategory = params.selectedCategory
        ? JSON.parse(params.selectedCategory)
        : undefined;
    } catch (e) {
      selectedCategory = undefined;
    }
    const isEditing = params.isEditing === "true";
    const categoryId = params.categoryId;
    const initialAmount = params.amount ? parseFloat(params.amount) : undefined;

    const analytics = useAnalytics();
    const { theme } = useTheme();
    const { decimalSeparator } = useCurrencyFormatter();
    const insets = useSafeAreaInsets();
    const numberEntry = useNumberEntry(2);
    const amountShake = useShakeAnimation();
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [currentSelectedCategory, setCurrentSelectedCategory] =
      useState(selectedCategory);
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const { data: allCategories = [] } = useCategories();

    // Navigation adapter for components that still expect navigation prop
    const navigationAdapter = useMemo(
      () => ({
        navigate: (route: string, navParams?: any) => {
          if (route === "NewCategoryScreen") {
            router.push({
              pathname: "/(authenticated)/new-category",
              params: navParams
                ? {
                    ...navParams,
                    categoryData: navParams.categoryData
                      ? JSON.stringify(navParams.categoryData)
                      : undefined,
                  }
                : undefined,
            });
          } else {
            router.navigate(route as any);
          }
        },
        goBack: () => router.back(),
      }),
      [router]
    );

    // Load existing amount when editing
    useEffect(() => {
      if (isEditing && initialAmount !== undefined && initialAmount > 0) {
        const cents = Math.round(initialAmount * 100);
        numberEntry.setFromCents(cents);
      }
    }, [isEditing, initialAmount]);

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
            logger.error("Error getting existing categories:", error);
          }
        }
      };

      getExistingCategories();
    }, [budgetId]);

    const handleCategorySelect = (category: any) => {
      setCurrentSelectedCategory(category);
      setShowCategoryModal(false);
    };

    const filteredCategories = useMemo(() => {
      if (isEditing) {
        return allCategories.filter(
          (cat) => !existingCategories.includes(cat.id) || cat.id === categoryId
        );
      }
      return allCategories.filter(
        (cat) => !existingCategories.includes(cat.id)
      );
    }, [
      allCategories,
      existingCategories,
      isEditing,
      categoryId,
    ]);

    const handleSave = async () => {
      if (numberEntry.amountInCents < 1) {
        amountShake.shake();
        return;
      }

      const numericAmount = numberEntry.amountInCents / 100;

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
          router.back();
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
      <View style={[tw`flex-1`, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}>
        <Stack.Screen
          options={{
            ...standardHeader(theme),
            headerShown: true,
            headerBackTitle: translate("common:back"),
            title: isEditing
              ? translate("newBudgetScreen:editBudget")
              : translate("createBudgetCategoryScreen:title"),
            contentStyle: { backgroundColor: theme.background },
          }}
        />

        <AmountDisplay
          entryType={numberEntry.entryType}
          amountInCents={numberEntry.amountInCents}
          wholePart={numberEntry.wholePart}
          decimalSuffix={numberEntry.decimalSuffix}
          onBackspace={numberEntry.handleBackspace}
          shakeOffset={amountShake.offset}
        />

        <View style={tw`px-4`}>
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.7}
            style={[
              tw`flex-row items-center px-4 py-3 rounded-2xl`,
              { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
            ]}
          >
            {(() => {
              const iconUrl = currentSelectedCategory?.icon_url;
              const isEmoji = iconUrl && !iconUrl.startsWith("/storage/");
              return (
                <View style={tw`w-8 h-8 items-center justify-center`}>
                  {iconUrl ? (
                    isEmoji ? (
                      <Text style={{ fontSize: 22 }}>{iconUrl}</Text>
                    ) : (
                      <SvgUri
                        width={28}
                        height={28}
                        uri={`${process.env.EXPO_PUBLIC_SUPABASE_URL}${iconUrl}`}
                      />
                    )
                  ) : null}
                </View>
              );
            })()}
            <Text
              style={[tw`flex-1 ml-3`, { color: theme.textPrimary, fontSize: 15 }]}
              weight="medium"
              numberOfLines={1}
            >
              {currentSelectedCategory?.name
                ? translateCategoryName(
                    currentSelectedCategory.name,
                    currentSelectedCategory.id,
                    currentSelectedCategory.icon_url || ""
                  )
                : ""}
            </Text>
            <EditIconSvg width={16} height={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <NumberPad
          entryType={numberEntry.entryType}
          decimalSeparator={decimalSeparator}
          onDigit={numberEntry.handleDigit}
          onBackspace={numberEntry.handleBackspace}
          onDecimal={numberEntry.handleDecimal}
          onSubmit={handleSave}
        />

        <CustomBudgetCategoryModal
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSelect={handleCategorySelect}
          navigation={navigationAdapter}
          categories={filteredCategories}
          screenName="CreateBudgetCategory"
          hideActions={false}
        />
      </View>
    );
  });
