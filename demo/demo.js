const UI_STYLE_KIT_VERSION = "2.1.0";
const UI_STYLE_KIT_MANIFEST_URL = `https://unpkg.com/ui-style-kit-css@${UI_STYLE_KIT_VERSION}/manifest.json`;
const UI_STYLE_KIT_MANIFEST_FALLBACK = Object.freeze({
  version: UI_STYLE_KIT_VERSION,
  presets: Object.freeze([
    Object.freeze({ id: "minimal-saas", label: "Minimal SaaS", prefix: "saas" }),
    Object.freeze({ id: "bento", label: "Bento", prefix: "bento" }),
    Object.freeze({ id: "maximalist", label: "Maximalist", prefix: "max" }),
    Object.freeze({ id: "bauhaus", label: "Bauhaus", prefix: "bau" }),
    Object.freeze({ id: "tactile", label: "Tactile", prefix: "tactile" }),
    Object.freeze({ id: "neumorphism", label: "Neumorphism", prefix: "neo" }),
    Object.freeze({ id: "retrofuturism", label: "Retrofuturism", prefix: "retro" }),
    Object.freeze({ id: "brutalism", label: "Brutalism", prefix: "brutal" }),
    Object.freeze({ id: "cyberpunk", label: "Cyberpunk", prefix: "cyber" }),
    Object.freeze({ id: "y2k", label: "Y2K", prefix: "y2k" }),
    Object.freeze({ id: "retro-glass", label: "Retro Glass", prefix: "rg" })
  ]),
  themes: Object.freeze([
    "midnight-gold",
    "ocean-steel",
    "forest-moss",
    "sunset-ember",
    "royal-plum",
    "graphite-cyan",
    "desert-sage",
    "rose-quartz",
    "cyber-lime",
    "arctic-indigo"
  ]),
  modes: Object.freeze(["light", "dark", "contrast"])
});

function normalizeUiStyleKitManifest(manifest) {
  const normalized = {
    version: String(manifest?.version ?? UI_STYLE_KIT_VERSION),
    presets: Array.isArray(manifest?.presets) ? manifest.presets : [],
    themes: Array.isArray(manifest?.themes) ? manifest.themes : [],
    modes: Array.isArray(manifest?.modes) ? manifest.modes : []
  };
  const presets = normalized.presets
    .map((preset) => ({
      id: String(preset?.id ?? ""),
      label: String(preset?.label ?? preset?.id ?? ""),
      prefix: String(preset?.prefix ?? "")
    }))
    .filter((preset) => preset.id && preset.prefix);

  if (presets.length === 0 || normalized.themes.length === 0 || normalized.modes.length === 0) {
    throw new Error("UI Style Kit manifest is missing presets, themes, or modes.");
  }

  return Object.freeze({
    version: normalized.version,
    presets: Object.freeze(presets.map((preset) => Object.freeze(preset))),
    themes: Object.freeze(normalized.themes.map(String)),
    modes: Object.freeze(normalized.modes.map(String))
  });
}

