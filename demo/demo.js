const PERSONALITY_METADATA_URL = document.querySelector("script[data-personalities-url]")?.dataset.personalitiesUrl;
function normalizePersonalityMetadata(metadata) {
  const personalities = Array.isArray(metadata?.personalities) ? metadata.personalities : [];
  const validCompatibility = new Set(["native", "any", "recommended"]);
  const normalized = personalities.map((personality) => ({
    id: String(personality?.id ?? ""),
    label: String(personality?.label ?? personality?.id ?? ""),
    visualCompatibility: String(personality?.visualCompatibility ?? ""),
    recommendedVisualPresets: Array.isArray(personality?.recommendedVisualPresets)
      ? personality.recommendedVisualPresets.map(String)
      : [],
    compatibleVisualPresets: Array.isArray(personality?.compatibleVisualPresets)
      ? personality.compatibleVisualPresets.map(String)
      : []
  }));

  if (
    metadata?.schemaVersion !== 1 ||
    normalized.length === 0 ||
    normalized.some(({ id, label, visualCompatibility }) =>
      !id || !label || !validCompatibility.has(visualCompatibility)
    )
  ) {
    throw new Error("Layout personality metadata is missing a valid public pairing contract.");
  }

  return Object.freeze({
    schemaVersion: metadata.schemaVersion,
    personalities: Object.freeze(normalized.map((personality) => Object.freeze(personality)))
  });
}

function minimalPersonalityFallback() {
  return Object.freeze({
    schemaVersion: 1,
    personalities: Object.freeze([
      Object.freeze({
        id: "minimal-saas",
        label: "Minimal SaaS",
        visualCompatibility: "any",
        recommendedVisualPresets: [],
        compatibleVisualPresets: []
      })
    ])
  });
}

async function loadPersonalityMetadata() {
  try {
    if (!PERSONALITY_METADATA_URL) {
      throw new Error("The demo requires a local layout personality metadata URL.");
    }

    const response = await fetch(PERSONALITY_METADATA_URL, { cache: "force-cache" });

    if (!response.ok) {
      throw new Error(`Layout personality metadata request failed with HTTP ${response.status}.`);
    }

    return { metadata: normalizePersonalityMetadata(await response.json()), status: "" };
  } catch (error) {
    try {
      return {
        metadata: normalizePersonalityMetadata(window.LAYOUT_STYLE_PERSONALITY_METADATA),
        status: "Layout pairing metadata is unavailable; using packaged fallback."
      };
    } catch {
      console.error("Layout personality metadata and packaged fallback are unavailable.", error);
      return {
        metadata: minimalPersonalityFallback(),
        status: "Layout pairing metadata is unavailable; Minimal SaaS remains available."
      };
    }
  }
}

const PERSONALITY_METADATA_LOAD = await loadPersonalityMetadata();
const PERSONALITY_METADATA = PERSONALITY_METADATA_LOAD.metadata;
const ALLOWLISTS = Object.freeze({
  device: Object.freeze([
    "custom",
    "phone-portrait",
    "phone-landscape",
    "tablet-portrait",
    "tablet-landscape",
    "desktop-landscape",
    "desktop-portrait"
  ]),
  wrapper: Object.freeze([
    "default",
    "compact",
    "prose",
    "content",
    "workspace",
    "wide",
    "full",
    "breakout"
  ]),
  recipe: Object.freeze([
    "app-shell",
    "dashboard",
    "docs",
    "list-detail",
    "split-hero",
    "gallery",
    "card-grid"
  ]),
  personality: Object.freeze(PERSONALITY_METADATA.personalities.map(({ id }) => id)),
  container: Object.freeze([
    "auto",
    "20rem",
    "32rem",
    "40rem",
    "41rem",
    "43rem",
    "45rem",
    "47rem",
    "49rem",
    "51rem",
    "53rem",
    "71rem",
    "73rem",
    "80rem"
  ]),
  height: Object.freeze(["auto", "29rem", "31rem", "43rem", "45rem", "50rem"]),
  responsive: Object.freeze(["auto", "manual"]),
  density: Object.freeze(["compact", "normal", "spacious"])
});

