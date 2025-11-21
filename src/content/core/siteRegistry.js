//
// MiddleClick Everywhere
// Global Sites Registry (auto-discovery version)
//
// This file connects all sites + their features into the engine.
//
// Contributors usually DO NOT need to touch this file.
//
// To add a new feature for an existing site:
//   1) Create: src/content/sites/<site-name>/<feature>/index.js
//   2) Export a feature module from that file.
//      (See existing sites for examples.)
//
// To add a brand-new site:
//   1) Create folders and features under src/content/sites/<site-name>/...
//   2) Add a small entry to `siteConfigs` below with its domainSubstring.
//   3) Done! The rest is auto-wired.
//

import { createDomainSiteModule } from "./siteFactory.js";

//
// ------------------------------------------------------
//  AUTO-IMPORT ALL FEATURES
//  (Requires Vite / Rollup-style bundler: import.meta.glob)
// ------------------------------------------------------
//
// This grabs every file matching:
//   ../sites/<site>/<feature>/index.js
//
// Example paths:
//   "../sites/youtube/search-button/index.js"
//   "../sites/youtube/search-suggestions/index.js"
//

const featureModules = import.meta.glob("../sites/*/*/index.js", {
  eager: true,
});

// Group features by top-level site folder name
//   path: "../sites/youtube/search-button/index.js"
//   siteId: "youtube"
const featuresBySite = {};

for (const [path, mod] of Object.entries(featureModules)) {
  const parts = path.split("/"); // ["..", "sites", "youtube", "search-button", "index.js"]
  const sitesIndex = parts.indexOf("sites");
  const siteId = parts[sitesIndex + 1];

  if (!featuresBySite[siteId]) {
    featuresBySite[siteId] = [];
  }

  featuresBySite[siteId].push(mod);
}

// Optional: keep features in stable order by path
for (const siteId of Object.keys(featuresBySite)) {
  featuresBySite[siteId].sort((a, b) => {
    const pathA = Object.entries(featureModules).find(([, m]) => m === a)?.[0] ?? "";
    const pathB = Object.entries(featureModules).find(([, m]) => m === b)?.[0] ?? "";
    return pathA.localeCompare(pathB);
  });
}

//
// ------------------------------------------------------
//  PER-SITE CONFIG
//  (Minimal info that cannot be guessed automatically)
// ------------------------------------------------------
//
// The ONLY thing collaborators might touch here is adding a new site id
// with its domainSubstring.
//
// For existing sites, adding new features requires ZERO edits here.
//

const siteConfigs = {
  youtube: {
    domainSubstring: "youtube.com",
    // You can optionally customize logging name if you ever want:
    // logName: "YT",
  },

  // Example for future sites:
  // google: {
  //   domainSubstring: "google.com",
  //   logName: "Google",
  // },
};

//
// ------------------------------------------------------
//  BUILD ALL SITE MODULES
// ------------------------------------------------------
//
// We auto-generate logPrefix from the site id (or optional logName).
//

export const allSites = Object.entries(featuresBySite)
  .filter(([siteId]) => siteConfigs[siteId]) // ignore folders without config
  .map(([siteId, features]) => {
    const config = siteConfigs[siteId];
    const logName = config.logName || siteId;
    const logPrefix = `[MiddleClick Everywhere - ${logName}][site]`;

    return createDomainSiteModule({
      id: siteId,
      domainSubstring: config.domainSubstring,
      features,
      logPrefix,
    });
  });

// If you ever want to temporarily disable a site entirely, you can filter it out here:
//   .filter(site => site.id !== "someSiteId");
