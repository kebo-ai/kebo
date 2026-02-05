import { router } from "expo-router";

// Route mapping from old React Navigation routes to new Expo Router paths
export const ROUTE_MAP: Record<string, string> = {
  // Auth routes
  Welcome: "/(auth)/welcome",
  Login: "/(auth)/login",
  MagicLink: "/(auth)/magic-link",

  // Dashboard/Tabs
  Dashboard: "/(authenticated)/(tabs)/home",
  Home: "/(authenticated)/(tabs)/home",
  Budgets: "/(authenticated)/(tabs)/budgets",
  Chatbot: "/(authenticated)/(tabs)/chatbot",
  Reports: "/(authenticated)/(tabs)/reports",

  // Transactions
  Transaction: "/(authenticated)/transaction",
  EditTransaction: "/(authenticated)/edit-transaction",
  Transactions: "/(authenticated)/transactions",

  // Budget routes
  Budget: "/(authenticated)/budget",
  NewBudget: "/(authenticated)/budget/new",
  BudgetDetail: "/(authenticated)/budget-detail",
  CreateBudgetCategory: "/(authenticated)/create-budget-category",

  // Account routes
  Accounts: "/(authenticated)/accounts",
  SelectBank: "/(authenticated)/select-bank",
  SelectBankType: "/(authenticated)/select-bank-type",
  AccountBalance: "/(authenticated)/account-balance",
  EditAccountScreen: "/(authenticated)/edit-account",

  // Profile routes
  Profile: "/(authenticated)/profile",
  EditProfile: "/(authenticated)/edit-profile",
  Language: "/(authenticated)/language",
  Country: "/(authenticated)/country",

  // Reports
  ReportsIncomeScreen: "/(authenticated)/reports-income",
  ReportsCategoryScreen: "/(authenticated)/reports-category",

  // Other
  WebView: "/(authenticated)/webview",
  BannerFeatures: "/(authenticated)/banner-features",
  NewCategoryScreen: "/(authenticated)/new-category",
  Splash: "/",
};

/**
 * Push a route directly using Expo Router
 */
export const push = (path: string, params?: Record<string, any>) => {
  if (params) {
    router.push({ pathname: path as any, params });
  } else {
    router.push(path as any);
  }
};

/**
 * Navigate using old route names - maps to new Expo Router paths
 */
export const navigate = (route: string, params?: Record<string, any>) => {
  const path = ROUTE_MAP[route];
  if (!path) {
    console.warn(`Route "${route}" not found in route map`);
    return;
  }

  if (params) {
    router.push({ pathname: path as any, params });
  } else {
    router.push(path as any);
  }
};

/**
 * Replace current screen using old route names
 */
export const replace = (route: string, params?: Record<string, any>) => {
  const path = ROUTE_MAP[route];
  if (!path) {
    console.warn(`Route "${route}" not found in route map`);
    return;
  }

  if (params) {
    router.replace({ pathname: path as any, params });
  } else {
    router.replace(path as any);
  }
};

/**
 * Go back
 */
export const goBack = () => {
  if (router.canGoBack()) {
    router.back();
  }
};

/**
 * Reset navigation stack to a route
 */
export const resetRoot = (route: string, params?: Record<string, any>) => {
  const path = ROUTE_MAP[route];
  if (!path) {
    console.warn(`Route "${route}" not found in route map`);
    return;
  }

  // Use dismissAll then navigate for a clean reset
  router.dismissAll();
  if (params) {
    router.replace({ pathname: path as any, params });
  } else {
    router.replace(path as any);
  }
};

/**
 * Create a navigation adapter that mimics React Navigation's navigation prop
 * Useful for gradually migrating screens
 */
export const createNavigationAdapter = () => ({
  navigate: (route: string, params?: Record<string, any>) =>
    navigate(route, params),
  replace: (route: string, params?: Record<string, any>) =>
    replace(route, params),
  goBack: () => goBack(),
  canGoBack: () => router.canGoBack(),
  getState: () => ({
    routes: [],
    index: 0,
  }),
  setOptions: (_options: any) => {
    // No-op for now, screen options are handled by the route file
  },
});