const DEFAULT_STATE = Object.freeze({
  device: "custom",
  wrapper: "default",
  recipe: "app-shell",
  personality: "minimal-saas",
  container: "auto",
  height: "auto",
  responsive: "auto",
  density: "normal"
});

const CONTAINER_WIDTHS = Object.freeze({
  auto: "100%",
  "20rem": "20rem",
  "32rem": "32rem",
  "40rem": "40rem",
  "41rem": "41rem",
  "43rem": "43rem",
  "45rem": "45rem",
  "47rem": "47rem",
  "49rem": "49rem",
  "51rem": "51rem",
  "53rem": "53rem",
  "71rem": "71rem",
  "73rem": "73rem",
  "80rem": "80rem"
});

const CONTAINER_HEIGHTS = Object.freeze({
  auto: "auto",
  "29rem": "29rem",
  "31rem": "31rem",
  "43rem": "43rem",
  "45rem": "45rem",
  "50rem": "50rem"
});

const DEVICE_PRESETS = Object.freeze({
  custom: null,
  "phone-portrait": Object.freeze({ width: 360, height: 800 }),
  "phone-landscape": Object.freeze({ width: 800, height: 360 }),
  "tablet-portrait": Object.freeze({ width: 768, height: 1024 }),
  "tablet-landscape": Object.freeze({ width: 1024, height: 768 }),
  "desktop-landscape": Object.freeze({ width: 1440, height: 900 }),
  "desktop-portrait": Object.freeze({ width: 900, height: 1440 })
});

const RECIPE_AREAS = Object.freeze({
  "app-shell": Object.freeze(["header", "sidebar", "main", "aside", "footer"]),
  dashboard: Object.freeze(["header", "nav", "main", "aside", "footer"]),
  docs: Object.freeze(["header", "nav", "main", "aside", "footer"]),
  "list-detail": Object.freeze(["primary", "secondary", "actions"]),
  "split-hero": Object.freeze(["content", "media", "actions"])
});

const LAYOUT_IMPORT = 'import "layout-style-css";';

const body = document.body;
const controls = Object.fromEntries(
  Object.keys(ALLOWLISTS).map((key) => [key, document.querySelector(`[data-query-key="${key}"]`)])
);
const previewFrame = document.querySelector("#previewFrame");
const previewRoot = document.querySelector("#previewRoot");
const previewWrapper = document.querySelector("#previewWrapper");
const recipePreview = document.querySelector("#recipePreview");
const importsSnippet = document.querySelector("#importsSnippet");
const markupSnippet = document.querySelector("#markupSnippet");
const copyStatus = document.querySelector("#copyStatus");
const personalityMetadataStatus = document.querySelector("#personalityMetadataStatus");
const recommendedUiGuidance = document.querySelector("#recommendedUiGuidance");
const compatibleUiGuidance = document.querySelector("#compatibleUiGuidance");
const containerReadout = document.querySelector("#containerReadout");
const topologyReadout = document.querySelector("#topologyReadout");
const drawerToggle = document.querySelector("#demoControlsToggle");
const drawer = document.querySelector("#demoControlsDrawer");
const drawerClose = document.querySelector("#demoControlsClose");
const drawerBackdrop = document.querySelector("#demoControlsBackdrop");
const stateToggle = document.querySelector("#stateToggle");
const actionBarStickyToggle = document.querySelector("#actionBarStickyToggle");
const fixtureActionBar = document.querySelector("#fixtureActionBar");
const mobileControlsQuery = window.matchMedia("(max-width: 63.999rem)");

