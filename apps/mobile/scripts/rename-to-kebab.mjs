#!/usr/bin/env node
/**
 * rename-to-kebab.mjs
 *
 * Renames files/directories from PascalCase/camelCase to kebab-case within apps/mobile/.
 * Uses two-step git mv for macOS case-insensitive filesystem safety.
 * Updates all .ts/.tsx imports automatically.
 *
 * Usage:
 *   node scripts/rename-to-kebab.mjs --category theme --dry-run
 *   node scripts/rename-to-kebab.mjs --category theme
 */

import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join, resolve, dirname, basename } from "node:path"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toKebabCase(str) {
  // Handle special patterns like "V2" at the end
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
}

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf-8", ...opts }).trim()
}

function gitMvTwoStep(oldPath, newPath, dryRun) {
  const relOld = oldPath.startsWith(ROOT) ? oldPath.slice(ROOT.length + 1) : oldPath
  const relNew = newPath.startsWith(ROOT) ? newPath.slice(ROOT.length + 1) : newPath
  const tempPath = join(dirname(relNew), `__temp_${basename(relNew)}`)

  if (dryRun) {
    console.log(`  [rename] ${relOld} → ${relNew}`)
    return
  }

  run(`git mv "${relOld}" "${tempPath}"`)
  run(`git mv "${tempPath}" "${relNew}"`)
  console.log(`  [renamed] ${relOld} → ${relNew}`)
}

function gitMvDirTwoStep(oldDir, newDir, dryRun) {
  const relOld = oldDir.startsWith(ROOT) ? oldDir.slice(ROOT.length + 1) : oldDir
  const relNew = newDir.startsWith(ROOT) ? newDir.slice(ROOT.length + 1) : newDir
  const tempPath = join(dirname(relNew), `__temp_${basename(relNew)}`)

  if (dryRun) {
    console.log(`  [rename dir] ${relOld} → ${relNew}`)
    return
  }

  run(`git mv "${relOld}" "${tempPath}"`)
  run(`git mv "${tempPath}" "${relNew}"`)
  console.log(`  [renamed dir] ${relOld} → ${relNew}`)
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, "..", "..", "..")
const MOBILE = join(ROOT, "apps", "mobile")

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * Each category entry:
 *   files: Array of { old, new } relative to MOBILE (for file renames)
 *   dirs:  Array of { old, new } relative to MOBILE (for directory renames - done AFTER file renames inside)
 *
 * Import replacement is derived from file renames: old basename (no ext) → new basename (no ext)
 */
