# AGENTS.md - Kebo Mobile App

This document provides essential information for AI coding agents working in the Kebo mobile application.

## Overview

The mobile app is the **main Kebo personal finance application** built with Expo and React Native. It allows users to track expenses, income, transfers, set budgets, and get AI-powered financial insights.

| Attribute | Value |
|-----------|-------|
| Framework | Expo SDK 52 + React Native |
| State | MobX-State-Tree |
| Navigation | React Navigation (native stack + bottom tabs) |
| Styling | twrnc (Tailwind for React Native) |
| Backend | Supabase |
| Analytics | PostHog |
| i18n | i18next (8 languages) |

## Commands

```bash
bun run mobile start     # Start Expo dev server (clears cache)
bun run mobile ios       # Run on iOS simulator
bun run mobile android   # Run on Android emulator
bun run mobile typecheck # Type check this app only
```

## Directory Structure

```
apps/mobile/
├── App.tsx                      # Main entry point
├── assets/                      # App icons, splash, Lottie animations
└── src/
    ├── components/
    │   ├── assets/              # Image and Icon wrapper components
    │   ├── custom/              # App-specific components (modals, cards)
    │   ├── svg/                 # SVG icon components (80+ files)
    │   ├── ui/                  # Generic UI (Toast, Loader)
    │   ├── SwipeableList/       # Swipeable list component
    │   └── Screen.tsx           # Base screen wrapper
    ├── config/
    │   ├── index.ts             # Config aggregator (DEV/PROD)
    │   ├── config.base.ts       # Base configuration
    │   ├── config.dev.ts        # Development overrides
    │   ├── config.prod.ts       # Production overrides
    │   └── supabase.ts          # Supabase client setup
    ├── hooks/
    │   ├── useAnalytics.ts      # Analytics tracking
    │   ├── useNotifications.ts  # Push notifications
    │   ├── useTransactionForm.ts
    │   └── ...
    ├── i18n/
    │   ├── i18n.ts              # i18next configuration
    │   ├── translate.ts         # Translation function
    │   └── [locale].ts          # en, es, pt, fr, it, de, zh, hi
    ├── models/                  # MobX-State-Tree
    │   ├── RootStore.ts         # Root store aggregator
    │   ├── helpers/
    │   │   ├── useStores.ts     # Hook to access stores
    │   │   ├── setupRootStore.ts
    │   │   └── getRootStore.ts
    │   ├── transaction/
    │   ├── category/
    │   ├── category-store/
    │   ├── account/
    │   ├── account-store/
    │   ├── bank/
    │   ├── bank-store/
    │   ├── profile/
    │   └── ui-store/
    ├── navigators/
    │   ├── AppNavigator.tsx     # Main stack navigator
    │   ├── DashboardNavigator.tsx # Bottom tab navigator
    │   └── navigationUtilities.ts
    ├── screens/                 # 30+ screens
    │   ├── HomeScreen/
    │   ├── LoginScreen/
    │   ├── TransactionScreen/
    │   ├── BudgetsScreen/
    │   ├── ChatbotScreen/
    │   ├── ReportsScreen/
    │   └── ...
    ├── services/                # API service classes
    │   ├── TransactionService.tsx
    │   ├── AccountService.tsx
    │   ├── CategoryService.tsx
    │   ├── BudgetService.tsx
    │   ├── ChatService.ts
    │   └── ...
    ├── theme/
    │   ├── colors.ts            # Light theme
    │   ├── colorsDark.ts        # Dark theme
    │   ├── typography.ts        # Font definitions
    │   └── spacing.ts
    ├── types/
    │   ├── transaction.ts
    │   └── banner.ts
    └── utils/
        ├── logger.ts            # Centralized logging
        ├── storage/             # AsyncStorage wrappers
        ├── formatDate.ts
        └── ...
```

## Key Patterns

### Screen Component Pattern

Screens use the `observer` HOC for MobX reactivity:

```typescript
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"
import { Screen } from "@/components"
import type { AppStackScreenProps } from "@/navigators"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { categoryStoreModel, accountStoreModel, profileModel } = useStores()
  const analytics = useAnalytics()
  
  useFocusEffect(useCallback(() => {
    // Fetch data on screen focus
  }, []))
  
  return (
    <Screen safeAreaEdges={["top", "bottom"]} preset="fixed" header={<Header />}>
      {/* Screen content */}
    </Screen>
  )
})
```

### MobX-State-Tree Store Pattern

```typescript
import { types, flow, cast, getRoot } from "mobx-state-tree"

export const CategoryStoreModel = types
  .model("CategoryStore")
  .props({
    categories: types.optional(types.array(CategoryModel), []),
    icons: types.optional(types.array(IconModel), []),
  })
  .views((self) => ({
    get expenseCategories() {
      return self.categories.filter(cat => cat.type === "Expense")
    },
    get incomeCategories() {
      return self.categories.filter(cat => cat.type === "Income")
    },
  }))
  .actions((self) => ({
    saveCategories: (categories) => {
      self.categories = cast(categories)
    },
  }))
  .actions((self) => {
    const getCategories = flow(function* (type?) {
      const result = yield CategoryService.getAll(type)
      if (result) self.saveCategories(result)
    })
    return { getCategories }
  })
```