body.dataset.personalityMetadataVersion = String(PERSONALITY_METADATA.schemaVersion);
syncPersonalityMetadataSelectOptions();
if (personalityMetadataStatus) {
  personalityMetadataStatus.textContent = PERSONALITY_METADATA_LOAD.status;
}
let state = readStateFromQuery();
let drawerReturnFocus = null;
let querySyncTimer = null;
let hasSynchronizedQuery = false;
let readoutFrame = null;

/**
 * Maps durable demo query aliases to current allowlisted values.
 *
 * @param {string} key Query-state key.
 * @param {string | null} value Raw query value.
 * @returns {string | null} Current value or the unchanged input.
 */
function normalizeQueryValue(key, value) {
  return key === "density" && value === "comfortable" ? "normal" : value;
}

/**
 * Reads allowlisted demo state from the current query string.
 *
 * @returns {Record<string, string>} Normalized demo state.
 */
function readStateFromQuery() {
  const query = new URLSearchParams(window.location.search);

  return Object.fromEntries(
    Object.entries(ALLOWLISTS).map(([key, values]) => {
      const candidate = normalizeQueryValue(key, query.get(key));
      return [key, candidate !== null && values.includes(candidate) ? candidate : DEFAULT_STATE[key]];
    })
  );
}

function syncQuery() {
  const writeQuery = () => {
    const url = new URL(window.location.href);
    url.search = "";

    for (const key of Object.keys(ALLOWLISTS)) {
      url.searchParams.set(key, state[key]);
    }

    window.history.replaceState(null, "", url);
    hasSynchronizedQuery = true;
    querySyncTimer = null;
  };

  if (!hasSynchronizedQuery) {
    writeQuery();
    return;
  }

  /* Coalesce rapid control changes so WebKit's history safety limit is never exceeded. */
  window.clearTimeout(querySyncTimer);
  querySyncTimer = window.setTimeout(writeQuery, 200);
}

function createElement(tagName, { className, text, attributes = {}, data = {} } = {}) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  for (const [name, value] of Object.entries(data)) {
    element.dataset[name] = value;
  }

  return element;
}

/**
 * Creates one locally styled action used to verify semantic focus order.
 *
 * @param {string} sequence Region or item sequence identifier.
 * @returns {HTMLButtonElement} Demo action with stable focus metadata.
 */
function createAction(sequence) {
  return createElement("button", {
    text: `${formatLabel(sequence)} action`,
    attributes: { type: "button" },
    data: { demoButton: "", demoFocus: sequence }
  });
}

/**
 * Creates one semantic recipe region and its representative preview content.
 *
 * @param {string} area Canonical recipe area name.
 * @returns {HTMLElement} Populated preview region.
 */
function createRegion(area) {
  const semanticTags = {
    header: "header",
    nav: "nav",
    sidebar: "aside",
    aside: "aside",
    footer: "footer",
    media: "figure",
    actions: "div"
  };
  const structuralClass = area === "header" ? "ly-header ly-header--sticky " : "";
  const element = createElement(semanticTags[area] ?? "section", {
    className: `${structuralClass}demo-region`,
    data: { lyArea: area, demoSequence: area }
  });
  const heading = createElement("strong", { text: formatLabel(area) });

  if (area === "nav") {
    element.setAttribute("aria-label", "Preview navigation");
  } else {
    element.setAttribute("aria-label", `${formatLabel(area)} region`);
  }

  element.append(heading, createAction(area));

  if (area === "secondary") {
    const scroll = createElement("div", {
      className: "ly-scroll ly-scroll--bounded demo-list-scroll",
      attributes: { tabindex: "0", "aria-label": "Scrollable detail activity" }
    });

    for (let index = 1; index <= 10; index += 1) {
      scroll.append(createElement("p", { text: `Detail activity ${index}` }));
    }

    element.append(scroll);
  }

  return element;
}

function createGridItem(index) {
  const sequence = `item-${index}`;
  const item = createElement("article", {
    className: "demo-region demo-grid-item",
    data: { demoSequence: sequence }
  });
  item.append(createElement("strong", { text: `Item ${index}` }), createAction(sequence));
  return item;
}

