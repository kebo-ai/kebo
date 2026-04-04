import type { ExpoConfig } from "expo/config";

const staticConfig = require("./app.json") as { expo: ExpoConfig };

const config: ExpoConfig = {
  ...staticConfig.expo,
  plugins: [
    ...(staticConfig.expo.plugins || []),
    [
      "./plugins/with-app-groups",
      { groups: ["group.com.kebo.app.mobile"] },
    ],
    [
      "./plugins/with-app-intents-localization",
      { locales: ["en", "pt-BR"] },
    ],
  ],
};

export default { expo: config };
