// ===============================
//  MiddleClick Everywhere
//  Content Script Engine
// ===============================
//
// Responsibilities:
//  - Check global "enabled" flag
//  - For each registered site:
//      * Check if it matches current URL
//      * Check per-site "enabled" flag
//      * Call site.init()
//  - All site plumbing (event listeners, feature dispatching)
//    is handled by siteFactory + the site modules.
//

import { getGlobalEnabled, getSiteEnabled } from "./storage.js";
import { allSites } from "./siteRegistry.js";


function debugLog(...args) {
  // Flip this to `false` if you want silence by default
  const ENABLE_DEBUG = true;
  if (!ENABLE_DEBUG) return;
  console.log("[MiddleClick Everywhere][engine]", ...args);
}

export async function initEngine() {
  try {
    const globallyEnabled = await getGlobalEnabled();
    debugLog("Global enabled state:", globallyEnabled);

    if (!globallyEnabled) {
      debugLog("Extension globally disabled, not initializing any sites.");
      return;
    }

    const loc = window.location;

    for (const site of allSites) {
      try {
        // 1) Does this site care about the current URL?
        const matches = site.match(loc);
        debugLog(`Checking site "${site.id}" match:`, matches);

        if (!matches) continue;

        // 2) Is this site enabled in storage?
        const siteEnabled = await getSiteEnabled(site.id);
        debugLog(`Site "${site.id}" enabled state:`, siteEnabled);

        if (siteEnabled === false) {
          debugLog(`Site "${site.id}" is disabled in user settings, skipping init.`);
          continue;
        }

        // 3) Initialize the site module
        debugLog(`Initializing site "${site.id}"...`);
        site.init();
      } catch (err) {
        console.error("[MiddleClick Everywhere][engine] Error for site:", site.id, err);
      }
    }
  } catch (err) {
    console.error("[MiddleClick Everywhere][engine] initEngine() top-level error:", err);
  }
}
