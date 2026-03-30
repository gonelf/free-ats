/**
 * KiteHR Sourcer — LinkedIn content script
 *
 * Listens for SCRAPE_PROFILE messages from the popup and returns structured
 * candidate data extracted from the current LinkedIn profile page.
 *
 * Selector strategy: LinkedIn changes its DOM frequently. We use layered
 * fallbacks — semantic/ARIA patterns first, then structural heuristics,
 * then <meta> tags as a last resort. When selectors break after a LinkedIn
 * update, update the SELECTORS object below.
 */

const SELECTORS = {
  // Full name — the h1 in the profile header
  name: "h1",

  // Headline — just below the name in the top card
  headline: [
    ".text-body-medium.break-words",
    ".pv-text-details__left-panel .text-body-medium",
  ],

  // Email from the Contact Info section (only if already open/loaded)
  email: 'a[href^="mailto:"]',

  // Experience section heading
  experienceSectionHeading: "h2",

  // Individual experience list items inside the section
  experienceItems: "li",
};

function getText(el) {
  return el?.innerText?.trim() ?? "";
}

/**
 * Try each selector in `candidates` array and return the first match's text.
 */
function firstMatch(candidates) {
  for (const sel of candidates) {
    const el = document.querySelector(sel);
    if (el) return getText(el);
  }
  return "";
}

function scrapeProfile() {
  const data = {
    firstName: "",
    lastName: "",
    headline: "",
    email: null,
    linkedinUrl: window.location.href.split("?")[0],
    workExperience: [],
  };

  // --- Name ---
  const nameEl = document.querySelector(SELECTORS.name);
  if (nameEl) {
    const parts = getText(nameEl).split(/\s+/);
    data.firstName = parts[0] ?? "";
    data.lastName = parts.slice(1).join(" ");
  }

  // Fallback: og:title is typically "First Last - Headline | LinkedIn"
  if (!data.firstName) {
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "";
    const namePart = ogTitle.split(" - ")[0].trim();
    const parts = namePart.split(/\s+/);
    data.firstName = parts[0] ?? "";
    data.lastName = parts.slice(1).join(" ");
  }

  // --- Headline ---
  data.headline = firstMatch(SELECTORS.headline);

  // Fallback: meta description starts with "name · headline"
  if (!data.headline) {
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    const match = desc.match(/^[^·]+·\s*(.+?)(?:\s*\||\s*\.\s*[A-Z]|$)/);
    if (match) data.headline = match[1].trim();
  }

  // --- Email ---
  const emailEl = document.querySelector(SELECTORS.email);
  if (emailEl) {
    data.email = emailEl.getAttribute("href")?.replace("mailto:", "") ?? null;
  }

  // --- Work Experience ---
  const allSections = document.querySelectorAll("section");
  for (const section of allSections) {
    const headings = section.querySelectorAll(SELECTORS.experienceSectionHeading);
    const isExperienceSection = Array.from(headings).some((h) =>
      getText(h).toLowerCase().includes("experience")
    );

    if (!isExperienceSection) continue;

    const listItems = section.querySelectorAll(SELECTORS.experienceItems);
    for (const item of listItems) {
      // Skip nested items (group positions inside a company)
      const depth = getListDepth(item);
      if (depth > 1) continue;

      const spans = item.querySelectorAll("span[aria-hidden='true']");
      const texts = Array.from(spans)
        .map((s) => getText(s))
        .filter(Boolean);

      if (texts.length === 0) continue;

      // Heuristic: first non-empty span is title, second is company, third is date range
      const entry = {
        title: texts[0] ?? null,
        company: texts[1] ?? null,
        dateRange: texts[2] ?? null,
      };

      // Skip if it looks like a heading repeat
      if (entry.title?.toLowerCase().includes("experience")) continue;

      data.workExperience.push(entry);

      // Cap at 10 entries to avoid scraping sidebar noise
      if (data.workExperience.length >= 10) break;
    }

    break; // Only parse the first experience section
  }

  return data;
}

/**
 * Returns how deeply nested a list item is (1 = top-level).
 */
function getListDepth(li) {
  let depth = 0;
  let el = li.parentElement;
  while (el) {
    if (el.tagName === "LI") depth++;
    el = el.parentElement;
  }
  return depth + 1;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SCRAPE_PROFILE") {
    try {
      sendResponse({ success: true, data: scrapeProfile() });
    } catch (err) {
      sendResponse({ success: false, error: String(err) });
    }
  }
  return true; // keep channel open for async sendResponse
});