### Accessing Stores

```typescript
import { useStores } from "@/models"

function MyComponent() {
  const { categoryStoreModel, transactionModel, profileModel } = useStores()
  // ...
}
```

### Service Pattern

All services use static methods with Supabase and centralized error handling:

```typescript
import { supabase } from "@/config/supabase"
import { logger } from "@/utils/logger"

export class TransactionService {
  static async createTransaction(transaction: TransactionSnapshotIn) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([transaction])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      logger.error("Error creating transaction:", error)
      throw error
    }
  }
  
  static async getAll(userId: string) {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
      
      if (error) throw error
      return data
    } catch (error) {
      logger.error("TransactionService.getAll error:", error)
      throw error
    }
  }
}
```

### Styling with twrnc

```typescript
import tw from "@/utils/useTailwind"

function MyComponent() {
  return (
    <View style={tw`px-4 py-6 flex-row justify-between bg-white dark:bg-gray-900`}>
      <Text style={tw`text-lg font-medium text-gray-900 dark:text-white`}>
        Hello
      </Text>
    </View>
  )
}
```

### i18n Usage

```typescript
import { translate } from "@/i18n"

// Simple translation
const title = translate("homeScreen:balance")

// With interpolation
const greeting = translate("homeScreen:greetings", { full_name: "John" })
```

### Logger Usage

Always use the centralized logger instead of `console`:

```typescript
import { logger } from "@/utils/logger"

logger.debug("Debug message", data)    // DEV only
logger.info("Info message")            // DEV only
logger.warn("Warning message")         // DEV only
logger.error("Error message", error)   // Always logged
```

## Navigation

### Stack Navigator (Auth-Aware)

```typescript
// AppNavigator.tsx
export const AppStack = observer(function AppStack() {
  const [token, setToken] = useState<string | null>(null)
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setToken(session?.access_token || null)
    )
  }, [])

  return (
    <Stack.Navigator>
      <Stack.Screen name="Splash" component={SplashScreen} />
      {token ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardNavigator} />
          <Stack.Screen name="Transaction" component={TransactionScreen} />
          {/* ... authenticated screens */}
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  )
})
```

### Type-Safe Navigation

```typescript
// Define route params
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Dashboard: undefined
  Transaction: { transactionType?: "Expense" | "Income" | "Transfer" }
  EditTransaction: { transactionId: string; transaction: TransactionData }
  Budget: { budgetId: string; categoryId?: string }
}

// Use in screen props
export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>

// Navigate with type safety
navigation.navigate("Transaction", { transactionType: "Expense" })
```

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Screens | `*Screen` suffix, folder | `screens/HomeScreen/HomeScreen.tsx` |
| Components | PascalCase | `CustomButton.tsx` |
| SVG Icons | `*Svg` suffix | `HomeSvg.tsx` |
| Modals | `*Modal` suffix | `CustomCategoryModal.tsx` |
| Services | `*Service` suffix | `TransactionService.tsx` |
| Stores | `*Model` or `*StoreModel` | `CategoryStoreModel.ts` |
| Hooks | `use` prefix | `useAnalytics.ts` |

## Key Screens

| Screen | Purpose |
|--------|---------|
| `HomeScreen` | Dashboard with balance, quick actions, recent transactions |
| `TransactionScreen` | Create new Expense/Income/Transfer |
| `EditTransactionScreen` | Edit existing transactions |
| `TransactionsScreen` | Full transaction history with filtering |
| `BudgetsScreen` | List of user budgets |
| `BudgetScreen` | Budget details and progress |
| `NewBudgetScreen` | Create/edit budget |
| `ChatbotScreen` | AI financial advisor (Kebo Wise) |
| `ReportsScreen` | Financial reports and charts |
| `ProfileScreen` | User settings and preferences |
| `AccountsScreen` | Bank account management |
| `LoginScreen` | Authentication (Google, Apple, Email) |

## Environment Variables

```bash
# Supabase (required)
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=

# Default data
EXPO_PUBLIC_INITIAL_CATEGORY=

# Google Sign-In (configured in app.json)
```

## Adding New Screens

1. Create folder in `src/screens/` with screen name
2. Create `ScreenName.tsx` with observer pattern
3. Add route to `AppStackParamList` in `navigators/AppNavigator.tsx`
4. Add screen to appropriate navigator
5. Add translations to all locale files in `src/i18n/`

## Adding New Stores

1. Create model folder in `src/models/`
2. Define model with `types.model()`, props, views, and actions
3. Add to `RootStoreModel` in `RootStore.ts`
4. Access via `useStores()` hook

## Key Dependencies

| Purpose | Package |
|---------|---------|
| State | mobx, mobx-state-tree, mobx-react-lite |
| Navigation | @react-navigation/native, @react-navigation/native-stack |
| Backend | @supabase/supabase-js |
| Styling | twrnc |
| Forms | formik, yup |
| i18n | i18next, react-i18next |
| Analytics | posthog-react-native |
| Auth | expo-apple-authentication, @react-native-google-signin/google-signin |
| Storage | @react-native-async-storage/async-storage, expo-secure-store |
| Animations | lottie-react-native, react-native-reanimated, moti |
| Charts | react-native-gifted-charts |
