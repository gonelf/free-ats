/**
 * KiteHR Sourcer — popup.js
 *
 * State machine with 5 screens:
 *   setup       → No token/URL configured yet
 *   not-profile → Active tab is not a linkedin.com/in/ profile
 *   loading     → Scraping + API lookups in progress
 *   review      → Candidate data ready; user fills out form and submits
 *   success     → Candidate added to KiteHR
 */

const app = document.getElementById("app");

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────

const state = {
  screen: "loading",
  config: null,          // { kiteHrUrl, apiToken }
  candidate: null,       // scraped data from content script
  existingCandidate: null, // lookup result from API
  jobs: [],
  selectedJobId: "",
  selectedStageId: "",
  emailOverride: "",
  note: "",
  expExpanded: false,
  submitting: false,
  error: null,
  successData: null,     // { candidateId, firstName, lastName, jobTitle }
};

// ─────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────

function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["kiteHrUrl", "apiToken"], (data) => {
      if (data.kiteHrUrl && data.apiToken) {
        resolve({ kiteHrUrl: data.kiteHrUrl.replace(/\/$/, ""), apiToken: data.apiToken });
      } else {
        resolve(null);
      }
    });
  });
}

function saveConfig(kiteHrUrl, apiToken) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ kiteHrUrl: kiteHrUrl.replace(/\/$/, ""), apiToken }, resolve);
  });
}

// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────

