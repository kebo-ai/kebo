import { supabase } from "@/config/supabase";
import logger from "@/utils/logger";

export interface RatingModalEligibilityResponse {
  should_show: boolean;
  transaction_count: number;
  current_milestone: number;
  last_shown_milestone: number;
  has_clicked: boolean;
}

export interface RatingModalClickResponse {
  success: boolean;
  action: string;
  message: string;
}

export type RatingModalAction = 'maybe_later' | 'love_it' | 'dismiss';

export class ReviewService {
  static async checkRatingModalEligibility(): Promise<RatingModalEligibilityResponse | null> {
    try {
      const { data, error } = await supabase.rpc('check_rating_modal_eligibility');

      if (error) {
        logger.error("Error calling check_rating_modal_eligibility RPC:", error);
        return null;
      }

      logger.debug("Rating modal eligibility response:", data);
      return data as RatingModalEligibilityResponse;
    } catch (error) {
      logger.error("Error checking rating modal eligibility:", error);
      return null;
    }
  }

  static async handleRatingModalClick(action: RatingModalAction): Promise<RatingModalClickResponse | null> {
    try {
      const { data, error } = await supabase.rpc('handle_rating_modal_click', {
        p_action: action
      });

      if (error) {
        logger.error("Error calling handle_rating_modal_click RPC:", error);
        return null;
      }

      logger.debug("Rating modal click response:", data);
      return data as RatingModalClickResponse;
    } catch (error) {
      logger.error("Error handling rating modal click:", error);
      return null;
    }
  }
}
