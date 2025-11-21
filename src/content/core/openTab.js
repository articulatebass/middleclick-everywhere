// ===============================
//  MiddleClick Everywhere
//  Global helper: open new tab
// ===============================
//
// All features should use this instead of calling
// window.open() directly. It handles:
//
//   - Preventing middle-click autoscroll
//   - Preventing event bubbling to YouTube handlers
//   - Ensuring consistent new tab behavior
//   - noopener for security
//

export function openResultInNewTab(e, url) {
  if (!url) return;

  try {
    // Stop default "middle click autoscroll"
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();
  } catch (_) {}

  try {
    // Always open a new tab, safe by default
    window.open(url, "_blank", "noopener");
  } catch (err) {
    console.error("[MiddleClick Everywhere][openTab] Failed to open tab:", err);
  }
}
