const HOME_THEME_STORAGE_KEY = "tacos_fabian_home_theme";
const DEFAULT_HOME_THEME = "original";

export const HOME_THEME_VARIANTS = Object.freeze({
  original: {
    label: "Original",
  },
  "premium-noir": {
    label: "Premium Noir",
  },
  "premium-warm": {
    label: "Premium Warm",
  },
});

const resolveHomeTheme = (theme) => {
  if (typeof theme !== "string") return DEFAULT_HOME_THEME;
  return Object.hasOwn(HOME_THEME_VARIANTS, theme) ? theme : DEFAULT_HOME_THEME;
};

const readStoredHomeTheme = () => {
  try {
    return window.localStorage.getItem(HOME_THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

const storeHomeTheme = (theme) => {
  try {
    window.localStorage.setItem(HOME_THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures and keep the in-memory theme.
  }
};

export function initHomeTheme() {
  if (!(document.body instanceof HTMLElement)) return;

  const applyHomeTheme = (theme, { persist = true } = {}) => {
    const nextTheme = resolveHomeTheme(theme);
    document.body.dataset.homeTheme = nextTheme;
    if (persist) storeHomeTheme(nextTheme);
    return nextTheme;
  };

  const bodyTheme = document.body.dataset.homeTheme;
  const configuredTheme = typeof window.__HOME_THEME__ === "string" ? window.__HOME_THEME__ : "";
  const storedTheme = readStoredHomeTheme();
  const initialTheme = resolveHomeTheme(configuredTheme || storedTheme || bodyTheme || DEFAULT_HOME_THEME);

  applyHomeTheme(initialTheme, { persist: false });

  window.setHomeTheme = (theme, options = {}) => applyHomeTheme(theme, options);
  window.getHomeTheme = () => document.body.dataset.homeTheme || DEFAULT_HOME_THEME;
  window.getHomeThemeVariants = () => Object.keys(HOME_THEME_VARIANTS);
}
