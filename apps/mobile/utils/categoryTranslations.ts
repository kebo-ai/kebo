import logger from "./logger";
import { translate } from "@/i18n";

const ICON_URLS: { [url: string]: string } = {
  "/storage/v1/object/public/categories/category__ahorro.svg": "savings",
  "/storage/v1/object/public/categories/category__entretenimiento.svg":
    "entertainment",
  "/storage/v1/object/public/categories/category__otros_gastos.svg":
    "otherExpenses",
  "/storage/v1/object/public/categories/category__prestamos.svg": "loan",
  "/storage/v1/object/public/categories/category__salud.svg": "health",
  "/storage/v1/object/public/categories/category__transporte.svg":
    "transport",
  "/storage/v1/object/public/categories/category__viajes.svg": "travel",
  "/storage/v1/object/public/categories/category__transfer.svg": "transfer",
  "/storage/v1/object/public/categories/category__salario.svg": "salary",
  "/storage/v1/object/public/categories/category__educacion.svg": "education",
  "/storage/v1/object/public/categories/category__impuestos.svg": "taxes",
  "/storage/v1/object/public/categories/category__mascotas.svg": "pets",
  "/storage/v1/object/public/categories/category__alimentacion.svg": "food",
};

function normalizeSlashes(url: string): string {
  return url.replace(/\/{2,}/g, "/");
}

function getTranslationKeyFromIconUrl(iconUrl?: string): string | undefined {
  if (!iconUrl) return undefined;
  const normalizedIconUrl = normalizeSlashes(iconUrl);
  for (const url in ICON_URLS) {
    if (normalizedIconUrl.endsWith(normalizeSlashes(url))) {
      return ICON_URLS[url];
    }
  }
  return undefined;
}

export const translateCategoryName = (
  name: string | undefined | null,
  id?: string,
  category_icon_url?: string
): string => {
  if (!name) return translate("homeScreen:noCategory");

  try {
    const iconKey = getTranslationKeyFromIconUrl(category_icon_url);
    if (iconKey) {
      const translationKey = `categoriesModal:${iconKey}`;
      const translatedName = translate(translationKey as any);
      return translatedName === translationKey ? name : translatedName;
    }
  } catch (error) {
    logger.warn("Error translating category name:", error);
  }

  return name;
};
