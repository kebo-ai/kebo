import { useState, useCallback } from "react";
import {
  ReviewService,
  RatingModalEligibilityResponse,
} from "@/services/ReviewService";
import { translate } from "@/i18n";
import { loadString, saveString } from "@/utils/storage/storage";
import { REVIEW_MODAL_SHOULD_SHOW } from "@/utils/storage/storage-keys";
import logger from "@/utils/logger";

export const useReviewModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [eligibilityData, setEligibilityData] =
    useState<RatingModalEligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkEligibility = useCallback(async () => {
    try {
      setIsLoading(true);

      const cachedShouldShow = await loadString(REVIEW_MODAL_SHOULD_SHOW);

      if (cachedShouldShow === "false") {
        logger.debug(
          "Review modal should_show is cached as false, skipping RPC call"
        );
        return false;
      }

      const data = await ReviewService.checkRatingModalEligibility();

      if (data) {
        await saveString(REVIEW_MODAL_SHOULD_SHOW, data.should_show.toString());

        if (data.should_show) {
          setEligibilityData(data);
          setIsVisible(true);
          return true;
        }
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
