import { useState, useCallback } from "react";
import {
  checkReviewEligibility,
  type ReviewEligibility,
} from "@/lib/api/hooks/use-reviews";
import { translate } from "@/i18n";
import { AnalyticsService } from "@/services/analytics-service";
import logger from "@/utils/logger";

const analytics = new AnalyticsService();

let _hasCheckedThisSession = false;

export function resetReviewEligibility() {
  _hasCheckedThisSession = false;
}

export const useReviewModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [eligibilityData, setEligibilityData] =
    useState<ReviewEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkEligibility = useCallback(async () => {
    if (_hasCheckedThisSession) return false;
    _hasCheckedThisSession = true;

    try {
      setIsLoading(true);

      const data = await checkReviewEligibility();

      const eventProps = {
        transaction_count: data?.transactionCount,
        milestone: data?.currentMilestone,
        account_age_days: data?.accountAgeDays,
        user_segment: data?.currentMilestone === 1 ? "new_user" : "established_user",
      };

      if (data?.eligible) {
        analytics.trackEvent("review_gate_eligible", eventProps);
        setEligibilityData(data);
        setIsVisible(true);
        analytics.trackEvent("review_gate_shown", eventProps);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error checking review modal eligibility:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsVisible(false);
    setEligibilityData(null);
  }, []);

  const handleConfirm = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const getModalTexts = useCallback(() => {
    return {
      title: translate("customModalReview:title"),
      message: translate("customModalReview:message"),
      confirmText: translate("customModalReview:confirm"),
      cancelText: translate("customModalReview:cancel"),
    };
  }, []);

  return {
    isVisible,
    eligibilityData,
    isLoading,
    checkEligibility,
    closeModal,
    handleConfirm,
    handleCancel,
    getModalTexts,
  };
};