async function loadUiStyleKitManifest() {
  try {
    const response = await fetch(UI_STYLE_KIT_MANIFEST_URL, { cache: "force-cache" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return normalizeUiStyleKitManifest(await response.json());
  } catch (error) {
    /*
      The published demo can render before the companion UI release reaches every CDN edge.
      The fallback mirrors the 2.1 manifest contract so layout behavior stays testable.
    */
    console.warn("UI Style Kit 2.1 manifest unavailable; using the packaged fallback.", error);
    return UI_STYLE_KIT_MANIFEST_FALLBACK;
  }
}

const UI_STYLE_KIT_MANIFEST = await loadUiStyleKitManifest();
const ALLOWLISTS = Object.freeze({
  wrapper: Object.freeze(["default", "compact", "prose", "content", "wide", "full", "breakout"]),
  recipe: Object.freeze([
    "app-shell",
    "dashboard",
    "docs",
    "list-detail",
    "split-hero",
    "gallery",
    "card-grid"
  ]),
  personality: Object.freeze([
    "minimal-saas",
    "bauhaus",
    "tactile",
    "cyberpunk",
    "f-pattern",
    "brutalism",
    "neumorphism",
    "y2k",
    "retro-glass",
    "z-pattern",
    "retrofuturism",
    "mondrian",
    "synthwave",
    "bento",
    "maximalist",
    "split-screen"
  ]),
  container: Object.freeze(["auto", "40rem", "47rem", "49rem", "63rem", "65rem", "80rem"]),
  density: Object.freeze(["compact", "comfortable", "spacious"]),
  ui: Object.freeze(UI_STYLE_KIT_MANIFEST.presets.map((preset) => preset.id)),
  theme: Object.freeze(UI_STYLE_KIT_MANIFEST.themes),
  mode: Object.freeze(UI_STYLE_KIT_MANIFEST.modes),
  ecosystem: Object.freeze(["layout-only", "layout-ui", "all-three"])
});

const DEFAULT_STATE = Object.freeze({
  wrapper: "default",
  recipe: "app-shell",
  personality: "minimal-saas",
  container: "auto",
  density: "comfortable",
  ui: "minimal-saas",
  theme: "arctic-indigo",
  mode: "light",
  ecosystem: "all-three"
});

const CONTAINER_WIDTHS = Object.freeze({
  auto: "100%",
  "40rem": "40rem",
  "47rem": "47rem",
  "49rem": "49rem",
  "63rem": "63rem",
  "65rem": "65rem",
  "80rem": "80rem"
});

const DENSITY_GAPS = Object.freeze({
  compact: "0.5rem",
  comfortable: "1rem",
  spacious: "1.5rem"
});

const UI_CLASS_PREFIXES = Object.freeze(
  Object.fromEntries(UI_STYLE_KIT_MANIFEST.presets.map((preset) => [preset.id, preset.prefix]))
);

const RECIPE_CLASSES = Object.freeze({
  "app-shell": "ly-app-shell",
  dashboard: "ly-dashboard",
  docs: "ly-docs",
  "list-detail": "ly-list-detail",
  "split-hero": "ly-split-hero",
  gallery: "ly-gallery",
  "card-grid": "ly-card-grid"
});

const RECIPE_AREAS = Object.freeze({
  "app-shell": Object.freeze(["header", "nav", "main", "aside", "footer"]),
  dashboard: Object.freeze(["header", "nav", "main", "aside", "footer"]),
  docs: Object.freeze(["header", "nav", "main", "aside", "footer"]),
  "list-detail": Object.freeze(["primary", "secondary", "actions"]),
  "split-hero": Object.freeze(["content", "media", "actions"])
});

const ECOSYSTEM_IMPORTS = Object.freeze({
  "layout-only": Object.freeze(['import "layout-style-css";']),
  "layout-ui": Object.freeze([
    'import "ui-style-kit-css/visual.css";',
    'import "layout-style-css";'
  ]),
  "all-three": Object.freeze([
    'import "ui-style-kit-css/visual.css";',
    'import "ui-style-kit-css/interactive-surface-theme.css";',
    'import "interactive-surface-css/state-core.css";',
    'import "layout-style-css";'
  ])
});

const ECOSYSTEM_LABELS = Object.freeze({
  "layout-only": "Layout only",
  "layout-ui": "Layout + UI",
  "all-three": "All three libraries"
});

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
const ecosystemStatus = document.querySelector("#ecosystemStatus");
const containerReadout = document.querySelector("#containerReadout");
const uiKitStylesheet = document.querySelector("#uiKitStylesheet");
const uiKitInteractiveThemeStylesheet = document.querySelector("#uiKitInteractiveThemeStylesheet");
const interactiveSurfaceStylesheet = document.querySelector("#interactiveSurfaceStylesheet");
const layoutIntegrationStylesheet = document.querySelector("#layoutIntegrationStylesheet");
const layoutCoreStylesheet = document.querySelector("#layoutCoreStylesheet");
const drawerToggle = document.querySelector("#demoControlsToggle");
const drawer = document.querySelector("#demoControlsDrawer");
const drawerClose = document.querySelector("#demoControlsClose");
const drawerBackdrop = document.querySelector("#demoControlsBackdrop");
const stateToggle = document.querySelector("#stateToggle");
const mobileControlsQuery = window.matchMedia("(max-width: 63.999rem)");

body.dataset.uiManifestVersion = UI_STYLE_KIT_MANIFEST.version;
syncUiManifestSelectOptions();

let state = readStateFromQuery();
let drawerReturnFocus = null;
let querySyncTimer = null;
let hasSynchronizedQuery = false;

function readStateFromQuery() {
  const query = new URLSearchParams(window.location.search);

  return Object.fromEntries(
    Object.entries(ALLOWLISTS).map(([key, values]) => {
      const candidate = query.get(key);
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

function createAction(sequence) {
  return createElement("button", {
    className: "interactive-surface",
    text: `${formatLabel(sequence)} action`,
    attributes: { type: "button", "data-ui-kit": "button" },
    data: { demoButton: "", demoFocus: sequence }
  });
}

function createRegion(area) {
  const semanticTags = {
    header: "header",
    nav: "nav",
    aside: "aside",
    footer: "footer",
    media: "figure",
    actions: "div"
  };
  const element = createElement(semanticTags[area] ?? "section", {
    className: "demo-region",
    attributes: { "data-ui-kit": "card" },
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
      className: "ly-scroll demo-list-scroll",
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
    attributes: { "data-ui-kit": "card" },
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

  recipePreview.className = `${RECIPE_CLASSES[recipe]} demo-recipe`;
  recipePreview.dataset.lyRecipe = recipe;
  recipePreview.replaceChildren(...children);
}

function formatLabel(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function syncUiManifestSelectOptions() {
  const optionGroups = {
    ui: UI_STYLE_KIT_MANIFEST.presets.map((preset) => ({
      value: preset.id,
      label: preset.label || formatLabel(preset.id)
    })),
    theme: UI_STYLE_KIT_MANIFEST.themes.map((theme) => ({
      value: theme,
      label: formatLabel(theme)
    })),
    mode: UI_STYLE_KIT_MANIFEST.modes.map((mode) => ({
      value: mode,
      label: mode === "contrast" ? "High contrast" : formatLabel(mode)
    }))
  };

  for (const [key, options] of Object.entries(optionGroups)) {
    const select = controls[key];

    if (!select) {
      continue;
    }

    select.replaceChildren(
      ...options.map(({ value, label }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        return option;
      })
    );
  }
}

function syncUiKitClasses() {
  const prefix = UI_CLASS_PREFIXES[state.ui];

  document.querySelectorAll("[data-ui-kit]").forEach((element) => {
    const previousClasses = element.dataset.uiKitApplied?.split(" ").filter(Boolean) ?? [];

    if (previousClasses.length > 0) {
      element.classList.remove(...previousClasses);
    }

    const nextClasses = element.dataset.uiKit
      .split(/\s+/)
      .filter(Boolean)
      .map((role) => `${prefix}-${role}`);

    if (nextClasses.length > 0) {
      element.classList.add(...nextClasses);
    }

    element.dataset.uiKitApplied = nextClasses.join(" ");
  });
}

function syncEcosystem() {
  const includesUi = state.ecosystem !== "layout-only";
  const includesInteractiveSurface = state.ecosystem === "all-three";

  uiKitStylesheet.disabled = !includesUi;
  uiKitInteractiveThemeStylesheet.disabled = !includesInteractiveSurface;
  interactiveSurfaceStylesheet.disabled = !includesInteractiveSurface;
  layoutIntegrationStylesheet.disabled = true;
  layoutCoreStylesheet.disabled = false;
  ecosystemStatus.textContent = ECOSYSTEM_LABELS[state.ecosystem];
}

function buildMarkupSnippet() {
  const wrapperClass = state.wrapper === "default" ? "ly-wrapper" : `ly-wrapper ly-wrapper--${state.wrapper}`;
  const rootClass = RECIPE_CLASSES[state.recipe];
  const areas = RECIPE_AREAS[state.recipe];
  const childMarkup = areas
    ? areas.map((area) => `    <section data-ly-area="${area}">${formatLabel(area)}</section>`).join("\n")
    : `    <article>Item 1</article>\n    <article>Item 2</article>`;

  return [
    `<div class="ly-root" data-ly-layout="${state.personality}">`,
    `  <div class="${wrapperClass}">`,
    `  <div class="${rootClass}" data-ly-recipe="${state.recipe}">`,
    childMarkup,
    "  </div>",
    "  </div>",
    "</div>"
  ].join("\n");
}

function syncSnippets() {
  // Snippets are rendered as inert text from allowlisted state, never parsed as HTML.
  importsSnippet.textContent = ECOSYSTEM_IMPORTS[state.ecosystem].join("\n");
  markupSnippet.textContent = buildMarkupSnippet();
}

function applyState({ updateQuery = true } = {}) {
  for (const [key, control] of Object.entries(controls)) {
    control.value = state[key];
  }

  body.dataset.ui = state.ui;
  body.dataset.theme = state.theme;
  body.dataset.mode = state.mode;
  body.dataset.lyLayout = state.personality;
  body.dataset.density = state.density;
  body.dataset.ecosystem = state.ecosystem;
  previewRoot.dataset.lyLayout = state.personality;
  previewRoot.style.setProperty("--ly-gap", DENSITY_GAPS[state.density]);
  previewRoot.style.setProperty("--ly-grid-gap", DENSITY_GAPS[state.density]);

  previewWrapper.className =
    state.wrapper === "default" ? "ly-wrapper" : `ly-wrapper ly-wrapper--${state.wrapper}`;
  previewFrame.dataset.containerWidth = state.container;
  previewFrame.style.setProperty("--demo-container-inline-size", CONTAINER_WIDTHS[state.container]);
  containerReadout.textContent = `Container: ${state.container}`;

  renderRecipe();
  syncUiKitClasses();
  syncEcosystem();
  syncSnippets();

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

    state = { ...state, [key]: candidate };
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

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => copySnippet(button));
});

applyState();
setDrawerOpen(false, { returnFocus: false });
body.dataset.demoReady = "true";
