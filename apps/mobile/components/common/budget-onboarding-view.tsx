import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import tw from "@/hooks/use-tailwind";
import { translate } from "@/i18n";
import { TxKeyPath } from "@/i18n";
import { colors } from "@/theme/colors";
import { useCurrencyFormatter } from "./currency-formatter";
import CustomBudgetCard from "./custom-budget-card";
import { CategoriesListBudget } from "./categories-list-budget";
import { CategoryItem } from "./category-item";
import CustomInput from "./custom-input";
import { ArrowDownSimpleIcon } from "@/components/icons/arrow-down-simple-icon";
import moment from "moment";

interface BudgetOnboardingViewProps {
  onDone: () => void;
  userName: string;
}

const MONTH_KEYS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const StepBadge = ({
  step,
  title,
  description,
  theme,
  isResult,
}: {
  step: number;
  title: string;
  description: string;
  theme: any;
  isResult?: boolean;
}) => (
  <View style={tw`mb-3`}>
    <View style={tw`flex-row items-center gap-3 mb-1`}>
      <View
        style={tw`w-7 h-7 rounded-full bg-[${colors.primary}] items-center justify-center`}
      >
        {isResult ? (
          <Text style={{ fontSize: 14, lineHeight: 18 }}>✨</Text>
        ) : (
          <Text weight="semibold" type="sm" color="#FFFFFF">
            {String(step)}
          </Text>
        )}
      </View>
      <Text weight="semibold" type="lg" color={theme.textPrimary}>
        {title}
      </Text>
    </View>
    <Text weight="light" type="sm" color={theme.textSecondary} style={tw`ml-10`}>
      {description}
    </Text>
  </View>
);

