/**
 * Type definitions for Expo Router routes
 * Use these for type-safe navigation in the app
 */

// Auth routes (unauthenticated)
export type AuthRoutes = {
  "/(auth)/welcome": undefined;
  "/(auth)/login": undefined;
  "/(auth)/magic-link": undefined;
};

// Tab routes
export type TabRoutes = {
  "/(authenticated)/(tabs)/home": undefined;
  "/(authenticated)/(tabs)/budgets": undefined;
  "/(authenticated)/(tabs)/chatbot": { initialQuestion?: string };
  "/(authenticated)/(tabs)/reports": undefined;
};

// Transaction routes
export type TransactionRoutes = {
  "/(authenticated)/transaction": {
    transactionType?: "Expense" | "Income" | "Transfer";
    transactionId?: string;
    fromCategoryScreen?: string;
  };
  "/(authenticated)/edit-transaction/[transactionId]": {
    transactionId: string;
    transactionType?: "Expense" | "Income" | "Transfer";
    transaction?: string;
  };
  "/(authenticated)/transactions": {
    origin?: string;
    accountIds?: string;
    months?: string;
    categoryIds?: string;
    transactionType?: "Income" | "Expense";
  };
};

// Budget routes
export type BudgetRoutes = {
  "/(authenticated)/budget/new": {
    isEditing?: string;
    budgetId?: string;
    budgetData?: string;
  };
  "/(authenticated)/budget/[budgetId]": {
    budgetId: string;
    categoryId?: string;
  };
  "/(authenticated)/budget-detail/[budgetId]": {
    budgetId: string;
    categoryId?: string;
  };
  "/(authenticated)/create-budget-category/[budgetId]": {
    budgetId: string;
    selectedCategory?: string;
    isEditing?: string;
    categoryId?: string;
    amount?: string;
  };
};

// Account routes
export type AccountRoutes = {
  "/(authenticated)/accounts": {
    visible?: string;
  };
  "/(authenticated)/select-bank": {
    isTransfer?: string;
    transferType?: "from" | "to";
    fromBankModal?: string;
    fromScreen?: string;
  };
  "/(authenticated)/select-bank-type/[bankId]": {
    bankId: string;
    selectedBank?: string;
  };
  "/(authenticated)/account-balance": {
    selectedBank?: string;
    accountId?: string;
    isEditing?: string;
    accountData?: string;
    isTransfer?: string;
    transferType?: "from" | "to";
    fromScreen?: string;
  };
  "/(authenticated)/edit-account/[accountId]": {
    accountId: string;
    accountData?: string;
  };
};

// Profile & Settings routes
export type ProfileRoutes = {
  "/(authenticated)/profile": undefined;
  "/(authenticated)/edit-profile": undefined;
  "/(authenticated)/language": undefined;
  "/(authenticated)/country": undefined;
};

// Report routes
export type ReportRoutes = {
  "/(authenticated)/reports-income": undefined;
  "/(authenticated)/reports-category": undefined;
};

// Other routes
export type OtherRoutes = {
  "/(authenticated)/webview": {
    url: string;
    title: string;
  };
  "/(authenticated)/banner-features": undefined;
  "/(authenticated)/new-category": {
    isEditing?: string;
    categoryData?: string;
    previousScreen?: string;
  };
};

// Combined all routes
export type AppRoutes = AuthRoutes &
  TabRoutes &
  TransactionRoutes &
  BudgetRoutes &
  AccountRoutes &
  ProfileRoutes &
  ReportRoutes &
  OtherRoutes & {
    "/": undefined; // Root/splash
    "/+not-found": undefined;
  };

// Helper type for route paths
export type RoutePath = keyof AppRoutes;

// Route mapping from old names to new paths (for migration)
export const RouteMapping = {
  // Auth
  Welcome: "/(auth)/welcome",
  Login: "/(auth)/login",
  MagicLink: "/(auth)/magic-link",

  // Tabs
  Dashboard: "/(authenticated)/(tabs)/home",
  Home: "/(authenticated)/(tabs)/home",
  Budgets: "/(authenticated)/(tabs)/budgets",
  Chatbot: "/(authenticated)/(tabs)/chatbot",
  Reports: "/(authenticated)/(tabs)/reports",

  // Transactions
  Transaction: "/(authenticated)/transaction",
  EditTransaction: "/(authenticated)/edit-transaction",
  Transactions: "/(authenticated)/transactions",

  // Budgets
  Budget: "/(authenticated)/budget",
  NewBudget: "/(authenticated)/budget/new",
  BudgetDetail: "/(authenticated)/budget-detail",
  CreateBudgetCategory: "/(authenticated)/create-budget-category",

  // Accounts
  Accounts: "/(authenticated)/accounts",
  SelectBank: "/(authenticated)/select-bank",
  SelectBankType: "/(authenticated)/select-bank-type",
  AccountBalance: "/(authenticated)/account-balance",
  EditAccountScreen: "/(authenticated)/edit-account",

  // Profile
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
} as const;
