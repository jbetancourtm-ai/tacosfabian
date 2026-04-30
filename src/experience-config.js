const EXPERIENCE_VARIANTS = {
  CLASSIC_INTRO: "classic-intro",
  HOME_DIRECT: "home-direct",
};

const DEFAULT_EXPERIENCE_VARIANT = EXPERIENCE_VARIANTS.CLASSIC_INTRO;

function resolveExperienceVariant() {
  const configuredVariant = window.__EXPERIENCE_VARIANT__;
  if (Object.values(EXPERIENCE_VARIANTS).includes(configuredVariant)) {
    return configuredVariant;
  }
  return DEFAULT_EXPERIENCE_VARIANT;
}

const EXPERIENCE_VARIANT = resolveExperienceVariant();
const IS_EXPERIMENTAL_HOME_DIRECT = EXPERIENCE_VARIANT === EXPERIENCE_VARIANTS.HOME_DIRECT;

function applyExperienceVariantToDocument() {
  document.documentElement.dataset.experienceVariant = EXPERIENCE_VARIANT;
  document.body?.setAttribute("data-experience-variant", EXPERIENCE_VARIANT);
}

export {
  EXPERIENCE_VARIANTS,
  DEFAULT_EXPERIENCE_VARIANT,
  EXPERIENCE_VARIANT,
  IS_EXPERIMENTAL_HOME_DIRECT,
  applyExperienceVariantToDocument,
};
