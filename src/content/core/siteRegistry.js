//
// MiddleClick Everywhere
// Global Sites Registry (manual imports version)
//
// This connects all sites + their features into the engine.
// To add a new feature, just import it below and add it to featuresBySite.
//

import { createDomainSiteModule } from "./siteFactory.js";

// ------------------------------------------------------
//  MANUAL FEATURE IMPORTS
// ------------------------------------------------------

// YouTube features
import * as youtubeSearchButton from "../sites/youtube/search-button/index.js";
import * as youtubeSearchSuggestions from "../sites/youtube/search-suggestions/index.js";

// Map site -> array of feature modules
const featuresBySite = {
  youtube: [youtubeSearchButton, youtubeSearchSuggestions],
};

// ------------------------------------------------------
//  PER-SITE CONFIG
// ------------------------------------------------------
const siteConfigs = {
  youtube: {
    domainSubstring: "youtube.com",
    // logName: "YT",
  },

  // Example for future sites:
  // google: {
  //   domainSubstring: "google.com",
  //   logName: "Google",
  // },
};

// ------------------------------------------------------
//  BUILD ALL SITE MODULES
// ------------------------------------------------------
export const allSites = Object.entries(siteConfigs).map(([siteId, config]) => {
  const logName = config.logName || siteId;
  const logPrefix = `[MiddleClick Everywhere - ${logName}][site]`;
  const features = featuresBySite[siteId] || [];

  return createDomainSiteModule({
    id: siteId,
    domainSubstring: config.domainSubstring,
    features,
    logPrefix,
  });
});
