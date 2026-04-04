const { withXcodeProject } = require("expo/config-plugins");
const path = require("path");
const fs = require("fs");

function withAppIntentsLocalization(config, { locales }) {
  return withXcodeProject(config, (mod) => {
    const project = mod.modResults;
    const projectName = mod.modRequest.projectName;
    const iosDir = path.join(mod.modRequest.platformProjectRoot, projectName);

    // Ensure all locale directories and files exist
    for (const locale of locales) {
      const lprojDir = path.join(iosDir, `${locale}.lproj`);
      const stringsFile = path.join(lprojDir, "AppIntents.strings");

      if (!fs.existsSync(lprojDir)) fs.mkdirSync(lprojDir, { recursive: true });
      if (!fs.existsSync(stringsFile)) fs.writeFileSync(stringsFile, "");

      project.addKnownRegion(locale);
    }

    // Add the first locale file as a resource to create the variant group
    const firstLocale = locales[0];
    const firstFilePath = `${projectName}/${firstLocale}.lproj/AppIntents.strings`;
    const targetUuid = project.getFirstTarget().uuid;

    try {
      project.addResourceFile(firstFilePath, { variantGroup: true }, targetUuid);
    } catch {
      // File may already exist in the project
    }

    // Add remaining locales to the variant group
    for (let i = 1; i < locales.length; i++) {
      const filePath = `${projectName}/${locales[i]}.lproj/AppIntents.strings`;
      try {
        project.addResourceFile(filePath, { variantGroup: true }, targetUuid);
      } catch {
        // File may already exist in the project
      }
    }

    return mod;
  });
}

module.exports = withAppIntentsLocalization;
