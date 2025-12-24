export interface Asset {
  url: string;
  type: string;
}

export interface CTA {
  link: string;
  text: string;
}

export interface BannerSlide {
  title: string;
  subtitle?: string;
  description?: string;
  asset: Asset;
  cta?: CTA;
}

export interface Banner {
  type: string;
  slides: BannerSlide[];
  visible_to_existing_users_only: boolean;
  visible: boolean;
  language: string;
  app_version: string;
  created_at: string;
  updated_at: string;
}

export interface DynamicBanner {
  id: string;
  banner: Banner;
}

export interface BannerContent {
  version: string;
  app_version: string;
  type: "new-version";
  slides: BannerSlide[];
  visible_to_existing_users_only: boolean;
}
