import { openResultInNewTab } from "../../../core/openTab.js";

// ----------------------------------------
// Debug
// ----------------------------------------
function debugLog(...args) {
  console.log("[MiddleClick Everywhere - YT][suggestions]", ...args);
}

// ----------------------------------------
// Suggestion root
// ----------------------------------------
function getSuggestionsRoot() {
  const candidates = [
    "tp-yt-paper-listbox[role='listbox']",
    "ytd-searchbox-suggestions",
    "yt-searchbox-suggestions",
  ];

  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  // fallback: whole document, we'll filter out video player stuff
  return document.body;
}

// ----------------------------------------
// Finding suggestion elements
// ----------------------------------------

// Ignore nodes inside the video player
function findSuggestionInList(nodes) {
  if (!nodes) return null;

  for (const node of nodes) {
    if (!node || node === window || node === document) continue;

    try {
      if (node.closest && node.closest("#movie_player, .html5-video-player")) {
        // Skip anything in/over the video player
        continue;
      }
    } catch (e) {
      // ignore
    }

    const tag = node.tagName || "";
    const getAttr = node.getAttribute ? node.getAttribute.bind(node) : () => null;
    const className = typeof node.className === "string" ? node.className : "";

    if (/YTD-SEARCHBOX-SUGGESTION|YT-SEARCHBOX-SUGGESTION/i.test(tag)) return node;
    if (getAttr("role") === "option") return node;
    if (/suggestion/i.test(className)) return node;
  }

  return null;
}

// Ignore candidates inside the video player
function findSuggestionByCoords(x, y) {
  const root = getSuggestionsRoot();

  let candidates = root.querySelectorAll(
    "[role='option'], ytd-searchbox-suggestion, yt-searchbox-suggestion, [class*='suggestion']"
  );

  if (!candidates.length) {
    candidates = document.querySelectorAll(
      "[role='option'], ytd-searchbox-suggestion, yt-searchbox-suggestion, [class*='suggestion']"
    );
  }

  for (const el of candidates) {
    try {
      if (el.closest && el.closest("#movie_player, .html5-video-player")) {
        continue;
      }
    } catch (e) {
      // ignore
    }

    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return el;
    }
  }

  return null;
}

function normalizeSuggestionNode(node) {
  if (!node || !node.closest) return node;
  const container = node.closest(
    "ytd-searchbox-suggestion,[role='option'],yt-searchbox-suggestion,[class*='suggestion']"
  );
  return container || node;
}

function findSuggestionForEvent(e) {
  const path = e.composedPath ? e.composedPath() : e.path || [];
  let suggestion = findSuggestionInList(path);
  if (suggestion) return normalizeSuggestionNode(suggestion);

  suggestion = findSuggestionByCoords(e.clientX, e.clientY);
  return normalizeSuggestionNode(suggestion);
}

// ----------------------------------------
// Text extraction
// ----------------------------------------
function getSuggestionText(node) {
  if (!node) return "";

  node = normalizeSuggestionNode(node);

  const attrCandidates = ["aria-label", "title", "data-query", "data-value", "data-text"];

  // Try attributes on the container
  for (const attr of attrCandidates) {
    if (node.getAttribute) {
      const v = node.getAttribute(attr);
      if (v && v.trim()) return v.trim();
    }
  }

  // Try attributes on a nested element
  const desc = node.querySelector("[aria-label], [title], [data-query], [data-value], [data-text]");
  if (desc) {
    for (const attr of attrCandidates) {
      if (desc.getAttribute) {
        const v = desc.getAttribute(attr);
        if (v && v.trim()) return v.trim();
      }
    }
  }

  // Visible text from the whole row (prefer first line)
  let rowText = (node.innerText || node.textContent || "").trim();
  if (rowText) {
    if (rowText.includes("\n")) {
      rowText = rowText.split("\n")[0].trim();
    }
    if (rowText) return rowText;
  }

  // Fallback: specific elements
  const textEl =
    node.querySelector("yt-formatted-string") ||
    node.querySelector("span") ||
    node;

  let text = (textEl.innerText || textEl.textContent || "").trim();
  if (text.includes("\n")) {
    text = text.split("\n")[0].trim();
  }
  if (text) return text;

  // Deep text walker fallback
  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (n) =>
        n.nodeValue && n.nodeValue.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    }
  );

  let pieces = [];
  let current;
  while ((current = walker.nextNode())) {
    pieces.push(current.nodeValue.trim());
  }

  text = pieces.join(" ").trim();
  if (text) return text;

  // Debug if everything failed
  try {
    const tag = node.tagName;
    const cls = node.className;
    const outer = node.outerHTML ? node.outerHTML.slice(0, 200).replace(/\s+/g, " ") : "";
    debugLog("Could not extract text from suggestion node:", { tag, cls, outer });
  } catch (_) {}

  return "";
}

// ----------------------------------------
// Feature API
// ----------------------------------------

// Called from the global mousedown listener (engine → site → feature)
export function handleMouseDown(e) {
  const suggestion = findSuggestionForEvent(e);
  if (!suggestion) return false;

  debugLog("mousedown on suggestion row");

  e.preventDefault();
  e.stopPropagation();
  return true;
}

// Called from the global auxclick listener
export function handleAuxClick(e) {
  const suggestion = findSuggestionForEvent(e);
  if (!suggestion) return false;

  const text = getSuggestionText(suggestion);
  debugLog("auxclick on suggestion:", text);

  if (!text) return false;

  const url =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(text);

  openResultInNewTab(e, url);
  return true;
}