const CATEGORIES = {
  theme: {
    files: [
      { old: "theme/colorsDark.ts", new: "theme/colors-dark.ts" },
      { old: "theme/headerOptions.ts", new: "theme/header-options.ts" },
      { old: "theme/spacingDark.ts", new: "theme/spacing-dark.ts" },
    ],
    dirs: [],
  },

  utils: {
    files: [
      { old: "utils/analyticsUtils.ts", new: "utils/analytics-utils.ts" },
      { old: "utils/authUtils.ts", new: "utils/auth-utils.ts" },
      { old: "utils/categoryTranslations.ts", new: "utils/category-translations.ts" },
      { old: "utils/crashReporting.ts", new: "utils/crash-reporting.ts" },
      { old: "utils/formatDate.ts", new: "utils/format-date.ts" },
      { old: "utils/gestureHandler.ts", new: "utils/gesture-handler.ts" },
      { old: "utils/gestureHandler.native.ts", new: "utils/gesture-handler.native.ts" },
      { old: "utils/ignoreWarnings.ts", new: "utils/ignore-warnings.ts" },
      { old: "utils/openLinkInBrowser.ts", new: "utils/open-link-in-browser.ts" },
      { old: "utils/routerNavigation.ts", new: "utils/router-navigation.ts" },
    ],
    dirs: [],
  },

  models: {
    files: [
      { old: "models/RootStore.ts", new: "models/root-store.ts" },
      { old: "models/helpers/getRootStore.ts", new: "models/helpers/get-root-store.ts" },
      { old: "models/helpers/setupRootStore.ts", new: "models/helpers/setup-root-store.ts" },
      { old: "models/helpers/useStores.ts", new: "models/helpers/use-stores.ts" },
      { old: "models/helpers/withSetPropAction.ts", new: "models/helpers/with-set-prop-action.ts" },
    ],
    dirs: [],
  },

  services: {
    files: [
      { old: "services/AccountService.ts", new: "services/account-service.ts" },
      { old: "services/AccountTypeService.ts", new: "services/account-type-service.ts" },
      { old: "services/AnalyticsService.ts", new: "services/analytics-service.ts" },
      { old: "services/BankService.ts", new: "services/bank-service.ts" },
      { old: "services/BannerService.ts", new: "services/banner-service.ts" },
      { old: "services/BudgetService.ts", new: "services/budget-service.ts" },
      { old: "services/CategoryService.ts", new: "services/category-service.ts" },
      { old: "services/ChartService.ts", new: "services/chart-service.ts" },
      { old: "services/ChatService.ts", new: "services/chat-service.ts" },
      { old: "services/CurrencyService.ts", new: "services/currency-service.ts" },
      { old: "services/IconsService.ts", new: "services/icons-service.ts" },
      { old: "services/LanguageService.ts", new: "services/language-service.ts" },
      { old: "services/NumberFormatService.ts", new: "services/number-format-service.ts" },
      { old: "services/PostHogClient.ts", new: "services/post-hog-client.ts" },
      { old: "services/ReviewService.ts", new: "services/review-service.ts" },
      { old: "services/TransactionService.ts", new: "services/transaction-service.ts" },
      { old: "services/UserService.ts", new: "services/user-service.ts" },
    ],
    dirs: [],
  },

  hooks: {
    files: [
      { old: "hooks/useAnalytics.ts", new: "hooks/use-analytics.ts" },
      { old: "hooks/useHighlightAnimation.ts", new: "hooks/use-highlight-animation.ts" },
      { old: "hooks/useIsMounted.ts", new: "hooks/use-is-mounted.ts" },
      { old: "hooks/useKeyboardHeight.ts", new: "hooks/use-keyboard-height.ts" },
      { old: "hooks/useNotifications.ts", new: "hooks/use-notifications.ts" },
      { old: "hooks/useNumberEntry.ts", new: "hooks/use-number-entry.ts" },
      { old: "hooks/usePostHogClient.ts", new: "hooks/use-post-hog-client.ts" },
      { old: "hooks/useResponsiveTailwind.ts", new: "hooks/use-responsive-tailwind.ts" },
      { old: "hooks/useReviewModal.ts", new: "hooks/use-review-modal.ts" },
      { old: "hooks/useSafeAreaInsetsStyle.ts", new: "hooks/use-safe-area-insets-style.ts" },
      { old: "hooks/useShakeAnimation.ts", new: "hooks/use-shake-animation.ts" },
      { old: "hooks/useTailwind.ts", new: "hooks/use-tailwind.ts" },
      { old: "hooks/useTheme.ts", new: "hooks/use-theme.ts" },
      { old: "hooks/useTransactionDates.ts", new: "hooks/use-transaction-dates.ts" },
      { old: "hooks/useTransactionForm.ts", new: "hooks/use-transaction-form.ts" },
      { old: "hooks/useTransactionModals.ts", new: "hooks/use-transaction-modals.ts" },
      { old: "hooks/useTransactionType.ts", new: "hooks/use-transaction-type.ts" },
    ],
    dirs: [],
  },

  "components-ui": {
    files: [
      { old: "components/ui/Button.tsx", new: "components/ui/button.tsx" },
      { old: "components/ui/Text.tsx", new: "components/ui/text.tsx" },
      { old: "components/ui/Icon.tsx", new: "components/ui/icon.tsx" },
      { old: "components/ui/CustomLoader.tsx", new: "components/ui/custom-loader.tsx" },
      { old: "components/ui/CustomToast.tsx", new: "components/ui/custom-toast.tsx" },
    ],
    dirs: [],
  },

  "components-icons": {
    files: [
      { old: "components/icons/AccountSvg.tsx", new: "components/icons/account-svg.tsx" },
      { old: "components/icons/AccountsIconSvg.tsx", new: "components/icons/accounts-icon-svg.tsx" },
      { old: "components/icons/ArrowDownIcon.tsx", new: "components/icons/arrow-down-icon.tsx" },
      { old: "components/icons/ArrowDownSimpleIcon.tsx", new: "components/icons/arrow-down-simple-icon.tsx" },
      { old: "components/icons/ArrowLeftIcon.tsx", new: "components/icons/arrow-left-icon.tsx" },
      { old: "components/icons/ArrowLefttIconV2.tsx", new: "components/icons/arrow-leftt-icon-v2.tsx" },
      { old: "components/icons/ArrowRightIcon.tsx", new: "components/icons/arrow-right-icon.tsx" },
      { old: "components/icons/ArrowUpIcon.tsx", new: "components/icons/arrow-up-icon.tsx" },
      { old: "components/icons/BackBlackSvg.tsx", new: "components/icons/back-black-svg.tsx" },
      { old: "components/icons/BackSvg.tsx", new: "components/icons/back-svg.tsx" },
      { old: "components/icons/BudgetSvg.tsx", new: "components/icons/budget-svg.tsx" },
      { old: "components/icons/CalendarSvg.tsx", new: "components/icons/calendar-svg.tsx" },
      { old: "components/icons/CategoriesIconSvg.tsx", new: "components/icons/categories-icon-svg.tsx" },
      { old: "components/icons/CategoryIcon.tsx", new: "components/icons/category-icon.tsx" },
      { old: "components/icons/ChatBotSvg.tsx", new: "components/icons/chat-bot-svg.tsx" },
      { old: "components/icons/ChatHelpIcon.tsx", new: "components/icons/chat-help-icon.tsx" },
      { old: "components/icons/ChevronRightIconSvg.tsx", new: "components/icons/chevron-right-icon-svg.tsx" },
      { old: "components/icons/CoffeeIconSvg.tsx", new: "components/icons/coffee-icon-svg.tsx" },
      { old: "components/icons/CoinsSvg.tsx", new: "components/icons/coins-svg.tsx" },
      { old: "components/icons/CommentsIconSvg.tsx", new: "components/icons/comments-icon-svg.tsx" },
      { old: "components/icons/CountryIconSvg.tsx", new: "components/icons/country-icon-svg.tsx" },
      { old: "components/icons/CurrenceIconSvg.tsx", new: "components/icons/currence-icon-svg.tsx" },
      { old: "components/icons/DiscordIconSvg.tsx", new: "components/icons/discord-icon-svg.tsx" },
      { old: "components/icons/DocumentIcon.tsx", new: "components/icons/document-icon.tsx" },
      { old: "components/icons/EditIconSvg.tsx", new: "components/icons/edit-icon-svg.tsx" },
      { old: "components/icons/EndDateSvg.tsx", new: "components/icons/end-date-svg.tsx" },
      { old: "components/icons/FilterSvg.tsx", new: "components/icons/filter-svg.tsx" },
      { old: "components/icons/HomeSvg.tsx", new: "components/icons/home-svg.tsx" },
      { old: "components/icons/IconSliderSvg.tsx", new: "components/icons/icon-slider-svg.tsx" },
      { old: "components/icons/IncomeSvg.tsx", new: "components/icons/income-svg.tsx" },
      { old: "components/icons/InfoIcon.tsx", new: "components/icons/info-icon.tsx" },
      { old: "components/icons/InstagramIconSvg.tsx", new: "components/icons/instagram-icon-svg.tsx" },
      { old: "components/icons/KebitoWiseBudgetSvg.tsx", new: "components/icons/kebito-wise-budget-svg.tsx" },
      { old: "components/icons/KebitoWiseProjectSvg.tsx", new: "components/icons/kebito-wise-project-svg.tsx" },
      { old: "components/icons/KebitoWiseSuggestsSvg.tsx", new: "components/icons/kebito-wise-suggests-svg.tsx" },
      { old: "components/icons/KeboCongratulation.tsx", new: "components/icons/kebo-congratulation.tsx" },
      { old: "components/icons/KeboIconSvg.tsx", new: "components/icons/kebo-icon-svg.tsx" },
      { old: "components/icons/KeboSadIconSvg.tsx", new: "components/icons/kebo-sad-icon-svg.tsx" },
      { old: "components/icons/KeboSupportSvg.tsx", new: "components/icons/kebo-support-svg.tsx" },
      { old: "components/icons/KeboWise.tsx", new: "components/icons/kebo-wise.tsx" },
      { old: "components/icons/KeboWiseBudgetSvg.tsx", new: "components/icons/kebo-wise-budget-svg.tsx" },
      { old: "components/icons/KeboWiseProjectSvg.tsx", new: "components/icons/kebo-wise-project-svg.tsx" },
      { old: "components/icons/KeboWiseSuggestsSvg.tsx", new: "components/icons/kebo-wise-suggests-svg.tsx" },
      { old: "components/icons/KeboWiseThinkingSvg.tsx", new: "components/icons/kebo-wise-thinking-svg.tsx" },
      { old: "components/icons/LanguageIconSvg.tsx", new: "components/icons/language-icon-svg.tsx" },
      { old: "components/icons/ListIconSvg.tsx", new: "components/icons/list-icon-svg.tsx" },
      { old: "components/icons/MagicChatSvg.tsx", new: "components/icons/magic-chat-svg.tsx" },
      { old: "components/icons/ManualSvg.tsx", new: "components/icons/manual-svg.tsx" },
      { old: "components/icons/MoreIconSvg.tsx", new: "components/icons/more-icon-svg.tsx" },
      { old: "components/icons/NewAccountSvg.tsx", new: "components/icons/new-account-svg.tsx" },
      { old: "components/icons/NewCategoryIcon.tsx", new: "components/icons/new-category-icon.tsx" },
      { old: "components/icons/NewChatIconSvg.tsx", new: "components/icons/new-chat-icon-svg.tsx" },
      { old: "components/icons/NewChatSvg.tsx", new: "components/icons/new-chat-svg.tsx" },
      { old: "components/icons/NewsIconSvg.tsx", new: "components/icons/news-icon-svg.tsx" },
      { old: "components/icons/NoteSvg.tsx", new: "components/icons/note-svg.tsx" },
      { old: "components/icons/NotificacionIcon.tsx", new: "components/icons/notificacion-icon.tsx" },
      { old: "components/icons/OpinionsIconSvg.tsx", new: "components/icons/opinions-icon-svg.tsx" },
      { old: "components/icons/PencilSvg.tsx", new: "components/icons/pencil-svg.tsx" },
      { old: "components/icons/PlusSvg.tsx", new: "components/icons/plus-svg.tsx" },
      { old: "components/icons/ProfileKeboSvg.tsx", new: "components/icons/profile-kebo-svg.tsx" },
      { old: "components/icons/RecurrenceIconHomeSvg.tsx", new: "components/icons/recurrence-icon-home-svg.tsx" },
      { old: "components/icons/RecurrenceSvg.tsx", new: "components/icons/recurrence-svg.tsx" },
      { old: "components/icons/ReportsSvg.tsx", new: "components/icons/reports-svg.tsx" },
      { old: "components/icons/SearchSvg.tsx", new: "components/icons/search-svg.tsx" },
      { old: "components/icons/SendArrowSvg.tsx", new: "components/icons/send-arrow-svg.tsx" },
      { old: "components/icons/SettingsSvg.tsx", new: "components/icons/settings-svg.tsx" },
      { old: "components/icons/SpentSvg.tsx", new: "components/icons/spent-svg.tsx" },
      { old: "components/icons/StarCategoryIcon.tsx", new: "components/icons/star-category-icon.tsx" },
      { old: "components/icons/TranferSvg.tsx", new: "components/icons/tranfer-svg.tsx" },
      { old: "components/icons/TrashSvg.tsx", new: "components/icons/trash-svg.tsx" },
      { old: "components/icons/UserSvg.tsx", new: "components/icons/user-svg.tsx" },
    ],
    dirs: [],
  },

  "components-common": {
    files: [
      { old: "components/common/AppIcons.tsx", new: "components/common/app-icons.tsx" },
      { old: "components/common/BudgetIntroSlider.tsx", new: "components/common/budget-intro-slider.tsx" },
      { old: "components/common/CalendarPicker.tsx", new: "components/common/calendar-picker.tsx" },
      { old: "components/common/CalendarRangePicker.tsx", new: "components/common/calendar-range-picker.tsx" },
      { old: "components/common/CategoriesList.tsx", new: "components/common/categories-list.tsx" },
      { old: "components/common/CategoriesListBudget.tsx", new: "components/common/categories-list-budget.tsx" },
      { old: "components/common/CategoryItem.tsx", new: "components/common/category-item.tsx" },
      { old: "components/common/ChatEmpty.tsx", new: "components/common/chat-empty.tsx" },
      { old: "components/common/ChatHeader.tsx", new: "components/common/chat-header.tsx" },
      { old: "components/common/ChatInput.tsx", new: "components/common/chat-input.tsx" },
      { old: "components/common/ChatMessage.tsx", new: "components/common/chat-message.tsx" },
      { old: "components/common/CurrencyFormatter.tsx", new: "components/common/currency-formatter.tsx" },
      { old: "components/common/CustomAlert.tsx", new: "components/common/custom-alert.tsx" },
      { old: "components/common/CustomBankModal.tsx", new: "components/common/custom-bank-modal.tsx" },
      { old: "components/common/CustomBarCategory.tsx", new: "components/common/custom-bar-category.tsx" },
      { old: "components/common/CustomBarIncome.tsx", new: "components/common/custom-bar-income.tsx" },
      { old: "components/common/CustomBudgetCard.tsx", new: "components/common/custom-budget-card.tsx" },
      { old: "components/common/CustomBudgetCategoryCard.tsx", new: "components/common/custom-budget-category-card.tsx" },
      { old: "components/common/CustomBudgetCategoryModal.tsx", new: "components/common/custom-budget-category-modal.tsx" },
      { old: "components/common/CustomBudgetItem.tsx", new: "components/common/custom-budget-item.tsx" },
      { old: "components/common/CustomButton.tsx", new: "components/common/custom-button.tsx" },
      { old: "components/common/CustomButtonDisabled.tsx", new: "components/common/custom-button-disabled.tsx" },
      { old: "components/common/CustomCategoryModal.tsx", new: "components/common/custom-category-modal.tsx" },
      { old: "components/common/CustomCheckBox.tsx", new: "components/common/custom-check-box.tsx" },
      { old: "components/common/CustomDiveder.tsx", new: "components/common/custom-diveder.tsx" },
      { old: "components/common/CustomFilterModal.tsx", new: "components/common/custom-filter-modal.tsx" },
      { old: "components/common/CustomHeader.tsx", new: "components/common/custom-header.tsx" },
      { old: "components/common/CustomHeaderSecondary.tsx", new: "components/common/custom-header-secondary.tsx" },
      { old: "components/common/CustomIconModal.tsx", new: "components/common/custom-icon-modal.tsx" },
      { old: "components/common/CustomInput.tsx", new: "components/common/custom-input.tsx" },
      { old: "components/common/CustomListItemOption.tsx", new: "components/common/custom-list-item-option.tsx" },
      { old: "components/common/CustomModal.tsx", new: "components/common/custom-modal.tsx" },
      { old: "components/common/CustomModalReview.tsx", new: "components/common/custom-modal-review.tsx" },
      { old: "components/common/CustomMonthCarousel.tsx", new: "components/common/custom-month-carousel.tsx" },
      { old: "components/common/CustomMonthModal.tsx", new: "components/common/custom-month-modal.tsx" },
      { old: "components/common/CustomReportCard.tsx", new: "components/common/custom-report-card.tsx" },
      { old: "components/common/CustomReportDay.tsx", new: "components/common/custom-report-day.tsx" },
      { old: "components/common/CustomReportYear.tsx", new: "components/common/custom-report-year.tsx" },
      { old: "components/common/CustomSegmentedControl.tsx", new: "components/common/custom-segmented-control.tsx" },
      { old: "components/common/CustomSlider.tsx", new: "components/common/custom-slider.tsx" },
      { old: "components/common/CustomTypeModal.tsx", new: "components/common/custom-type-modal.tsx" },
      { old: "components/common/DeleteAccountModal.tsx", new: "components/common/delete-account-modal.tsx" },
      { old: "components/common/FilterButton.tsx", new: "components/common/filter-button.tsx" },
      { old: "components/common/FormattedNumberInput.tsx", new: "components/common/formatted-number-input.tsx" },
      { old: "components/common/KeboAdvice.tsx", new: "components/common/kebo-advice.tsx" },
      { old: "components/common/MultiCategoryModal.tsx", new: "components/common/multi-category-modal.tsx" },
      { old: "components/common/ProgressBar.tsx", new: "components/common/progress-bar.tsx" },
      { old: "components/common/ReviewModalTest.tsx", new: "components/common/review-modal-test.tsx" },
      { old: "components/common/TooltipOverlay.tsx", new: "components/common/tooltip-overlay.tsx" },
      { old: "components/common/TransactionsList.tsx", new: "components/common/transactions-list.tsx" },
      { old: "components/common/TypingDots.tsx", new: "components/common/typing-dots.tsx" },
    ],
    dirs: [],
  },

  "components-transaction": {
    files: [
      { old: "components/transaction/AmountDisplay.tsx", new: "components/transaction/amount-display.tsx" },
      { old: "components/transaction/InlineCategoryPicker.tsx", new: "components/transaction/inline-category-picker.tsx" },
      { old: "components/transaction/NumberPad.tsx", new: "components/transaction/number-pad.tsx" },
      { old: "components/transaction/TransactionContentContainer.tsx", new: "components/transaction/transaction-content-container.tsx" },
      { old: "components/transaction/TransactionFieldRow.tsx", new: "components/transaction/transaction-field-row.tsx" },
      { old: "components/transaction/TransactionTypeToggle.tsx", new: "components/transaction/transaction-type-toggle.tsx" },
    ],
    dirs: [],
  },

  "components-root": {
    files: [
      { old: "components/AccountBalanceInput.tsx", new: "components/account-balance-input.tsx" },
      { old: "components/AuthButton.tsx", new: "components/auth-button.tsx" },
      { old: "components/FixedScreen.tsx", new: "components/fixed-screen.tsx" },
      { old: "components/InputAmount.tsx", new: "components/input-amount.tsx" },
      { old: "components/InputAmountBudget.tsx", new: "components/input-amount-budget.tsx" },
      { old: "components/ModalAccountType.tsx", new: "components/modal-account-type.tsx" },
      { old: "components/Screen.tsx", new: "components/screen.tsx" },
      { old: "components/SelectionModal.tsx", new: "components/selection-modal.tsx" },
      { old: "components/Tooltip.tsx", new: "components/tooltip.tsx" },
      // Files inside directories (rename in-place first, dir rename handles the rest)
      { old: "components/SwipeableList/SwipeableList.tsx", new: "components/SwipeableList/swipeable-list.tsx" },
      { old: "components/SwipeableListWrapper/SwipeableListWrapper.tsx", new: "components/SwipeableListWrapper/swipeable-list-wrapper.tsx" },
    ],
    dirs: [
      { old: "components/SwipeableList", new: "components/swipeable-list" },
      { old: "components/SwipeableListWrapper", new: "components/swipeable-list-wrapper" },
    ],
  },

  "components-assets": {
    files: [
      { old: "components/assets/Icon.tsx", new: "components/assets/icon.tsx" },
      { old: "components/assets/Image.tsx", new: "components/assets/image.tsx" },
    ],
    dirs: [],
  },

  screens: {
    files: [
      // Rename files in-place within old directories first; dir rename handles the rest
      { old: "screens/AccountBalanceScreen/AccountBalanceScreen.tsx", new: "screens/AccountBalanceScreen/account-balance-screen.tsx" },
      { old: "screens/AccountsScreen/AccountsScreen.tsx", new: "screens/AccountsScreen/accounts-screen.tsx" },
      { old: "screens/BannerFeaturesScreen/BannerFeaturesScreen.tsx", new: "screens/BannerFeaturesScreen/banner-features-screen.tsx" },
      { old: "screens/BudgetDetailScreen/BudgetDetailScreen.tsx", new: "screens/BudgetDetailScreen/budget-detail-screen.tsx" },
      { old: "screens/BudgetOnboardingScreen/BudgetOnboardingScreen.tsx", new: "screens/BudgetOnboardingScreen/budget-onboarding-screen.tsx" },
      { old: "screens/BudgetScreen/BudgetScreen.tsx", new: "screens/BudgetScreen/budget-screen.tsx" },
      { old: "screens/BudgetsScreen/BudgetsScreen.tsx", new: "screens/BudgetsScreen/budgets-screen.tsx" },
      { old: "screens/ChatbotScreen/ChatbotScreen.tsx", new: "screens/ChatbotScreen/chatbot-screen.tsx" },
      { old: "screens/CountryScreen/CountryScreen.tsx", new: "screens/CountryScreen/country-screen.tsx" },
      { old: "screens/CreateBudgetCategoryScreen/CreateBudgetCategoryScreen.tsx", new: "screens/CreateBudgetCategoryScreen/create-budget-category-screen.tsx" },
      { old: "screens/EditAccountScreen/EditAccountScreen.tsx", new: "screens/EditAccountScreen/edit-account-screen.tsx" },
      { old: "screens/EditProfileScreen/EditProfileScreen.tsx", new: "screens/EditProfileScreen/edit-profile-screen.tsx" },
      { old: "screens/EditTransactionScreen/EditTransactionScreen.tsx", new: "screens/EditTransactionScreen/edit-transaction-screen.tsx" },
      { old: "screens/ErrorScreen/ErrorBoundary.tsx", new: "screens/ErrorScreen/error-boundary.tsx" },
      { old: "screens/ErrorScreen/ErrorDetails.tsx", new: "screens/ErrorScreen/error-details.tsx" },
      { old: "screens/HomeScreen/HomeScreen.tsx", new: "screens/HomeScreen/home-screen.tsx" },
      { old: "screens/LanguageScreen/LanguageScreen.tsx", new: "screens/LanguageScreen/language-screen.tsx" },
      { old: "screens/ListBankScreen/ListBankScreen.tsx", new: "screens/ListBankScreen/list-bank-screen.tsx" },
      { old: "screens/NewBudgetScreen/NewBudgetScreen.tsx", new: "screens/NewBudgetScreen/new-budget-screen.tsx" },
      { old: "screens/NewCategoryScreen/NewCategoryScreen.tsx", new: "screens/NewCategoryScreen/new-category-screen.tsx" },
      { old: "screens/NumberFormatScreen/NumberFormatScreen.tsx", new: "screens/NumberFormatScreen/number-format-screen.tsx" },
      { old: "screens/ProfileScreen/ProfileScreen.tsx", new: "screens/ProfileScreen/profile-screen.tsx" },
      { old: "screens/ReportsCategoryScreen/ReportsCategoryScreen.tsx", new: "screens/ReportsCategoryScreen/reports-category-screen.tsx" },
      { old: "screens/ReportsIncomeScreen/ReportsIncomeScreen.tsx", new: "screens/ReportsIncomeScreen/reports-income-screen.tsx" },
      { old: "screens/ReportsScreen/ReportsScreen.tsx", new: "screens/ReportsScreen/reports-screen.tsx" },
      { old: "screens/SelectBankScreen/SelectBankScreen.tsx", new: "screens/SelectBankScreen/select-bank-screen.tsx" },
      { old: "screens/SelectBankTypeScreen/SelectBankTypeScreen.tsx", new: "screens/SelectBankTypeScreen/select-bank-type-screen.tsx" },
      { old: "screens/SplashScreen/SplashScreen.tsx", new: "screens/SplashScreen/splash-screen.tsx" },
      { old: "screens/TransactionScreen/TransactionScreen.tsx", new: "screens/TransactionScreen/transaction-screen.tsx" },
      { old: "screens/TransactionsScreen/TransactionsScreen.tsx", new: "screens/TransactionsScreen/transactions-screen.tsx" },
      { old: "screens/WebViewScreen/WebViewScreen.tsx", new: "screens/WebViewScreen/web-view-screen.tsx" },
      { old: "screens/WelcomeScreen/WelcomeScreen.tsx", new: "screens/WelcomeScreen/welcome-screen.tsx" },
    ],
    dirs: [
      { old: "screens/AccountBalanceScreen", new: "screens/account-balance-screen" },
      { old: "screens/AccountsScreen", new: "screens/accounts-screen" },
      { old: "screens/BannerFeaturesScreen", new: "screens/banner-features-screen" },
      { old: "screens/BudgetDetailScreen", new: "screens/budget-detail-screen" },
      { old: "screens/BudgetOnboardingScreen", new: "screens/budget-onboarding-screen" },
      { old: "screens/BudgetScreen", new: "screens/budget-screen" },
      { old: "screens/BudgetsScreen", new: "screens/budgets-screen" },
      { old: "screens/ChatbotScreen", new: "screens/chatbot-screen" },
      { old: "screens/CountryScreen", new: "screens/country-screen" },
      { old: "screens/CreateBudgetCategoryScreen", new: "screens/create-budget-category-screen" },
      { old: "screens/EditAccountScreen", new: "screens/edit-account-screen" },
      { old: "screens/EditProfileScreen", new: "screens/edit-profile-screen" },
      { old: "screens/EditTransactionScreen", new: "screens/edit-transaction-screen" },
      { old: "screens/ErrorScreen", new: "screens/error-screen" },
      { old: "screens/HomeScreen", new: "screens/home-screen" },
      { old: "screens/LanguageScreen", new: "screens/language-screen" },
      { old: "screens/ListBankScreen", new: "screens/list-bank-screen" },
      { old: "screens/NewBudgetScreen", new: "screens/new-budget-screen" },
      { old: "screens/NewCategoryScreen", new: "screens/new-category-screen" },
      { old: "screens/NumberFormatScreen", new: "screens/number-format-screen" },
      { old: "screens/ProfileScreen", new: "screens/profile-screen" },
      { old: "screens/ReportsCategoryScreen", new: "screens/reports-category-screen" },
      { old: "screens/ReportsIncomeScreen", new: "screens/reports-income-screen" },
      { old: "screens/ReportsScreen", new: "screens/reports-screen" },
      { old: "screens/SelectBankScreen", new: "screens/select-bank-screen" },
      { old: "screens/SelectBankTypeScreen", new: "screens/select-bank-type-screen" },
      { old: "screens/SplashScreen", new: "screens/splash-screen" },
      { old: "screens/TransactionScreen", new: "screens/transaction-screen" },
      { old: "screens/TransactionsScreen", new: "screens/transactions-screen" },
      { old: "screens/WebViewScreen", new: "screens/web-view-screen" },
      { old: "screens/WelcomeScreen", new: "screens/welcome-screen" },
    ],
  },
}

