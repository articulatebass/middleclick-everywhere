document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["enabled", "siteEnabled"], data => {
    document.getElementById("globalToggle").checked = data.enabled ?? true;
    document.getElementById("youtubeToggle").checked = data.siteEnabled?.youtube ?? true;
  });

  document.getElementById("globalToggle").addEventListener("change", e => {
    chrome.storage.sync.set({ enabled: e.target.checked });
  });

  document.getElementById("youtubeToggle").addEventListener("change", e => {
    chrome.storage.sync.get(["siteEnabled"], data => {
      const siteEnabled = data.siteEnabled || {};
      siteEnabled.youtube = e.target.checked;
      chrome.storage.sync.set({ siteEnabled });
    });
  });
});
