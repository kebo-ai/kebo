# Changelog

## 1.3.1 (2026-04-10)

### Features
- Add delete button to transaction detail header
- Add duplicate and delete actions to budget detail screens
- Add theme preference override in settings
- Add daily reminder toggle and time picker in settings
- Add custom Android tab bar
- Localize App Intents for English and Portuguese
- Send local notification after adding a transaction

### Bug Fixes
- Fix PostHog analytics broken since 1.3.0 (null client race condition)
- Fix transaction list ordering for same-day entries (created_at tiebreaker)
- Fix calendar picker month navigation (arrows + swipe)
- Fix category params crash in add transaction flow
- Sync transaction type toggle with route param
- Prevent report card text and image overflow
- Fix chatbot keyboard inset math on Android
- Use JS header on Android to handle status bar inset
- Remove splash screen animated icon on Android

### Chores
- Upgrade to Expo SDK 55

## 1.2.9 (2026-04-01)

### Features
- Add budget duplicate with swipe action
- Add info badge to balance label
- Add PostHog events for review gate funnel
- Lower review gate to first transaction and return analytics fields

### Bug Fixes
- Fix transaction list disappearing and loadMore loop on pagination
- Fix tiny amount font on devices with large font scaling
- Use deterministic font sizing for amount display
- Flatten report drill-down params for expo-router
- Stringify categoryData params to prevent edit crash
- Match splash screen background to animation
- Filter soft-deleted budget lines from queries (inflated totals)
- Calculate overall budget progress from category allocations

### Refactors
- Migrate review flow from Supabase RPC to Hono API

## 1.2.8 (2026-03-15)

### Features
- Redesign login with grain gradient shader and responsive layout
- Account edit: show initial balance (editable) and current balance (read-only) separately
- Add reusable InfoBadge component with contextual help modal
- Enable expo-updates for OTA support

### Bug Fixes
- Fix edit account negative balance corrupting keyboard state
- Fix computed balance overwriting accounts.balance column on save
- Add dirty checking to skip save when nothing changed
- Fix chatbot input hidden by keyboard on Android
- Remove missing splashscreen_logo drawable reference
- Use native header and fix month filter in transactions screen
- Prevent backdrop tap from intercepting month selection
- Add dark mode support to budget category modal
- Add dark mode support to budget onboarding slider

### Refactors
- Replace system keyboard with NumberPad in budget category screen

## 1.2.7

### Initial
- Configure EAS Build & Submit for production deployments
- Upgrade to Expo SDK 54 and React Native 0.81
