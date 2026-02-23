const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo: watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve packages from the mobile app's node_modules first, then the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Force all "react" imports to resolve from apps/mobile/node_modules/react (19.1.0),
// preventing the hoisted root react (19.2.3) from being picked up by dependencies
// like pressto that live in root node_modules.
const mobileReact = path.resolve(projectRoot, "node_modules/react");
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react") {
    return { type: "sourceFile", filePath: path.resolve(mobileReact, "index.js") };
  }
  if (moduleName.startsWith("react/")) {
    const subpath = moduleName.slice("react/".length);
    return { type: "sourceFile", filePath: path.resolve(mobileReact, subpath + ".js") };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
