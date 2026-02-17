export type UISize = "xs" | "sm" | "md" | "lg" | "xl";

export type UIRadius = "none" | "sm" | "md" | "lg" | "full";

export const RADIUS_VALUES: Record<UIRadius, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export type ButtonVariant = "solid" | "outline" | "soft" | "link";

export type ButtonColor = "primary" | "secondary" | "danger" | "neutral";

export interface ColorConfig {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
}
