# Changelog

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