function renderRecipe() {
  const recipe = state.recipe;
  const children = RECIPE_AREAS[recipe]
    ? RECIPE_AREAS[recipe].map((area) => createRegion(area))
    : Array.from({ length: recipe === "gallery" ? 5 : 6 }, (_, index) => createGridItem(index + 1));

  recipePreview.className = "demo-recipe";
  recipePreview.dataset.lyRecipe = recipe;
  if (state.responsive === "manual") {
    recipePreview.dataset.lyResponsive = "manual";
  } else {
    delete recipePreview.dataset.lyResponsive;
  }
  recipePreview.replaceChildren(...children);
}

function formatLabel(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function syncPersonalityMetadataSelectOptions() {
  const select = controls.personality;

  if (!select) {
    return;
  }

  select.replaceChildren(
    ...PERSONALITY_METADATA.personalities.map(({ id, label, visualCompatibility }) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = label;
      option.dataset.visualCompatibility = visualCompatibility;
      return option;
    })
  );
  select.setAttribute("aria-busy", "false");
}

/**
 * Renders advisory visual-system pairings for the selected layout personality.
 *
 * @returns {void}
 */
function syncPairingGuidance() {
  const pairing = PERSONALITY_METADATA.personalities.find(({ id }) => id === state.personality);
  /**
   * Formats visual-preset identifiers for human-readable guidance.
   *
   * @param {string[]} presets Visual-preset identifiers.
   * @param {string} fallback Text shown when no presets are listed.
   * @returns {string} Display-ready visual-preset guidance.
   */
  const describePresets = (presets, fallback) =>
    presets.length > 0 ? presets.map(formatLabel).join(", ") : fallback;

  recommendedUiGuidance.textContent = `Recommended visual pairing: ${describePresets(
    pairing?.recommendedVisualPresets ?? [],
    pairing?.visualCompatibility === "any" ? "Any visual preset" : "None listed"
  )}`;
  compatibleUiGuidance.textContent = `Compatible visual pairing: ${describePresets(
    pairing?.compatibleVisualPresets ?? [],
    "None listed"
  )}`;
}

function buildMarkupSnippet() {
  const wrapperClass = state.wrapper === "default" ? "ly-wrapper" : `ly-wrapper ly-wrapper--${state.wrapper}`;
  const areas = RECIPE_AREAS[state.recipe];
  const responsiveAttribute =
    state.responsive === "manual" ? ' data-ly-responsive="manual"' : "";
  const childMarkup = areas
    ? areas.map((area) => `    <section data-ly-area="${area}">${formatLabel(area)}</section>`).join("\n")
    : `    <article>Item 1</article>\n    <article>Item 2</article>`;

  return [
    `<div class="ly-root" data-ly-layout="${state.personality}">`,
    `  <div class="${wrapperClass}">`,
    `  <div data-ly-recipe="${state.recipe}"${responsiveAttribute}>`,
    childMarkup,
    "  </div>",
    "  </div>",
    "</div>"
  ].join("\n");
}

function syncSnippets() {
  // Snippets are rendered as inert text from allowlisted state, never parsed as HTML.
  importsSnippet.textContent = LAYOUT_IMPORT;
  markupSnippet.textContent = buildMarkupSnippet();
}

function activeAllocation() {
  const preset = DEVICE_PRESETS[state.device];

  if (preset) {
    return {
      width: `${preset.width}px`,
      height: `${preset.height}px`,
      requestedWidth: preset.width,
      requestedHeight: preset.height,
      label: formatLabel(state.device)
    };
  }

  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return {
    width: CONTAINER_WIDTHS[state.container],
    height: CONTAINER_HEIGHTS[state.height],
    requestedWidth: state.container === "auto" ? null : Number.parseFloat(state.container) * rootFontSize,
    requestedHeight: state.height === "auto" ? null : Number.parseFloat(state.height) * rootFontSize,
    label: "Custom"
  };
}

