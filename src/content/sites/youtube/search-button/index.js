import { openResultInNewTab } from "../../../core/openTab.js";

// ----------------------------------------
// Debug
// ----------------------------------------
function debugLog(...args) {
  console.log("[MiddleClick Everywhere - YT][search-button]", ...args);
}

// ----------------------------------------
// Locating the search input
// ----------------------------------------
function getSearchInput() {
  let input = document.querySelector("input#search");
  if (input) return input;

  input = document.querySelector('input[aria-label="Search"]');
  if (input) return input;

  const masthead = document.querySelector("ytd-masthead");
  if (masthead) {
    const inputs = masthead.querySelectorAll("input");
    if (inputs.length > 0) return inputs[0];
  }

  return null;
}

// ----------------------------------------
// Identifying the search button
// ----------------------------------------
function isSearchButtonElement(button) {
  if (!button || !button.tagName) return false;
  if (button.tagName.toUpperCase() !== "BUTTON") return false;

  const id = button.id || "";
  const cls = button.className || "";
  const aria = button.getAttribute ? (button.getAttribute("aria-label") || "") : "";

  if (id.includes("search-icon")) return true;
  if (/ytSearchboxComponentSearchButton/i.test(cls)) return true;
  if (aria.toLowerCase() === "search") return true;

  return false;
}

function findSearchButtonForEvent(e) {
  const path = e.composedPath ? e.composedPath() : e.path || [];

  // Try event path first
  for (const node of path) {
    if (!node || !node.closest) continue;
    const btn = node.closest("button");
    if (btn && isSearchButtonElement(btn)) return btn;
  }

  // Try elements under pointer as fallback
  const under = document.elementsFromPoint(e.clientX, e.clientY) || [];
  for (const node of under) {
    if (!node || !node.closest) continue;
    const btn = node.closest("button");
    if (btn && isSearchButtonElement(btn)) return btn;
  }

  return null;
}

// ----------------------------------------
// URL building
// ----------------------------------------
function buildSearchUrl() {
  const input = getSearchInput();
  const query = input ? (input.value || "").trim() : "";
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(query);
}

// ----------------------------------------
// Feature API
// ----------------------------------------

// mousedown
export function handleMouseDown(e) {
  const btn = findSearchButtonForEvent(e);
  if (!btn) return false;

  debugLog("mousedown on search button");

  // Stop autoscroll behavior
  e.preventDefault();
  e.stopPropagation();

  return true;
}

// auxclick
export function handleAuxClick(e) {
  const btn = findSearchButtonForEvent(e);
  if (!btn) return false;

  const url = buildSearchUrl();
  openResultInNewTab(e, url);

  debugLog("auxclick on search button:", url);

  return true;
}
