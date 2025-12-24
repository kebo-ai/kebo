import { supabase } from "../config/supabase";
import { translate } from "../i18n";
import logger from "../utils/logger";

interface ChatResponse {
  content: string;
  error?: string;
  rawResponse?: any;
}

export class ChatService {
  private static apiUrl = process.env.EXPO_PUBLIC_BACKEND_API_URL;
  private static apiKey = process.env.EXPO_PUBLIC_BACKEND_API_KEY;

  static async sendMessage(
    message: string,
    stream: boolean = false
  ): Promise<ChatResponse> {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        logger.error("Error getting session:", sessionError);
        return {
          content: translate("chatService:errorSession"),
          error: sessionError?.message || "No session found",
        };
      }

      const accessToken = sessionData.session.access_token;
      logger.debug("Access token available:", !!accessToken);

      if (!this.apiKey) {
        logger.error("API key is missing");
        return {
          content: translate("chatService:errorToken"),
          error: "Missing API key",
        };
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          message,
          stream,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("API Response Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      logger.debug("API Response data:", data);

      return {
        content:
          data.message || data.content || data.response || JSON.stringify(data),
        rawResponse: data,
      };
    } catch (error) {
      logger.error("Error in ChatService.sendMessage:", error);
      return {
        content: translate("chatService:errorChat"),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const createReportThread = async (report:{
  message: string,
  report_message: string
}) => {
  try {
    const { data, error } = await supabase
      .from("ai_report")
      .insert([
        report
      ])
      .select()  
      .single(); 

    if (error) {
      logger.error("Error inserting report:", error.message);
      return null;
    }
    
    logger.info("Report created successfully:", data);
    return data;
  } catch (error) {
    logger.error("Unexpected error creating report:", error);
    return null;
  }
};
