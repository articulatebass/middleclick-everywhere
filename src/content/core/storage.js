// ===============================
//  MiddleClick Everywhere
//  Storage Helpers (MV3)
// ===============================
//
// Handles:
//   - Global "enabled" state
//   - Per-site enabled state
//
// Stored structure:
//   {
//     enabled: true,
//     siteEnabled: {
//       youtube: true,
//       google: false,
//       ...
//     }
//   }
//
// Defaults:
//   - Global:    true
//   - Per-site:  true
//

// ------------------------------
// Read global enabled flag
// ------------------------------
export function getGlobalEnabled() {
  return new Promise(resolve => {
    try {
      chrome.storage.sync.get({ enabled: true }, data => {
        resolve(data.enabled);
      });
    } catch (err) {
      console.error("[MiddleClick Everywhere][storage] getGlobalEnabled error:", err);
      resolve(true); // safest fallback
    }
  });
}

// ------------------------------
// Write global enabled flag
// (Used by popup or future settings UI)
// ------------------------------
export function setGlobalEnabled(value) {
  return new Promise(resolve => {
    try {
      chrome.storage.sync.set({ enabled: value }, () => resolve());
    } catch (err) {
      console.error("[MiddleClick Everywhere][storage] setGlobalEnabled error:", err);
      resolve();
    }
  });
}

// ------------------------------
// Read per-site enabled flag
// ------------------------------
export function getSiteEnabled(siteId) {
  return new Promise(resolve => {
    try {
      chrome.storage.sync.get(["siteEnabled"], data => {
        const enabledTable = data.siteEnabled || {};
        // default: true if not explicitly disabled
        resolve(enabledTable[siteId] !== false);
      });
    } catch (err) {
      console.error("[MiddleClick Everywhere][storage] getSiteEnabled error:", err);
      resolve(true);
    }
  });
}

// ------------------------------
// Write per-site enabled flag
// ------------------------------
export function setSiteEnabled(siteId, value) {
  return new Promise(resolve => {
    try {
      chrome.storage.sync.get(["siteEnabled"], data => {
        const table = data.siteEnabled || {};
        table[siteId] = value;

        chrome.storage.sync.set({ siteEnabled: table }, () => resolve());
      });
    } catch (err) {
      console.error("[MiddleClick Everywhere][storage] setSiteEnabled error:", err);
      resolve();
    }
  });
}