// ─── Import Replacement Logic ─────────────────────────────────────────────────

function buildReplacementPairs(category) {
  const pairs = []
  const cat = CATEGORIES[category]

  // Build a map of directory renames for computing final import paths
  const dirRenameMap = new Map()
  for (const { old: oldDir, new: newDir } of cat.dirs) {
    dirRenameMap.set(oldDir, newDir)
  }

  for (const { old: oldPath, new: newPath } of cat.files) {
    const oldBase = oldPath.replace(/\.(tsx?|native\.tsx?)$/, "")
    let newBase = newPath.replace(/\.(tsx?|native\.tsx?)$/, "")

    // Apply directory renames to compute the final import path
    // e.g., "screens/AccountBalanceScreen/account-balance-screen" →
    //        "screens/account-balance-screen/account-balance-screen"
    for (const [oldDir, newDir] of dirRenameMap) {
      if (newBase.startsWith(oldDir + "/")) {
        newBase = newDir + newBase.slice(oldDir.length)
        break
      }
    }

    if (oldBase === newBase) continue

    // For platform-specific files like gestureHandler.native.ts
    const oldImport = oldBase.replace(/\.native$/, "")
    const newImport = newBase.replace(/\.native$/, "")

    if (oldImport === newImport) continue

    const oldFilename = basename(oldImport)
    const newFilename = basename(newImport)

    pairs.push({
      oldAbsolute: `@/${oldImport}`,
      newAbsolute: `@/${newImport}`,
      oldFilename,
      newFilename,
      oldDir: dirname(oldPath),
      newDir: dirname(newBase),
    })
  }

  // Also handle directory renames in imports (for path prefix replacements)
  for (const { old: oldDir, new: newDir } of cat.dirs) {
    pairs.push({
      oldDirPath: `@/${oldDir}`,
      newDirPath: `@/${newDir}`,
      isDirOnly: true,
    })
  }

  return pairs
}