async function api(path, options = {}) {
  const { kiteHrUrl, apiToken } = state.config;
  const resp = await fetch(`${kiteHrUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
      ...(options.headers || {}),
    },
  });
  if (resp.status === 401) throw new Error("Invalid API token. Check your settings.");
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body.error || `API error ${resp.status}`);
  }
  return resp.json();
}

// ─────────────────────────────────────────────
// Active tab helpers
// ─────────────────────────────────────────────

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0] ?? null));
  });
}

function isLinkedInProfile(url) {
  return /^https:\/\/(www\.)?linkedin\.com\/in\/[^/]+/.test(url);
}

function scrapeProfile(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: "SCRAPE_PROFILE" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!response?.success) {
        reject(new Error(response?.error || "Scrape failed"));
      } else {
        resolve(response.data);
      }
    });
  });
}

// ─────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────

function render() {
  app.innerHTML = "";
  switch (state.screen) {
    case "setup":       renderSetup(); break;
    case "not-profile": renderNotProfile(); break;
    case "loading":     renderLoading(); break;
    case "review":      renderReview(); break;
    case "success":     renderSuccess(); break;
  }
}

// ── Header ──────────────────────────────────

function makeHeader(showSettings = true) {
  const header = el("div", "header");

  const logo = el("div", "header-logo");
  logo.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
    KiteHR Sourcer`;
  header.appendChild(logo);

  if (showSettings) {
    const settingsBtn = el("button", "icon-btn");
    settingsBtn.title = "Settings";
    settingsBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>`;
    settingsBtn.addEventListener("click", () => {
      state.screen = "setup";
      render();
    });
    header.appendChild(settingsBtn);
  }

  return header;
}

// ── Setup screen ────────────────────────────

function renderSetup() {
  app.appendChild(makeHeader(false));

  const form = el("div", "setup-form");

  form.innerHTML = `
    <p style="font-size:12px;color:var(--muted);">Connect the extension to your KiteHR workspace.</p>

    <div class="field">
      <label>KiteHR URL</label>
      <input id="inp-url" type="url" placeholder="https://app.kitehr.co" value="${state.config?.kiteHrUrl ?? ""}" />
    </div>

    <div class="field">
      <label>API Token</label>
      <input id="inp-token" type="password" placeholder="Paste token from Settings → Chrome Extension" value="${state.config?.apiToken ?? ""}" />
      <span class="hint">Generate a token in KiteHR → Settings → Chrome Extension.</span>
    </div>

    <div id="setup-error"></div>

    <button class="btn btn-primary" id="btn-save">Save &amp; Connect</button>
  `;

  form.querySelector("#btn-save").addEventListener("click", handleSaveSetup);
  app.appendChild(form);
}

async function handleSaveSetup() {
  const urlInput = document.getElementById("inp-url");
  const tokenInput = document.getElementById("inp-token");
  const errorDiv = document.getElementById("setup-error");

  const kiteHrUrl = urlInput.value.trim();
  const apiToken = tokenInput.value.trim();

  errorDiv.innerHTML = "";

  if (!kiteHrUrl || !apiToken) {
    errorDiv.innerHTML = `<div class="error-msg">Both fields are required.</div>`;
    return;
  }

  const btn = document.getElementById("btn-save");
  btn.disabled = true;
  btn.textContent = "Verifying…";

  try {
    state.config = { kiteHrUrl: kiteHrUrl.replace(/\/$/, ""), apiToken };
    await api("/api/extension/jobs"); // verify token works
    await saveConfig(kiteHrUrl, apiToken);
    init(); // restart
  } catch (err) {
    state.config = null;
    errorDiv.innerHTML = `<div class="error-msg">${err.message}</div>`;
    btn.disabled = false;
    btn.textContent = "Save & Connect";
  }
}

// ── Not-profile screen ──────────────────────

function renderNotProfile() {
  app.appendChild(makeHeader());
  const content = el("div", "empty-state");
  content.innerHTML = `
    <strong>Navigate to a LinkedIn profile</strong>
    Open a <code style="font-size:11px">linkedin.com/in/…</code> profile page,
    then click the extension icon to source the candidate.
  `;
  app.appendChild(content);
}

// ── Loading screen ──────────────────────────

function renderLoading(msg = "Reading profile…") {
  app.appendChild(makeHeader());
  const wrap = el("div", "loading");
  wrap.innerHTML = `<div class="spinner"></div><span>${msg}</span>`;
  app.appendChild(wrap);
}

// ── Review screen ───────────────────────────

function renderReview() {
  app.appendChild(makeHeader());

  const content = el("div", "content");

  // Error
  if (state.error) {
    const errEl = el("div", "error-msg");
    errEl.textContent = state.error;
    content.appendChild(errEl);
  }

  // Badge
  const badge = el("span", state.existingCandidate ? "badge badge-exists" : "badge badge-new");
  badge.innerHTML = state.existingCandidate
    ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Already in KiteHR`
    : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New candidate`;
  content.appendChild(badge);

  // Candidate card
  const card = el("div", "candidate-card");
  card.style.marginTop = "10px";

  const c = state.candidate;
  const existingEmail = state.existingCandidate?.email ?? "";
  const scrapedEmail = c.email ?? "";
  const displayEmail = existingEmail || scrapedEmail;

  card.innerHTML = `
    <div class="candidate-name">${esc(c.firstName)} ${esc(c.lastName)}</div>
    ${c.headline ? `<div class="candidate-headline">${esc(c.headline)}</div>` : ""}
    <div class="candidate-meta">
      <a href="${esc(c.linkedinUrl)}" target="_blank" rel="noreferrer">LinkedIn ↗</a>
    </div>
  `;

  // Work experience toggle
  if (c.workExperience?.length) {
    const toggle = el("button", "exp-toggle");
    toggle.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="exp-chevron">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      ${c.workExperience.length} experience entries`;

    const expList = el("div", "exp-list");
    expList.id = "exp-list";
    expList.style.display = state.expExpanded ? "flex" : "none";

    c.workExperience.slice(0, 5).forEach((exp) => {
      const item = el("div", "exp-item");
      item.innerHTML = `<strong>${esc(exp.title ?? "")}</strong>${esc(exp.company ?? "")}${exp.dateRange ? ` · ${esc(exp.dateRange)}` : ""}`;
      expList.appendChild(item);
    });

    toggle.addEventListener("click", () => {
      state.expExpanded = !state.expExpanded;
      expList.style.display = state.expExpanded ? "flex" : "none";
      document.getElementById("exp-chevron").style.transform = state.expExpanded ? "rotate(180deg)" : "";
    });

    card.appendChild(toggle);
    card.appendChild(expList);
  }

  content.appendChild(card);

  // Email field (required for new candidates without scraped email)
  if (!state.existingCandidate) {
    const emailField = el("div", "field");
    emailField.style.marginBottom = "12px";
    emailField.innerHTML = `
      <label>Email ${!displayEmail ? '<span style="color:var(--error)">*</span>' : ""}</label>
      <input id="inp-email" type="email" placeholder="candidate@example.com" value="${esc(displayEmail)}" />
      ${!displayEmail ? '<span class="hint">LinkedIn didn\'t expose an email — enter one manually or leave blank.</span>' : ""}
    `;
    content.appendChild(emailField);
  }

  // Assign to job
  const assignBlock = el("div", "assign-block");
  const jobLabel = el("div", "section-label");
  jobLabel.textContent = "Assign to Job (optional)";
  assignBlock.appendChild(jobLabel);

  const jobSelect = el("select");
  jobSelect.id = "sel-job";
  const defaultOpt = el("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "— Don't assign to a job —";
  jobSelect.appendChild(defaultOpt);

  state.jobs.forEach((job) => {
    const opt = el("option");
    opt.value = job.id;
    opt.textContent = job.title;
    if (job.id === state.selectedJobId) opt.selected = true;
    jobSelect.appendChild(opt);
  });

  jobSelect.addEventListener("change", () => {
    state.selectedJobId = jobSelect.value;
    updateStageSelect();
  });

  assignBlock.appendChild(jobSelect);

  // Stage select (only shown when job is selected)
  const stageWrap = el("div");
  stageWrap.id = "stage-wrap";
  stageWrap.style.display = state.selectedJobId ? "block" : "none";
  const stageSelect = el("select");
  stageSelect.id = "sel-stage";
  stageWrap.appendChild(stageSelect);
  populateStageSelect(stageSelect);

  stageSelect.addEventListener("change", () => {
    state.selectedStageId = stageSelect.value;
  });

  assignBlock.appendChild(stageWrap);
  content.appendChild(assignBlock);

  // Note
  const noteField = el("div", "field");
  noteField.innerHTML = `
    <label>Note (optional)</label>
    <textarea id="inp-note" placeholder="Add a sourcing note…">${esc(state.note)}</textarea>
  `;
  content.appendChild(noteField);

  // Action buttons
  const btnRow = el("div", "btn-row");

  if (state.existingCandidate) {
    // Existing candidate: View + optionally assign
    const viewBtn = el("a", "btn btn-secondary");
    viewBtn.href = `${state.config.kiteHrUrl}/candidates/${state.existingCandidate.id}`;
    viewBtn.target = "_blank";
    viewBtn.textContent = "View in KiteHR";
    btnRow.appendChild(viewBtn);

    const assignBtn = el("button", "btn btn-primary");
    assignBtn.id = "btn-submit";
    assignBtn.textContent = state.selectedJobId ? "Assign to Job" : "Add Note";
    assignBtn.disabled = state.submitting;
    assignBtn.addEventListener("click", handleSubmit);
    btnRow.appendChild(assignBtn);
  } else {
    const submitBtn = el("button", "btn btn-primary");
    submitBtn.id = "btn-submit";
    submitBtn.textContent = state.submitting ? "Adding…" : "Add to KiteHR";
    submitBtn.disabled = state.submitting;
    submitBtn.addEventListener("click", handleSubmit);
    btnRow.appendChild(submitBtn);
  }

  content.appendChild(btnRow);
  app.appendChild(content);
}

function populateStageSelect(selectEl) {
  selectEl.innerHTML = "";
  if (!state.selectedJobId) return;

  const job = state.jobs.find((j) => j.id === state.selectedJobId);
  if (!job) return;

  job.pipeline.stages.forEach((stage, i) => {
    const opt = el("option");
    opt.value = stage.id;
    opt.textContent = stage.name;
    if (i === 0 && !state.selectedStageId) {
      opt.selected = true;
      state.selectedStageId = stage.id;
    } else if (stage.id === state.selectedStageId) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });
}

function updateStageSelect() {
  const stageWrap = document.getElementById("stage-wrap");
  const stageSelect = document.getElementById("sel-stage");
  if (!stageWrap || !stageSelect) return;

  if (state.selectedJobId) {
    stageWrap.style.display = "block";
    state.selectedStageId = "";
    populateStageSelect(stageSelect);
  } else {
    stageWrap.style.display = "none";
    state.selectedStageId = "";
  }

  // Update submit button label for existing candidates
  const btn = document.getElementById("btn-submit");
  if (btn && state.existingCandidate) {
    btn.textContent = state.selectedJobId ? "Assign to Job" : "Add Note";
  }
}

// ── Success screen ──────────────────────────

function renderSuccess() {
  app.appendChild(makeHeader());

  const { firstName, lastName, jobTitle, candidateId } = state.successData;

  const wrap = el("div", "success-screen");
  wrap.innerHTML = `
    <div class="success-icon">✓</div>
    <div class="success-name">${esc(firstName)} ${esc(lastName)}</div>
    <div class="success-sub">${jobTitle ? `Assigned to <strong>${esc(jobTitle)}</strong>` : "Added to KiteHR"}</div>
  `;

  const viewBtn = el("a", "btn btn-primary");
  viewBtn.href = `${state.config.kiteHrUrl}/candidates/${candidateId}`;
  viewBtn.target = "_blank";
  viewBtn.textContent = "View in KiteHR →";
  viewBtn.style.marginBottom = "8px";

  const anotherBtn = el("button", "btn btn-secondary");
  anotherBtn.textContent = "Source Another";
  anotherBtn.addEventListener("click", () => {
    state.screen = "not-profile";
    state.candidate = null;
    state.existingCandidate = null;
    state.selectedJobId = "";
    state.selectedStageId = "";
    state.note = "";
    state.error = null;
    state.expExpanded = false;
    state.successData = null;
    init();
  });

  wrap.appendChild(viewBtn);
  wrap.appendChild(anotherBtn);
  app.appendChild(wrap);
}

// ─────────────────────────────────────────────
// Submit handler
// ─────────────────────────────────────────────

async function handleSubmit() {
  state.error = null;
  state.submitting = true;

  // Read current form values
  const emailEl = document.getElementById("inp-email");
  const noteEl = document.getElementById("inp-note");
  const jobEl = document.getElementById("sel-job");
  const stageEl = document.getElementById("sel-stage");

  if (emailEl) state.emailOverride = emailEl.value.trim();
  if (noteEl) state.note = noteEl.value.trim();
  if (jobEl) state.selectedJobId = jobEl.value;
  if (stageEl) state.selectedStageId = stageEl.value;

  render(); // show submitting state

  try {
    let candidateId;
    const c = state.candidate;

    if (state.existingCandidate) {
      candidateId = state.existingCandidate.id;

      // Assign to job if selected
      if (state.selectedJobId) {
        await api("/api/extension/applications", {
          method: "POST",
          body: JSON.stringify({
            candidateId,
            jobId: state.selectedJobId,
            stageId: state.selectedStageId || undefined,
          }),
        });
      }
    } else {
      // Create new candidate
      const email = state.emailOverride || c.email || undefined;
      const body = {
        firstName: c.firstName,
        lastName: c.lastName,
        email,
        linkedinUrl: c.linkedinUrl,
        summary: c.headline || undefined,
        workExperience: c.workExperience?.length ? c.workExperience : undefined,
        jobId: state.selectedJobId || undefined,
        stageId: state.selectedStageId || undefined,
      };
      const newCandidate = await api("/api/extension/candidates", {
        method: "POST",
        body: JSON.stringify(body),
      });
      candidateId = newCandidate.id;
    }

    // Add note if provided
    if (state.note && candidateId) {
      await api("/api/extension/notes", {
        method: "POST",
        body: JSON.stringify({ candidateId, content: state.note }),
      });
    }

    const job = state.jobs.find((j) => j.id === state.selectedJobId);
    state.successData = {
      candidateId,
      firstName: c.firstName,
      lastName: c.lastName,
      jobTitle: job?.title ?? null,
    };
    state.screen = "success";
  } catch (err) {
    state.error = err.message;
    state.screen = "review";
  } finally {
    state.submitting = false;
    render();
  }
}

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────

async function init() {
  state.config = await loadConfig();

  if (!state.config) {
    state.screen = "setup";
    render();
    return;
  }

  const tab = await getActiveTab();

  if (!tab || !isLinkedInProfile(tab.url)) {
    state.screen = "not-profile";
    render();
    return;
  }

  state.screen = "loading";
  render();

  try {
    // Scrape + fetch jobs in parallel
    const [scraped, jobs] = await Promise.all([
      scrapeProfile(tab.id),
      api("/api/extension/jobs"),
    ]);

    state.candidate = scraped;
    state.jobs = jobs;

    // Look up existing candidate by LinkedIn URL
    const lookup = await api(
      `/api/extension/candidates/lookup?linkedinUrl=${encodeURIComponent(scraped.linkedinUrl)}`
    );
    state.existingCandidate = lookup.exists ? lookup.candidate : null;

    state.screen = "review";
  } catch (err) {
    state.error = err.message;
    // If scrape failed (content script not yet injected), show retry
    if (err.message.includes("Could not establish connection") || err.message.includes("Receiving end does not exist")) {
      state.error = "Could not read the page. Reload the LinkedIn profile and try again.";
    }
    state.screen = "review";
    // If review would be empty (no candidate data), show not-profile instead
    if (!state.candidate) {
      state.screen = "not-profile";
    }
  }

  render();
}

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────

init();
