import { supabase } from "../config/supabase";
import { APP_VERSION } from "../config/config.base";
import { load, save } from "../utils/storage";
import {
  HAS_SEEN_BANNER,
  LAST_APP_VERSION,
} from "../utils/storage/storage-keys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logger from "../utils/logger";

interface BannerAsset {
  url: string;
  type: "svg" | "png" | "jpg";
}

interface BannerCTA {
  link: string;
  text: string;
}

interface BannerSlide {
  asset: BannerAsset;
  title: string;
  subtitle?: string;
  description: string;
  cta?: BannerCTA;
}

interface BannerContent {
  app_version: string;
  type: "new-version";
  slides: BannerSlide[];
  visible_to_existing_users_only: boolean;
}

interface DynamicBanner {
  id: string;
  banner: BannerContent;
  visible: boolean;
  language: string;
  app_version: string;
  created_at: string;
  updated_at: string;
}

export class BannerService {
  private static readonly BANNERS_TABLE = "dynamic_banners";

  private static getLanguageCode(fullCode: string): string {
    return fullCode.split("-")[0];
  }

  private static compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split(".").map(Number);
    const v2Parts = version2.split(".").map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;
      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
    }
    return 0;
  }

  static async shouldShowBanner(): Promise<boolean> {
    try {
      const hasSeenBanner = await load(HAS_SEEN_BANNER);
      const lastSeenVersion = (await load(LAST_APP_VERSION)) || "0.0.0";
      if (this.compareVersions(APP_VERSION, lastSeenVersion) > 0) {
        return true;
      }

      return !hasSeenBanner;
    } catch (error) {
      logger.error("[shouldShowBanner] Error:", error);
      return false;
    }
  }

  static async markBannerAsSeen(): Promise<void> {
    try {
      await save(LAST_APP_VERSION, APP_VERSION);
      await save(HAS_SEEN_BANNER, "true");
    } catch (error) {
      logger.error("[markBannerAsSeen] Error:", error);
    }
  }

  static async clearBannerStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([HAS_SEEN_BANNER, LAST_APP_VERSION]);
    } catch (error) {
      logger.error("[clearBannerStorage] Error:", error);
    }
  }

  static async getDynamicBanners(language: string): Promise<DynamicBanner[]> {
    const languageCode = this.getLanguageCode(language);

    try {
      let { data, error } = await supabase
        .from(this.BANNERS_TABLE)
        .select("*")
        .eq("language", languageCode)
        .eq("visible", true)
        .eq("app_version", APP_VERSION)
        .order("created_at", { ascending: false })
        .limit(5);

      if ((!data || data.length === 0) && error === null) {
        const { data: allBanners, error: allBannersError } = await supabase
          .from(this.BANNERS_TABLE)
          .select("*")
          .eq("language", languageCode)
          .eq("visible", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (allBannersError) {
          logger.error(
            "[getDynamicBanners] Error fetching all banners:",
            allBannersError
          );
          return [];
        }

        data =
          allBanners?.filter(
            (banner) =>
              this.compareVersions(APP_VERSION, banner.app_version) >= 0
          ) || [];
      }

      if (error) {
        logger.error("[getDynamicBanners] Error fetching:", error);
        return [];
      }

      if (!data?.length) {
        return [];
      }

      return data.filter(
        (banner) =>
          Array.isArray(banner.banner?.slides) &&
          banner.banner.slides.length > 0 &&
          banner.banner.slides.every(
            ({ asset, title, description }: BannerSlide) =>
              asset?.url && title && description
          )
      );
    } catch (err) {
      logger.error("[getDynamicBanners] Unexpected error:", err);
      return [];
    }
  }
}