function getAllTsFiles() {
  const result = run('find apps/mobile -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .expo | sort')
  return result.split("\n").filter(Boolean)
}

function updateImportsInFile(filePath, pairs, dryRun) {
  const absPath = join(ROOT, filePath)
  let content = readFileSync(absPath, "utf-8")
  let original = content
  let changeCount = 0

  for (const pair of pairs) {
    if (pair.isDirOnly) {
      // Replace directory references in imports like @/screens/HomeScreen/
      // This handles cases like: from "@/screens/HomeScreen/HomeScreen"
      // The file part is handled by file pairs, but we need dir part too
      const oldDirEscaped = pair.oldDirPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const regex = new RegExp(`(from\\s+["'])(${oldDirEscaped})(/|["'])`, "g")
      const newContent = content.replace(regex, `$1${pair.newDirPath}$3`)
      if (newContent !== content) {
        changeCount += (content.match(regex) || []).length
        content = newContent
      }
      continue
    }

    // 1. Replace @/ absolute imports
    //    e.g., from "@/services/AccountService" → from "@/services/account-service"
    const oldAbsEscaped = pair.oldAbsolute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const absRegex = new RegExp(`(["'])${oldAbsEscaped}(["'])`, "g")
    const newAbsContent = content.replace(absRegex, `$1${pair.newAbsolute}$2`)
    if (newAbsContent !== content) {
      changeCount += (content.match(absRegex) || []).length
      content = newAbsContent
    }

    // 2. Replace relative imports (./filename or ../dir/filename patterns)
    //    e.g., from "./AccountService" → from "./account-service"
    //    or:   from "../helpers/useStores" → from "../helpers/use-stores"
    const oldFilenameEscaped = pair.oldFilename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const relRegex = new RegExp(`(["'](?:\\.{1,2}/(?:[^"']*/)?))(${oldFilenameEscaped})(["'])`, "g")
    const newRelContent = content.replace(relRegex, `$1${pair.newFilename}$3`)
    if (newRelContent !== content) {
      changeCount += (content.match(relRegex) || []).length
      content = newRelContent
    }
  }

  if (content !== original) {
    if (!dryRun) {
      writeFileSync(absPath, content, "utf-8")
    }
    return changeCount
  }
  return 0
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const categoryFlag = args.indexOf("--category")
const dryRun = args.includes("--dry-run")

if (categoryFlag === -1 || !args[categoryFlag + 1]) {
  console.error("Usage: node scripts/rename-to-kebab.mjs --category <name> [--dry-run]")
  console.error(`Available categories: ${Object.keys(CATEGORIES).join(", ")}`)
  process.exit(1)
}

const category = args[categoryFlag + 1]
if (!CATEGORIES[category]) {
  console.error(`Unknown category: ${category}`)
  console.error(`Available categories: ${Object.keys(CATEGORIES).join(", ")}`)
  process.exit(1)
}

const cat = CATEGORIES[category]
const pairs = buildReplacementPairs(category)

console.log(`\n${"=".repeat(60)}`)
console.log(`${dryRun ? "[DRY RUN] " : ""}Renaming category: ${category}`)
console.log(`${"=".repeat(60)}\n`)

// Step 1: Rename files (must happen BEFORE directory renames)
console.log(`--- File renames (${cat.files.length}) ---`)
let renamedFiles = 0
for (const { old: oldPath, new: newPath } of cat.files) {
  if (oldPath === newPath) continue
  const absOld = join("apps/mobile", oldPath)
  const absNew = join("apps/mobile", newPath)

  // Check if old file actually exists (for dry-run validation)
  if (!existsSync(join(ROOT, absOld))) {
    console.log(`  [skip] ${absOld} does not exist`)
    continue
  }

  gitMvTwoStep(absOld, absNew, dryRun)
  renamedFiles++
}

// Step 2: Rename directories (after files have been moved)
if (cat.dirs.length > 0) {
  console.log(`\n--- Directory renames (${cat.dirs.length}) ---`)
  for (const { old: oldDir, new: newDir } of cat.dirs) {
    if (oldDir === newDir) continue
    const absOld = join("apps/mobile", oldDir)
    const absNew = join("apps/mobile", newDir)

    if (!existsSync(join(ROOT, absOld))) {
      console.log(`  [skip] ${absOld} does not exist`)
      continue
    }

    gitMvDirTwoStep(absOld, absNew, dryRun)
  }
}

// Step 3: Update imports across all .ts/.tsx files
console.log(`\n--- Import updates ---`)
const tsFiles = getAllTsFiles()
let totalImportUpdates = 0
let filesWithUpdates = 0

for (const filePath of tsFiles) {
  const count = updateImportsInFile(filePath, pairs, dryRun)
  if (count > 0) {
    totalImportUpdates += count
    filesWithUpdates++
    if (dryRun) {
      console.log(`  [update] ${filePath} (${count} import${count > 1 ? "s" : ""})`)
    }
  }
}

console.log(`\n${"=".repeat(60)}`)
console.log(`Summary:`)
console.log(`  Files renamed: ${renamedFiles}`)
console.log(`  Files with import updates: ${filesWithUpdates}`)
console.log(`  Total import replacements: ${totalImportUpdates}`)
console.log(`${"=".repeat(60)}\n`)

if (dryRun) {
  console.log("This was a dry run. No files were changed.")
  console.log("Run without --dry-run to apply changes.")
}
