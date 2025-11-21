// ===============================
//  MiddleClick Everywhere
//  Global Site Factory
// ===============================
//
// This file centralizes all the "plumbing" needed for any site module.
// Sites only provide:
//   - id:          "youtube"
//   - match(url):  function to detect when to run
//   - features:    array of feature objects exporting handleMouseDown / handleAuxClick
//
// Most sites should use createDomainSiteModule(), which makes index files tiny.
//

// ----------------------------------------
// Base site module constructor
// ----------------------------------------
export function createSiteModule({ id, match, features, logPrefix }) {
  let initialized = false;

  function debugLog(...args) {
    if (!logPrefix) return;
    console.log(logPrefix, ...args);
  }

  function onMouseDown(e) {
    // Only handle middle mouse (button 1)
    if (e.button !== 1) return;

    for (const feature of features) {
      if (typeof feature.handleMouseDown === "function") {
        try {
          const handled = feature.handleMouseDown(e);
          if (handled) {
            debugLog("mousedown handled by feature:", feature.name || "feature");
            return;
          }
        } catch (err) {
          console.error(logPrefix, "Feature handleMouseDown() error:", err);
        }
      }
    }
  }

  function onAuxClick(e) {
    // Only handle middle mouse (button 1)
    if (e.button !== 1) return;

    for (const feature of features) {
      if (typeof feature.handleAuxClick === "function") {
        try {
          const handled = feature.handleAuxClick(e);
          if (handled) {
            debugLog("auxclick handled by feature:", feature.name || "feature");
            return;
          }
        } catch (err) {
          console.error(logPrefix, "Feature handleAuxClick() error:", err);
        }
      }
    }
  }

  return {
    id,

    match(url) {
      try {
        return match(url);
      } catch (err) {
        console.error(logPrefix || "[MiddleClick Everywhere]", "match() error:", err);
        return false;
      }
    },

    init() {
      if (initialized) return;
      initialized = true;

      window.addEventListener("mousedown", onMouseDown, true);
      window.addEventListener("auxclick", onAuxClick, true);

      debugLog(
        "site module initialized with features:",
        features.map(f => f.name || "feature")
      );
    }
  };
}

// ----------------------------------------
// Helper for common cases:
// "Run this site when URL contains this substring"
// ----------------------------------------
export function createDomainSiteModule({ id, domainSubstring, features, logPrefix }) {
  const prefix = logPrefix || `[MiddleClick Everywhere - ${id}]`;

  return createSiteModule({
    id,
    features,
    logPrefix: prefix,

    match(url) {
      const href = typeof url === "string" ? url : (url && url.href) || "";
      return href.includes(domainSubstring);
    }
  });
}
