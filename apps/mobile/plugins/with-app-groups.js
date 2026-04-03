const { withEntitlementsPlist } = require("expo/config-plugins");

function withAppGroups(config, { groups }) {
  return withEntitlementsPlist(config, (mod) => {
    mod.modResults["com.apple.security.application-groups"] = groups;
    return mod;
  });
}

module.exports = withAppGroups;
