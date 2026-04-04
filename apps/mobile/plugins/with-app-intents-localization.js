const { withXcodeProject } = require("expo/config-plugins");
const path = require("path");
const fs = require("fs");

function withAppIntentsLocalization(config, { locales }) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const projectName = mod.modRequest.projectName;
    const iosDir = path.join(mod.modRequest.platformProjectRoot, projectName);

    for (const locale of locales) {
      const lprojDir = path.join(iosDir, `${locale}.lproj`);
      const stringsFile = path.join(lprojDir, "AppIntents.strings");

      if (!fs.existsSync(lprojDir)) fs.mkdirSync(lprojDir, { recursive: true });
      if (!fs.existsSync(stringsFile)) fs.writeFileSync(stringsFile, "");

      // Add variant group reference if not already present
      const groupKey = project.findPBXVariantGroupKey({ name: "AppIntents.strings" });
      if (!groupKey) {
        project.addKnownRegion(locale);
        project.addResourceFile(
          `${projectName}/${locale}.lproj/AppIntents.strings`,
          { variantGroup: true },
          project.getFirstTarget().uuid
        );
      } else {
        project.addKnownRegion(locale);
        project.addResourceFile(
          `${projectName}/${locale}.lproj/AppIntents.strings`,
          { variantGroup: true },
          project.getFirstTarget().uuid
        );
      }
    }

    return mod;
  });
}

module.exports = withAppIntentsLocalization;
