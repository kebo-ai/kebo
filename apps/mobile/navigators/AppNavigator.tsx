import logger from "@/utils/logger";
import React from "react";
import {
  NavigationContainer,
  NavigatorScreenParams,
  RouteProp,
} from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import { SplashScreen } from "@/screens/splash-screen/splash-screen";
import { TransactionScreen } from "@/screens/transaction-screen/transaction-screen";
import { EditTransactionScreen } from "@/screens/edit-transaction-screen/edit-transaction-screen";
import { NewBudgetScreen } from "@/screens/new-budget-screen/new-budget-screen";
import { BudgetsScreen } from "@/screens/budgets-screen/budgets-screen";
import { BudgetScreen } from "@/screens/budget-screen/budget-screen";
import { CreateBudgetCategoryScreen } from "@/screens/create-budget-category-screen/create-budget-category-screen";
import { BudgetDetailScreen } from "@/screens/budget-detail-screen/budget-detail-screen";
import { NewCategoryScreen } from "@/screens/new-category-screen/new-category-screen";
import { SelectBankScreen } from "@/screens/select-bank-screen/select-bank-screen";
import { SelectBankTypeScreen } from "@/screens/select-bank-type-screen/select-bank-type-screen";
import { AccountBalanceScreen } from "@/screens/account-balance-screen/account-balance-screen";
import { EditAccountScreen } from "@/screens/edit-account-screen/edit-account-screen";
import { EditProfileScreen } from "@/screens/edit-profile-screen/edit-profile-screen";
import { ProfileScreen } from "@/screens/profile-screen/profile-screen";
import { TransactionsScreen } from "@/screens/transactions-screen/transactions-screen";
import { AccountsScreen } from "@/screens/accounts-screen/accounts-screen";
import { ReportsIncomeScreen } from "@/screens/reports-income-screen/reports-income-screen";
import { ReportsCategoryScreen } from "@/screens/reports-category-screen/reports-category-screen";
import { WelcomeScreen } from "@/screens/welcome-screen/welcome-screen";
import Config from "@/config";
import { navigationRef, useBackButtonHandler } from "@/navigators/navigationUtilities";
import { ComponentProps, useEffect, useState } from "react";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import {
  DashboardNavigator,
  DashboardTabParamList,
} from "@/navigators/DashboardNavigator";
import { colors } from "@/theme/colors";
import { supabase } from "@/config/supabase";
import { Animated } from "react-native";
import { WebViewScreen } from "@/screens/web-view-screen/web-view-screen";
import { LanguageScreen } from "@/screens/language-screen/language-screen";
import { CountryScreen } from "@/screens/country-screen/country-screen";
import { StatusBar } from "expo-status-bar";
import { BannerFeaturesScreen } from "@/screens/banner-features-screen/banner-features-screen";
import { Category } from "@/models/category/category";

interface BankOption {
  id: string;
  name: string;
  bank_url: string;
  balance?: number;
  account_type_id?: string;
  description?: string;
}

export type AppStackParamList = {
  Welcome: undefined;
  Transaction: {
    transactionType?: "Expense" | "Income" | "Transfer";
    transactionId?: string;
    fromCategoryScreen?: boolean;
  };
  EditTransaction: {
    transactionId: string;
    transactionType: "Expense" | "Income" | "Transfer";
    transaction: {
      id: string;
      description: string;
      amount: number;
      date: string;
      transaction_type: string;
      category_id?: string;
      category_icon_url?: string;
      account_id?: string;
      is_recurring?: boolean;
      icon?: string;
      color?: string;
      bank_url?: string;
      [key: string]: any;
    };
  };
  Profile: undefined;
  EditProfile: undefined;
  Home: undefined;
  Budgets: undefined;
  Budget: {
    budgetId: string;
    categoryId?: string;
  };
  BudgetDetail: {
    budgetId: string;
    categoryId?: string;
  };
  NewBudget:
    | {
        isEditing?: boolean;
        budgetId?: string;
        budgetData?: {
          custom_name: string;
          start_date: string;
          end_date: string;
        };
      }
    | undefined;
  CreateBudgetCategory: {
    budgetId: string;
    selectedCategory: Category;
    isEditing?: boolean;
    categoryId?: string;
    amount?: number;
  };
  SelectBank: {
    isTransfer?: boolean;
    transferType?: "from" | "to";
    fromBankModal?: boolean;
    fromScreen?: string;
  };
  Transactions: undefined;
  SelectBankType: {
    selectedBank: {
      id: string;
      name: string;
      bank_url: string;
    };
  };
  Accounts: undefined;
  AccountBalance: {
    selectedBank: {
      id: string;
      name: string;
      bank_url: string;
    };
    accountId?: string;
    isEditing?: boolean;
    accountData?: BankOption;
    isTransfer?: boolean;
    transferType?: "from" | "to";
    fromScreen?: string;
  };
  EditAccountScreen: {
    accountId: string;
    accountData: BankOption;
  };
  NewCategoryScreen:
    | {
        isEditing?: boolean;
        categoryData?: {
          id: string;
          name: string;
          icon_url: string;
          type: "Income" | "Expense" | "Transfer" | "Investment" | "Other";
        };
        previousScreen?: string;
      }
    | undefined;
  Chatbot: {
    initialQuestion?: string;
  };
  Reports: undefined;
  ReportsIncomeScreen: undefined;
  ReportsCategoryScreen: undefined;
  Splash: undefined;
  BannerFeatures: undefined;
  Dashboard: NavigatorScreenParams<DashboardTabParamList>;
  WebView: {
    url: string;
    title: string;
  };
  Language: undefined;
  Country: undefined;

  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
};

const exitRoutes = Config.exitRoutes;
export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export const Stack = createNativeStackNavigator<AppStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  navigationBarColor: colors.white,
  contentStyle: {
    backgroundColor: colors.white,
  },
  animation: "slide_from_right",
  gestureEnabled: true,
  gestureDirection: "horizontal",
  animationDuration: 200,
};

const defaultScreenOptions: NativeStackNavigationOptions = {
  ...screenOptions,
  animation: "slide_from_right",
  presentation: "card",
};

export const AppStack = observer(function AppStack() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) logger.error("Error obteniendo sesión:", error);
      setToken(data.session?.access_token || null);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setToken(session?.access_token || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />

      <Stack.Screen
        name="BannerFeatures"
        component={BannerFeaturesScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {token ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardNavigator}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Transaction"
            component={TransactionScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="EditTransaction"
            component={EditTransactionScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="NewBudget"
            component={NewBudgetScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Budgets"
            component={BudgetsScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Budget"
            component={BudgetScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="CreateBudgetCategory"
            component={CreateBudgetCategoryScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="BudgetDetail"
            component={BudgetDetailScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="NewCategoryScreen"
            component={NewCategoryScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="SelectBank"
            component={SelectBankScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="SelectBankType"
            component={SelectBankTypeScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="AccountBalance"
            component={AccountBalanceScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="EditAccountScreen"
            component={EditAccountScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Transactions"
            component={TransactionsScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Accounts"
            component={AccountsScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Country"
            component={CountryScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="ReportsIncomeScreen"
            component={ReportsIncomeScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="ReportsCategoryScreen"
            component={ReportsCategoryScreen}
            options={{ gestureEnabled: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ gestureEnabled: true }}
          />
        </>
      )}
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={{
          presentation: "card",
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
});

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = observer(function AppNavigator(
  props: NavigationProps
) {
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <AppStack />
    </NavigationContainer>
  );
});
