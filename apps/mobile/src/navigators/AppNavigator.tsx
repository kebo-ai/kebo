import logger from "../utils/logger";
import React from "react";
import {
  NavigationContainer,
  NavigatorScreenParams,
  RouteProp,
} from "@react-navigation/native";
import { observer } from "mobx-react-lite";
import * as Screens from "../screens";
import Config from "../config";
import { navigationRef, useBackButtonHandler } from "./navigationUtilities";
import { ComponentProps, useEffect, useState } from "react";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import {
  DashboardNavigator,
  DashboardTabParamList,
} from "./DashboardNavigator";
import { colors } from "../theme/colors";
import { supabase } from "../config/supabase";
import { Animated } from "react-native";
import { WebViewScreen } from "../screens/WebViewScreen/WebViewScreen";
import { LanguageScreen } from "../screens/LanguageScreen/LanguageScreen";
import { CountryScreen } from "../screens/CountryScreen/CountryScreen";
import { StatusBar } from "expo-status-bar";
import { BannerFeaturesScreen } from "../screens/BannerFeaturesScreen/BannerFeaturesScreen";
import { Category } from "../models/category/category";

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
  Login: undefined;
  MagicLink: undefined;
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
        component={Screens.SplashScreen}
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
            component={Screens.TransactionScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="EditTransaction"
            component={Screens.EditTransactionScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="NewBudget"
            component={Screens.NewBudgetScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Budgets"
            component={Screens.BudgetsScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="Budget"
            component={Screens.BudgetScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="CreateBudgetCategory"
            component={Screens.CreateBudgetCategoryScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="BudgetDetail"
            component={Screens.BudgetDetailScreen}
            options={{
              ...defaultScreenOptions,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="NewCategoryScreen"
            component={Screens.NewCategoryScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="SelectBank"
            component={Screens.SelectBankScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="SelectBankType"
            component={Screens.SelectBankTypeScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="AccountBalance"
            component={Screens.AccountBalanceScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="EditAccountScreen"
            component={Screens.EditAccountScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="EditProfile"
            component={Screens.EditProfileScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Profile"
            component={Screens.ProfileScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Transactions"
            component={Screens.TransactionsScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Accounts"
            component={Screens.AccountsScreen}
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
            component={Screens.ReportsIncomeScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="ReportsCategoryScreen"
            component={Screens.ReportsCategoryScreen}
            options={{ gestureEnabled: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Welcome"
            component={Screens.WelcomeScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="Login"
            component={Screens.LoginScreen}
            options={{ gestureEnabled: true }}
          />
          <Stack.Screen
            name="MagicLink"
            component={Screens.MagicLinkScreen}
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