function syncHeightTier(allocation = activeAllocation()) {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const availableHeight = allocation.requestedHeight ?? window.innerHeight;
  const tier = availableHeight <= 30 * rootFontSize ? "shallow" : availableHeight <= 44 * rootFontSize ? "short" : "regular";
  previewRoot.dataset.demoHeightTier = tier;
}

function describeTopology() {
  if (state.responsive === "manual") {
    return "Stacked fallback (manual)";
  }

  if (state.recipe === "gallery" || state.recipe === "card-grid") {
    return "Intrinsic tracks";
  }

  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const scopeStyle = getComputedStyle(previewWrapper);
  const scopeWidth =
    previewWrapper.clientWidth -
    Number.parseFloat(scopeStyle.paddingInlineStart) -
    Number.parseFloat(scopeStyle.paddingInlineEnd);
  const threshold = {
    "split-hero": 42,
    "list-detail": 44,
    docs: 48,
    "app-shell": 52,
    dashboard: 52
  }[state.recipe];

  if (
    ["app-shell", "dashboard"].includes(state.recipe) &&
    scopeWidth >= 72 * rootFontSize
  ) {
    return "Wide";
  }

  return scopeWidth >= threshold * rootFontSize ? "Medium" : "Stacked";
}

function updatePreviewReadout() {
  window.cancelAnimationFrame(readoutFrame);
  readoutFrame = window.requestAnimationFrame(() => {
    const allocation = activeAllocation();
    const rectangle = previewFrame.getBoundingClientRect();
    const renderedHeight = Math.max(previewFrame.clientHeight, rectangle.height);
    containerReadout.textContent = `Preview: ${Math.round(rectangle.width)} × ${Math.round(
      renderedHeight
    )} px · ${allocation.label}`;
    topologyReadout.textContent = `Topology: ${describeTopology()}`;
  });
}

/**
 * Applies current demo state to controls, public layout attributes, preview
 * allocation, rendered recipe content, snippets, and URL state.
 *
 * @param {{updateQuery?: boolean}} [options] State-application options.
 * @returns {void}
 */
function applyState(options = {}) {
  const { updateQuery = true } = options;
  for (const [key, control] of Object.entries(controls)) {
    control.value = state[key];
  }

  body.dataset.lyLayout = state.personality;
  body.dataset.demoDensity = state.density;
  previewRoot.dataset.lyLayout = state.personality;
  previewRoot.dataset.lyDensity = state.density;

  previewWrapper.className =
    state.wrapper === "default" ? "ly-wrapper" : `ly-wrapper ly-wrapper--${state.wrapper}`;
  const allocation = activeAllocation();
  previewFrame.dataset.containerWidth = state.container;
  previewFrame.dataset.containerHeight = state.height;
  previewFrame.dataset.device = state.device;
  previewFrame.style.setProperty("--demo-container-inline-size", allocation.width);
  previewFrame.style.setProperty("--demo-container-block-size", allocation.height);
  syncHeightTier(allocation);

  renderRecipe();
  syncPairingGuidance();
  syncSnippets();
  updatePreviewReadout();

  if (updateQuery) {
    syncQuery();
  }
}