const BudgetOnboardingView: React.FC<BudgetOnboardingViewProps> = ({
  onDone,
  userName,
}) => {
  const { theme } = useTheme();
  const { formatAmount } = useCurrencyFormatter();

  const firstName = userName?.trim() ? userName.trim().split(" ")[0] : "";

  const sampleData = useMemo(() => {
    const now = new Date();
    const monthKey = MONTH_KEYS[now.getMonth()];
    const translatedMonth = translate(`months:${monthKey}` as TxKeyPath);
    const budgetName = `${translate("newBudgetScreen:budget" as TxKeyPath)} ${translatedMonth}`;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startFormatted = moment(startOfMonth).format("DD/MM/YYYY");
    const endFormatted = moment(endOfMonth).format("DD/MM/YYYY");

    const categories = [
      { id: "food", name: translate("categoriesModal:food" as TxKeyPath), emoji: "🍔" },
      { id: "transport", name: translate("categoriesModal:transport" as TxKeyPath), emoji: "🚌" },
      { id: "entertainment", name: translate("categoriesModal:entertainment" as TxKeyPath), emoji: "🎬" },
      { id: "health", name: translate("categoriesModal:health" as TxKeyPath), emoji: "🏥" },
    ];

    const budgetCard = {
      budget: {
        custom_name: budgetName,
        start_date: startFormatted,
        end_date: endFormatted,
      },
      total_metrics: {
        total_budget: 2000,
        total_spent: 800,
        total_remaining: 1200,
        overall_progress_percentage: 40,
      },
    };

    const budgetLines = [
      {
        id: "1",
        category_id: "food",
        category_name: translate("categoriesModal:food" as TxKeyPath),
        icon_url: "",
        icon_emoji: "🍔",
        color_id: null,
        amount: 500,
        spent_amount: 200,
        remaining_amount: 300,
        progress_percentage: 40,
      },
      {
        id: "2",
        category_id: "transport",
        category_name: translate("categoriesModal:transport" as TxKeyPath),
        icon_url: "",
        icon_emoji: "🚌",
        color_id: null,
        amount: 300,
        spent_amount: 150,
        remaining_amount: 150,
        progress_percentage: 50,
      },
      {
        id: "3",
        category_id: "entertainment",
        category_name: translate("categoriesModal:entertainment" as TxKeyPath),
        icon_url: "",
        icon_emoji: "🎬",
        color_id: null,
        amount: 200,
        spent_amount: 50,
        remaining_amount: 150,
        progress_percentage: 25,
      },
    ];

    return { budgetName, startFormatted, endFormatted, categories, budgetCard, budgetLines };
  }, []);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={tw`px-5 pb-6`}
    >
      {/* Welcome */}
      <View style={tw`mb-8 mt-4`}>
        <Text weight="bold" type="2xl" color={theme.textPrimary}>
          {translate("budgetOnboarding:welcome" as TxKeyPath, { name: firstName })}
        </Text>
        <Text weight="light" color={theme.textSecondary} style={tw`mt-2`}>
          {translate("budgetOnboarding:subtitle" as TxKeyPath)}
        </Text>
      </View>

      {/* Step 1: Name your budget */}
      <StepBadge
        step={1}
        title={translate("budgetOnboarding:step1.title" as TxKeyPath)}
        description={translate("budgetOnboarding:step1.description" as TxKeyPath)}
        theme={theme}
      />
      <View pointerEvents="none" style={tw`mb-8 mt-2`}>
        <CustomInput
          label={translate("newBudgetScreen:labelName" as TxKeyPath)}
          placeholder={translate("newBudgetScreen:labelName" as TxKeyPath)}
          value={sampleData.budgetName}
          editable={false}
        />
        <Text type="sm" weight="light" color={theme.textTertiary} style={tw`mb-1`}>
          {translate("newBudgetScreen:labelTime" as TxKeyPath)}
        </Text>
        <View
          style={tw`flex-row items-center justify-between border border-[${theme.border}] bg-[${theme.surface}] rounded-xl px-4 h-14`}
        >
          <Text color={theme.textPrimary}>
            {sampleData.startFormatted} - {sampleData.endFormatted}
          </Text>
          <ArrowDownSimpleIcon width={12} height={8} color={colors.primary} />
        </View>
      </View>

      {/* Step 2: Choose categories */}
      <StepBadge
        step={2}
        title={translate("budgetOnboarding:step2.title" as TxKeyPath)}
        description={translate("budgetOnboarding:step2.description" as TxKeyPath)}
        theme={theme}
      />
      <View pointerEvents="none" style={tw`mb-8 mt-2`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={tw`gap-1`}
        >
          {sampleData.categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              item={{ id: cat.id, name: cat.name, icon_url: cat.emoji }}
              onSelect={() => {}}
              disableTouch
              showActions={false}
              setShowActions={() => {}}
            />
          ))}
        </ScrollView>
      </View>

      {/* Step 3: Set amounts */}
      <StepBadge
        step={3}
        title={translate("budgetOnboarding:step3.title" as TxKeyPath)}
        description={translate("budgetOnboarding:step3.description" as TxKeyPath)}
        theme={theme}
      />
      <View
        style={[
          tw`rounded-2xl p-4 border border-[${theme.border}] mb-8 mt-2`,
          { backgroundColor: theme.surface },
        ]}
      >
        {sampleData.budgetLines.map((item, index) => (
          <View
            key={item.id}
            style={[
              tw`flex-row items-center justify-between py-3`,
              index < sampleData.budgetLines.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <Text style={{ fontSize: 22 }}>{item.icon_emoji}</Text>
              <Text weight="medium" color={theme.textPrimary}>
                {item.category_name}
              </Text>
            </View>
            <Text weight="semibold" color={colors.primary}>
              {formatAmount(item.amount)}
            </Text>
          </View>
        ))}
      </View>

      {/* Result */}
      <StepBadge
        step={0}
        title={translate("budgetOnboarding:result.title" as TxKeyPath)}
        description={translate("budgetOnboarding:result.description" as TxKeyPath)}
        theme={theme}
        isResult
      />
      <View pointerEvents="none" style={tw`mt-2`}>
        <CustomBudgetCard budget={sampleData.budgetCard} />
      </View>
      <View pointerEvents="none" style={tw`mt-3`}>
        <View
          style={tw`py-2 bg-[${theme.surface}] border border-[${theme.border}] rounded-[20px]`}
        >
          <CategoriesListBudget
            data={sampleData.budgetLines}
            onCategoryPress={() => {}}
          />
        </View>
      </View>

      {/* CTA */}
      <View style={tw`mt-6 mb-20`}>
        <Button
          title={translate("budgetOnboarding:cta" as TxKeyPath)}
          onPress={onDone}
          size="lg"
          radius="lg"
          haptic
        />
      </View>
    </ScrollView>
  );
};

export default BudgetOnboardingView;