function setDrawerOpen(open, { returnFocus = true } = {}) {
  if (!mobileControlsQuery.matches) {
    drawerToggle.setAttribute("aria-expanded", "false");
    drawer.hidden = false;
    drawer.inert = false;
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.hidden = true;
    drawerReturnFocus = null;
    delete body.dataset.demoControlsOpen;
    return;
  }

  drawerToggle.setAttribute("aria-expanded", String(open));
  drawer.hidden = !open;
  drawer.inert = !open;
  drawer.setAttribute("aria-hidden", String(!open));
  drawerBackdrop.hidden = !open;

  if (open) {
    const activeElement = document.activeElement;
    const hasMeaningfulActiveElement =
      activeElement instanceof HTMLElement &&
      activeElement !== body &&
      activeElement !== document.documentElement;

    /* WebKit may leave pointer-activated buttons unfocused, so never return focus to the page body. */
    drawerReturnFocus = hasMeaningfulActiveElement ? activeElement : drawerToggle;
    body.dataset.demoControlsOpen = "true";
    drawerClose.focus({ preventScroll: true });
    return;
  }

  delete body.dataset.demoControlsOpen;

  if (returnFocus) {
    const focusTarget = drawerReturnFocus instanceof HTMLElement ? drawerReturnFocus : drawerToggle;
    focusTarget.focus({ preventScroll: true });
  }

  drawerReturnFocus = null;
}

function trapDrawerFocus(event) {
  if (!mobileControlsQuery.matches || drawer.hidden || event.key !== "Tab") {
    return;
  }

  const focusable = [...drawer.querySelectorAll("button:not([disabled]), select:not([disabled])")];
  const first = focusable.at(0);
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

async function copySnippet(button) {
  const target = document.querySelector(`#${button.dataset.copyTarget}`);
  const label = button.dataset.copyTarget === "importsSnippet" ? "imports" : "markup";

  try {
    await navigator.clipboard.writeText(target.textContent);
    copyStatus.dataset.copyState = "success";
    copyStatus.textContent = `Copied ${label}.`;
  } catch {
    const fallback = createElement("textarea", { text: target.textContent });
    fallback.setAttribute("aria-hidden", "true");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    copyStatus.dataset.copyState = copied ? "success" : "error";
    copyStatus.textContent = copied ? `Copied ${label}.` : `Unable to copy ${label}.`;
  }
}

for (const [key, control] of Object.entries(controls)) {
  control.addEventListener("change", () => {
    const candidate = control.value;

    // Control values still pass through the same allowlists used for deep links.
    if (!ALLOWLISTS[key].includes(candidate)) {
      control.value = state[key];
      return;
    }

    state = {
      ...state,
      [key]: candidate,
      /*
        Direct dimension edits intentionally leave a named device preset so the
        URL and readout always describe the allocation that is actually rendered.
      */
      ...(["container", "height"].includes(key) ? { device: "custom" } : {})
    };
    applyState();
  });
}

drawerToggle.addEventListener("click", () => {
  setDrawerOpen(drawerToggle.getAttribute("aria-expanded") !== "true");
});
drawerClose.addEventListener("click", () => setDrawerOpen(false));
drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));
mobileControlsQuery.addEventListener("change", () => setDrawerOpen(false, { returnFocus: false }));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawerToggle.getAttribute("aria-expanded") === "true") {
    setDrawerOpen(false);
    return;
  }

  trapDrawerFocus(event);
});

stateToggle.addEventListener("click", () => {
  const pressed = stateToggle.getAttribute("aria-pressed") !== "true";
  stateToggle.setAttribute("aria-pressed", String(pressed));
  stateToggle.textContent = pressed ? "Active state on" : "Toggle active state";
});

actionBarStickyToggle.addEventListener("click", () => {
  const pressed = actionBarStickyToggle.getAttribute("aria-pressed") !== "true";
  actionBarStickyToggle.setAttribute("aria-pressed", String(pressed));
  actionBarStickyToggle.textContent = pressed ? "Disable sticky mode" : "Enable sticky mode";
  fixtureActionBar.classList.toggle("ly-action-bar--sticky", pressed);
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => copySnippet(button));
});

const previewObserver = new ResizeObserver(updatePreviewReadout);
previewObserver.observe(previewFrame);
previewObserver.observe(previewWrapper);
window.addEventListener("resize", () => {
  syncHeightTier();
  updatePreviewReadout();
});

applyState();
setDrawerOpen(false, { returnFocus: false });
body.dataset.demoReady = "true";
