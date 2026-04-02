import { gsap } from "gsap";
import { initHomeTheme } from "./home-theme.js";
import { IS_EXPERIMENTAL_HOME_DIRECT, applyExperienceVariantToDocument } from "./experience-config.js";

const menuBtn = document.querySelector("#menuBtn");
const navMenu = document.querySelector("#navMenu");
const navOverlay = document.querySelector("#navOverlay");
const siteHeader = document.querySelector(".site-header");
const navLinks = Array.from(document.querySelectorAll('#navMenu a[href^="#"]'));
const reviewsStatus = document.querySelector("#reviewsStatus");
const reviewsAverage = document.querySelector("#reviewsAverage");
const reviewsAverageBadge = document.querySelector("#reviewsAverageBadge");
const reviewsSatisfied = document.querySelector("#reviewsSatisfied");
const heroProofAvg = document.querySelector("#heroProofAvg");
const heroProofCount = document.querySelector("#heroProofCount");
const heroProofAvgLabel = "\u2605 5.0 sabor recomendado";
const heroProofCountLabel = "+216 pedidos con antojo resuelto";
const reviewsList = document.querySelector("#reviewsList");
const reviewsSection = document.querySelector("#resenas");
const reviewForm = document.querySelector("#reviewForm");
const formStatus = document.querySelector("#formStatus");
const commentInput = document.querySelector("#comment");
const commentCounter = document.querySelector("#commentCounter");
const toastRegion = document.querySelector("#toastRegion");
const floatingFabianHost = document.querySelector("#fabianMain");
const floatingFabianSprite = floatingFabianHost?.querySelector(".floating-fabian-host__sprite");
const floatingWhatsapp = document.querySelector("#floatingWhatsapp");
const footer = document.querySelector(".site-footer");
const visitCounter = document.querySelector("#visitCounter");
const heroMenuDestacadoBtn = document.querySelector("#heroMenuDestacadoBtn");
const quickCategoryLinks = Array.from(document.querySelectorAll("[data-category-link]"));
const quickCategoryTargets = Array.from(document.querySelectorAll("[data-category-target]"));
const introScreen = document.querySelector("#intro-screen");
const introSkipBtn = document.querySelector("#introSkipBtn");
const homeHostsExperiment = document.querySelector("#homeHostsExperiment");
const homeHostFabian = document.querySelector("#homeHostFabian");
const homeHostFavio = document.querySelector("#homeHostFavio");
const homeHostFabianVideo = document.querySelector("#homeHostFabianVideo");
const homeHostFavioVideo = document.querySelector("#homeHostFavioVideo");
const whatsappLinks = Array.from(document.querySelectorAll('a[href*="wa.me/"]')).filter((link) => !link.closest("#intro-screen"));
const installAppButtons = Array.from(document.querySelectorAll("#installAppBtn, #introInstallAppBtn"));
const exitAppButtons = Array.from(document.querySelectorAll("#exitAppBtn"));
const ambientAudioToggle = document.querySelector("#ambientAudioToggle");

const menuCarousel = document.querySelector("#menuCarousel");
const menuTrack = document.querySelector("#menuTrack");
const menuPrev = document.querySelector("#menuPrev");
const menuNext = document.querySelector("#menuNext");
const menuDots = document.querySelector("#menuDots");

const menuModal = document.querySelector("#menuModal");
const menuModalBackdrop = document.querySelector("#menuModalBackdrop");
const menuModalClose = document.querySelector("#menuModalClose");
const menuModalTitle = document.querySelector("#menuModalTitle");
const menuModalDescription = document.querySelector("#menuModalDescription");
const menuModalPrice = document.querySelector("#menuModalPrice");
const menuCards = Array.from(document.querySelectorAll(".menu-item"));
const menuOrderFab = document.querySelector("#menuOrderFab");
const menuOrderFabToggle = document.querySelector("#menuOrderFabToggle");
const menuOrderFabCheckout = document.querySelector("#menuOrderFabCheckout");
const menuOrderFabCount = document.querySelector("#menuOrderFabCount");
const menuOrderFabTotal = document.querySelector("#menuOrderFabTotal");
const menuOrderBackdrop = document.querySelector("#menuOrderBackdrop");
const menuOrderShell = document.querySelector("#menuOrderShell");
const menuOrderClose = document.querySelector("#menuOrderClose");
const menuOrderItems = document.querySelector("#menuOrderItems");
const menuOrderEmpty = document.querySelector("#menuOrderEmpty");
const menuOrderCount = document.querySelector("#menuOrderCount");
const menuOrderTotal = document.querySelector("#menuOrderTotal");
const menuOrderCheckout = document.querySelector("#menuOrderCheckout");
const menuOrderClear = document.querySelector("#menuOrderClear");
const orderCheckoutModal = document.querySelector("#orderCheckoutModal");
const orderCheckoutBackdrop = document.querySelector("#orderCheckoutBackdrop");
const orderCheckoutClose = document.querySelector("#orderCheckoutClose");
const orderCheckoutCancel = document.querySelector("#orderCheckoutCancel");
const orderCheckoutForm = document.querySelector("#orderCheckoutForm");
const orderCheckoutCount = document.querySelector("#orderCheckoutCount");
const orderCheckoutTotal = document.querySelector("#orderCheckoutTotal");
const orderCustomerName = document.querySelector("#orderCustomerName");
const orderCustomerAddress = document.querySelector("#orderCustomerAddress");
const orderCustomerReference = document.querySelector("#orderCustomerReference");
const orderUseLocationBtn = document.querySelector("#orderUseLocationBtn");
const orderLocationStatus = document.querySelector("#orderLocationStatus");
const orderManualLocationHint = document.querySelector("#orderManualLocationHint");
let siteAmbientAudio = null;
let siteAmbientStarting = false;
let siteAmbientObserver = null;
let ambientAudioSourceIndex = 0;
let whatsappAudioContext = null;
let deferredInstallPrompt = null;
let swRefreshPending = false;
let reviewsLoaded = false;
const ORDER_WHATSAPP_NUMBER = "525615496107";

initHomeTheme();
applyExperienceVariantToDocument();

const HOME_HOSTS_COMPLETE_EVENT = "home-hosts:complete";

function hasActiveIntro() {
  return !IS_EXPERIMENTAL_HOME_DIRECT && Boolean(introScreen?.isConnected) && document.body.classList.contains("intro-active");
}

function resolveOverlayMediaSource(video) {
  if (!(video instanceof HTMLVideoElement)) {
    return { src: "", type: "" };
  }

  const preferredSrc = video.dataset.preferredVisual || "";
  const browserFallbackSrc = video.dataset.browserFallback || "";
  const audioFallbackSrc = video.dataset.audioFallback || browserFallbackSrc || preferredSrc;
  const preferredType = preferredSrc.endsWith(".mp4") ? "video/mp4" : 'video/webm; codecs="vp9,opus"';
  const canPlayPreferred = preferredType.includes("webm") ? video.canPlayType(preferredType) : "probably";

  if (preferredSrc && (!preferredType.includes("webm") || canPlayPreferred === "probably" || canPlayPreferred === "maybe")) {
    return { src: preferredSrc, type: preferredType };
  }

  return {
    src: browserFallbackSrc || audioFallbackSrc,
    type: "video/mp4",
  };
}

function scheduleIdleWork(callback, timeout = 900) {
  if (typeof callback !== "function") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => callback(), { timeout });
    return;
  }
  window.setTimeout(callback, Math.min(timeout, 240));
}

function showToast(message, type = "info") {
  if (!toastRegion) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  toastRegion.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function formatMxCurrency(value) {
  const amount = Number(value) || 0;
  return `$${amount.toLocaleString("es-MX")} MXN`;
}

function parsePriceAmount(priceText) {
  const clean = String(priceText || "").replace(/[^\d.]/g, "");
  return Number(clean) || 0;
}

if (menuBtn && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove("open");
    navOverlay?.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  menuBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navOverlay?.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.classList.toggle("menu-open", isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) closeMenu();
  });

  navOverlay?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

function setupHeaderEffects() {
  if (siteHeader) {
    const onScroll = () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { threshold: 0.5, rootMargin: "-20% 0px -35% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupSiteAmbientAudio() {
  const storageKey = "tacos_fabian_premium_ambient";
  const ambientSources = ["/audio/ambient-main.mp3.mp3", "/audio/taqueria-ambient-night.wav"];
  const targetVolume = 0.038;
  const introExitDelayMs = 520;
  let ambientEnabled = false;
  let unlockListenersBound = false;

  const readStoredPreference = () => {
    try {
      const value = window.localStorage.getItem(storageKey);
      if (value === null) return true;
      return value === "on";
    } catch {
      return true;
    }
  };

  const storePreference = (enabled) => {
    try {
      window.localStorage.setItem(storageKey, enabled ? "on" : "off");
    } catch {
      // Ignore storage failures.
    }
  };

  const ensureAmbientAudio = () => {
    if (siteAmbientAudio) return siteAmbientAudio;
    siteAmbientAudio = new Audio();
    siteAmbientAudio.preload = "metadata";
    siteAmbientAudio.playsInline = true;
    siteAmbientAudio.loop = true;
    siteAmbientAudio.volume = 0;
    return siteAmbientAudio;
  };

  const fadeAmbientTo = (volume, duration = 1.2) => {
    if (!siteAmbientAudio) return;
    gsap.killTweensOf(siteAmbientAudio);
    gsap.to(siteAmbientAudio, {
      volume,
      duration,
      ease: "sine.inOut",
      overwrite: true,
    });
  };

  const setAmbientSource = (index = 0) => {
    const audio = ensureAmbientAudio();
    const nextSrc = ambientSources[index];
    if (!nextSrc) return false;
    const absoluteNextSrc = new URL(nextSrc, window.location.origin).href;
    if (audio.currentSrc === absoluteNextSrc || audio.src === absoluteNextSrc) {
      ambientAudioSourceIndex = index;
      return true;
    }
    ambientAudioSourceIndex = index;
    audio.src = nextSrc;
    return true;
  };

  const updateAmbientToggle = () => {
    if (!(ambientAudioToggle instanceof HTMLButtonElement)) return;
    const isPlaying = Boolean(siteAmbientAudio && !siteAmbientAudio.paused && siteAmbientAudio.volume > 0.005);
    ambientAudioToggle.classList.toggle("is-active", isPlaying);
    ambientAudioToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
    ambientAudioToggle.setAttribute("aria-label", isPlaying ? "Pausar ambiente" : "Activar ambiente");
    ambientAudioToggle.title = isPlaying ? "Pausar ambiente" : "Activar ambiente";
    const textNode = ambientAudioToggle.querySelector(".ambient-audio-toggle__text");
    if (textNode) textNode.textContent = isPlaying ? "Pausar ambiente" : "Activar ambiente";
  };

  const removeUnlockListeners = () => {
    if (!unlockListenersBound) return;
    unlockListenersBound = false;
    window.removeEventListener("pointerdown", tryUnlockAmbientFromGesture, true);
    window.removeEventListener("touchstart", tryUnlockAmbientFromGesture, true);
    window.removeEventListener("keydown", tryUnlockAmbientFromGesture, true);
  };

  const armUnlockListeners = () => {
    if (unlockListenersBound) return;
    unlockListenersBound = true;
    window.addEventListener("pointerdown", tryUnlockAmbientFromGesture, true);
    window.addEventListener("touchstart", tryUnlockAmbientFromGesture, true);
    window.addEventListener("keydown", tryUnlockAmbientFromGesture, true);
  };

  const pauseAmbient = ({ immediate = false } = {}) => {
    if (!siteAmbientAudio) {
      updateAmbientToggle();
      return;
    }
    if (immediate) {
      gsap.killTweensOf(siteAmbientAudio);
      siteAmbientAudio.volume = 0;
      siteAmbientAudio.pause();
      updateAmbientToggle();
      return;
    }
    gsap.killTweensOf(siteAmbientAudio);
    gsap.to(siteAmbientAudio, {
      volume: 0,
      duration: 0.6,
      ease: "sine.inOut",
      overwrite: true,
      onComplete: () => {
        siteAmbientAudio?.pause();
        updateAmbientToggle();
      },
    });
  };

  const playAmbient = async ({ force = false } = {}) => {
    if (!ambientEnabled && !force) return false;
    if (document.body.classList.contains("intro-active")) return false;

    const audio = ensureAmbientAudio();
    if (!audio.src) setAmbientSource(0);
    if (siteAmbientStarting) return false;

    siteAmbientStarting = true;
    try {
      if (audio.paused) await audio.play();
      fadeAmbientTo(targetVolume, 1.6);
      removeUnlockListeners();
      updateAmbientToggle();
      return true;
    } catch {
      armUnlockListeners();
      updateAmbientToggle();
      return false;
    } finally {
      siteAmbientStarting = false;
    }
  };

  async function tryUnlockAmbientFromGesture() {
    if (!ambientEnabled || document.body.classList.contains("intro-active")) return;
    const started = await playAmbient({ force: true });
    if (started) removeUnlockListeners();
  }

  const syncAmbientWithPage = () => {
    if (document.body.classList.contains("intro-active") || !ambientEnabled || document.visibilityState === "hidden") {
      pauseAmbient({ immediate: document.visibilityState === "hidden" });
      return;
    }
    void playAmbient();
  };

  ambientEnabled = readStoredPreference();
  setAmbientSource(0);
  updateAmbientToggle();

  siteAmbientAudio?.addEventListener("error", () => {
    const nextIndex = ambientAudioSourceIndex + 1;
    if (!ambientSources[nextIndex]) {
      pauseAmbient({ immediate: true });
      return;
    }
    setAmbientSource(nextIndex);
    if (ambientEnabled && !document.body.classList.contains("intro-active")) {
      void playAmbient({ force: true });
    }
  });

  siteAmbientAudio?.addEventListener("ended", () => {
    if (!siteAmbientAudio) return;
    siteAmbientAudio.currentTime = 0;
    if (ambientEnabled) void playAmbient({ force: true });
  });

  ambientAudioToggle?.addEventListener("click", async () => {
    ambientEnabled = !(siteAmbientAudio && !siteAmbientAudio.paused && siteAmbientAudio.volume > 0.005);
    storePreference(ambientEnabled);
    if (!ambientEnabled) {
      pauseAmbient();
      return;
    }
    if (document.body.classList.contains("intro-active")) {
      updateAmbientToggle();
      showToast("El ambiente comenzara cuando termine el intro.", "info");
      return;
    }
    const started = await playAmbient({ force: true });
    if (!started) {
      armUnlockListeners();
      showToast("Tu navegador activará el ambiente en la siguiente interacción.", "info");
      updateAmbientToggle();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      pauseAmbient({ immediate: true });
      return;
    }
    syncAmbientWithPage();
  });

  siteAmbientObserver = new MutationObserver(() => {
    window.setTimeout(syncAmbientWithPage, introExitDelayMs);
  });
  siteAmbientObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  syncAmbientWithPage();
  if (ambientEnabled) armUnlockListeners();
}

function setupPwaSupport() {
  const isStandaloneMode = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const userAgent = window.navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  const isMobileViewport = window.matchMedia("(max-width: 899px)");
  const canOfferManualInstall = isIos || isAndroid || isMobileViewport.matches;

  const getManualInstallMessage = () => {
    if (isIos) {
      return "En iPhone o iPad: toca Compartir y luego Agregar a pantalla de inicio.";
    }

    if (isAndroid) {
      return "En Android: abre el menu del navegador y toca Instalar app o Agregar a pantalla de inicio.";
    }

    return "Si tu navegador lo permite, usa el menu y toca Instalar app o Agregar a pantalla de inicio.";
  };

  const syncInstallButton = (visible, { ready = false } = {}) => {
    installAppButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.hidden = !visible;
      button.setAttribute("aria-hidden", visible ? "false" : "true");
      button.disabled = !visible;
      button.classList.toggle("is-ready", ready);
    });
  };

  const syncExitButton = (visible) => {
    exitAppButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.hidden = !visible;
      button.setAttribute("aria-hidden", visible ? "false" : "true");
      button.disabled = !visible;
    });
  };

  const waitForInstallPrompt = (timeoutMs = 1800) =>
    new Promise((resolve) => {
      if (deferredInstallPrompt) {
        resolve(true);
        return;
      }

      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        window.removeEventListener("app-installable", handleInstallable);
        resolve(result);
      };

      const handleInstallable = () => finish(true);
      const timeoutId = window.setTimeout(() => finish(Boolean(deferredInstallPrompt)), timeoutMs);

      window.addEventListener("app-installable", handleInstallable, { once: true });
    });

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      watchServiceWorkerRegistration(registration);
      void registration.update();
      return registration;
    } catch (error) {
      console.error("No se pudo registrar el service worker", error);
      return null;
    }
  };

  syncInstallButton(!isStandaloneMode() && canOfferManualInstall, { ready: Boolean(deferredInstallPrompt) });
  syncExitButton(isStandaloneMode());

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    if (isStandaloneMode()) return;
    deferredInstallPrompt = event;
    syncInstallButton(true, { ready: true });
    window.dispatchEvent(new CustomEvent("app-installable"));
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    syncInstallButton(false);
    syncExitButton(true);
  });

  if (!isStandaloneMode() && canOfferManualInstall) {
    syncInstallButton(true, { ready: Boolean(deferredInstallPrompt) });
  }

  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (event) => {
    if (event.matches) {
      deferredInstallPrompt = null;
      syncInstallButton(false);
      syncExitButton(true);
      return;
    }
    syncInstallButton(canOfferManualInstall, { ready: Boolean(deferredInstallPrompt) });
    syncExitButton(false);
  });

  const handleExitAppClick = () => {
    if (!isStandaloneMode()) {
      showToast("Este boton funciona cuando la web esta abierta como app instalada.", "info");
      return;
    }

    document.body.classList.add("app-exit-pending");

    const fallbackExitMessage = () => {
      showToast("Si la app no se cierra sola, usa el gesto Atrás o el selector de apps recientes.", "info");
    };

    const browserUrl = new URL(window.location.href);
    browserUrl.searchParams.set("source", "browser");
    browserUrl.hash ||= "top";

    try {
      const externalWindow = window.open(browserUrl.toString(), "_blank", "noopener,noreferrer");
      externalWindow?.focus?.();
    } catch {}

    window.setTimeout(() => {
      try {
        window.close();
      } catch {}
    }, 40);

    window.setTimeout(() => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      try {
        window.location.replace(browserUrl.toString());
      } catch {}
    }, 180);

    window.setTimeout(() => {
      document.body.classList.remove("app-exit-pending");
      fallbackExitMessage();
    }, 900);
  };

  exitAppButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener("click", handleExitAppClick);
  });

  const handleInstallClick = async (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;

    if (isStandaloneMode()) {
      showToast("La app ya esta abierta en modo instalado.", "info");
      syncInstallButton(false);
      return;
    }

    if (!deferredInstallPrompt) {
      if (!isIos) {
        button.disabled = true;

        try {
          await registerServiceWorker();
          await waitForInstallPrompt();
        } finally {
          button.disabled = false;
        }
      }
    }

    if (!deferredInstallPrompt) {
      showToast(getManualInstallMessage(), "info");
      syncInstallButton(canOfferManualInstall, { ready: false });
      return;
    }

    installAppButtons.forEach((item) => {
      if (item instanceof HTMLButtonElement) item.disabled = true;
    });

    try {
      await deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      syncInstallButton(false);

      if (outcome !== "accepted") {
        showToast("Puedes instalar la app mas tarde desde el navegador.", "info");
      }
    } catch {
      installAppButtons.forEach((item) => {
        if (item instanceof HTMLButtonElement) item.disabled = false;
      });
      syncInstallButton(canOfferManualInstall, { ready: Boolean(deferredInstallPrompt) });
    }
  };

  installAppButtons.forEach((button) => {
    button.addEventListener("click", handleInstallClick);
  });

  syncInstallButton(!isStandaloneMode() && canOfferManualInstall, { ready: Boolean(deferredInstallPrompt) });

  if (!("serviceWorker" in navigator)) return;

  const refreshForUpdatedServiceWorker = () => {
    if (swRefreshPending) return;
    swRefreshPending = true;
    window.location.reload();
  };

  const requestWaitingWorkerActivation = (registration) => {
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  const watchServiceWorkerRegistration = (registration) => {
    if (!registration) return;

    if (registration.waiting) {
      requestWaitingWorkerActivation(registration);
    }

    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;
      installingWorker.addEventListener("statechange", () => {
        if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
          requestWaitingWorkerActivation(registration);
        }
      });
    });
  };

  navigator.serviceWorker.addEventListener("controllerchange", refreshForUpdatedServiceWorker, { once: true });

  void registerServiceWorker();
}

function setupFabianVideos() {
  const fabianVideos = Array.from(document.querySelectorAll(".intro-screen__host-video:not([data-intro-managed='true'])"));
  if (!fabianVideos.length) return;

  const isStandaloneMode = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

  const pickBestSource = (video) => {
    if (!(video instanceof HTMLVideoElement)) return null;
    const preferredSrc = video.dataset.preferredVisual || "/images/fabian_transparente_mejor.webm";
    const fallbackSrc = video.dataset.browserFallback || video.dataset.audioFallback || "/images/fabian_web_audio5.mp4";
    const canPlayPreferred = video.canPlayType('video/webm; codecs="vp9,opus"');

    if (!isStandaloneMode() && fallbackSrc) {
      return {
        src: fallbackSrc,
        type: "video/mp4",
      };
    }

    if (preferredSrc.endsWith(".webm") && !isStandaloneMode() && canPlayPreferred !== "probably" && fallbackSrc) {
      return {
        src: fallbackSrc,
        type: "video/mp4",
      };
    }

    return {
      src: preferredSrc,
      type: preferredSrc.endsWith(".mp4") ? "video/mp4" : 'video/webm; codecs="vp9,opus"',
    };
  };

  const swapToFallback = (video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    const fallbackSrc = video.dataset.browserFallback || video.dataset.audioFallback || "/images/fabian_web_audio5.mp4";
    if (!fallbackSrc || video.dataset.resolvedSrc === fallbackSrc) return;
    video.src = fallbackSrc;
    video.dataset.resolvedSrc = fallbackSrc;
    video.dataset.resolvedType = "video/mp4";
    video.load();
  };

  const prepareVideo = (video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    const introManaged = video.dataset.introManaged === "true";
    if (introManaged) {
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.autoplay = true;
      video.loop = false;
      video.preload = "metadata";
      video.controls = false;
      return;
    }
    const bestSource = pickBestSource(video);
    if (bestSource && !video.dataset.resolvedSrc) {
      video.src = bestSource.src;
      video.dataset.resolvedSrc = bestSource.src;
      video.dataset.resolvedType = bestSource.type;
      video.load();
    }
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.autoplay = true;
    video.loop = false;
    video.preload = "metadata";
    video.controls = false;
    video.muted = !isStandaloneMode();
    video.defaultMuted = !isStandaloneMode();
  };

  fabianVideos.forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    video.classList.remove("is-ready");
    video.addEventListener("loadeddata", () => prepareVideo(video), { once: true });
    video.addEventListener("loadeddata", () => video.classList.add("is-ready"));
    video.addEventListener("canplay", () => video.classList.add("is-ready"));
    video.addEventListener("playing", () => video.classList.add("is-ready"));
    video.addEventListener("error", () => swapToFallback(video));
    video.addEventListener("stalled", () => swapToFallback(video));
    prepareVideo(video);
  });
}

function setupDeferredIntroPromo() {
  const promoVideo = document.querySelector(".intro-screen__promo-video");
  if (!(promoVideo instanceof HTMLVideoElement)) return;

  const source = promoVideo.querySelector("source[data-src]");
  if (!(source instanceof HTMLSourceElement)) return;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrainedDevice =
    window.innerWidth <= 899 ||
    Boolean(connection?.saveData) ||
    /(?:2g|3g)/i.test(connection?.effectiveType || "") ||
    (typeof connection?.downlink === "number" && connection.downlink > 0 && connection.downlink < 1.6);

  if (constrainedDevice) return;

  let hydrated = false;

  const hydratePromo = () => {
    if (hydrated || !hasActiveIntro()) return;
    hydrated = true;
    source.src = source.dataset.src || "";
    source.removeAttribute("data-src");
    promoVideo.load();
    const startPlayback = promoVideo.play();
    if (startPlayback && typeof startPlayback.catch === "function") {
      startPlayback.catch(() => {});
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        hydratePromo();
      },
      { threshold: 0.01 }
    );
    observer.observe(promoVideo);
  } else {
    scheduleIdleWork(hydratePromo, 4200);
  }

  scheduleIdleWork(hydratePromo, 5200);
}

function setupWhatsappAudio() {
  if (!whatsappLinks.length) return;

  const playWhatsappChime = () => {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!whatsappAudioContext) whatsappAudioContext = new AudioContextCtor();
    const context = whatsappAudioContext;
    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime + 0.01;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.018, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    gain.connect(context.destination);

    const toneA = context.createOscillator();
    toneA.type = "triangle";
    toneA.frequency.setValueAtTime(740, now);
    toneA.frequency.exponentialRampToValueAtTime(988, now + 0.18);
    toneA.connect(gain);

    const toneB = context.createOscillator();
    toneB.type = "sine";
    toneB.frequency.setValueAtTime(1110, now + 0.08);
    toneB.connect(gain);

    toneA.start(now);
    toneB.start(now + 0.08);
    toneA.stop(now + 0.38);
    toneB.stop(now + 0.62);
  };

  whatsappLinks.forEach((link) => {
    link.addEventListener("click", playWhatsappChime, { passive: true });
  });
}

function setupHomeHostsExperiment() {
  if (!IS_EXPERIMENTAL_HOME_DIRECT) {
    document.body.dataset.homeHostsExperimentComplete = "true";
    window.dispatchEvent(new CustomEvent(HOME_HOSTS_COMPLETE_EVENT));
    return;
  }

  if (!(homeHostsExperiment instanceof HTMLElement)) {
    document.body.dataset.homeHostsExperimentComplete = "true";
    window.dispatchEvent(new CustomEvent(HOME_HOSTS_COMPLETE_EVENT));
    return;
  }

  if (homeHostsExperiment.dataset.sequenceStarted === "true") return;
  homeHostsExperiment.dataset.sequenceStarted = "true";
  document.body.dataset.homeHostsExperimentComplete = "false";
  document.body.classList.add("home-hosts-active");
  homeHostsExperiment.hidden = false;
  homeHostsExperiment.setAttribute("aria-hidden", "false");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const speakerCards = {
    fabian: homeHostFabian,
    favio: homeHostFavio,
  };
  const speakerVideos = {
    fabian: homeHostFabianVideo,
    favio: homeHostFavioVideo,
  };
  const speakerFallbackAudio = {
    fabian:
      homeHostFabianVideo instanceof HTMLVideoElement && homeHostFabianVideo.dataset.audioFallback
        ? new Audio(homeHostFabianVideo.dataset.audioFallback)
        : null,
    favio: null,
  };
  const speakerLines = {
    fabian: "Hola, bienvenido a Tacos Fabian en Texcoco.",
    favio: "Arma tu pedido rapido desde el menu o pidelo por WhatsApp.",
  };
  const availableCards = Object.values(speakerCards).filter((card) => card instanceof HTMLElement);
  const speakerPlaybackFallbackMs = {
    fabian: reducedMotion ? 2200 : 4200,
    favio: reducedMotion ? 2200 : 4200,
  };
  const entranceDuration = reducedMotion ? 0.18 : 0.55;
  const revealDuration = reducedMotion ? 0.2 : 0.38;
  const betweenLineMs = reducedMotion ? 140 : 220;
  const exitDuration = reducedMotion ? 0.18 : 0.45;
  let playbackTimer = 0;
  let nextStepTimer = 0;
  let sequenceCompleted = false;
  const revealedSpeakers = new Set();

  const clearTimers = () => {
    window.clearTimeout(playbackTimer);
    window.clearTimeout(nextStepTimer);
  };

  const cancelSpeechFallback = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  };

  const mediaHasUsableAudio = (video) => {
    if (!(video instanceof HTMLVideoElement)) return false;
    if (typeof video.mozHasAudio === "boolean") return video.mozHasAudio;
    if (video.audioTracks && typeof video.audioTracks.length === "number") {
      return video.audioTracks.length > 0;
    }
    if (typeof video.webkitAudioDecodedByteCount === "number") {
      return video.webkitAudioDecodedByteCount > 0;
    }
    return false;
  };

  const prepareSequenceVideo = (video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    video.closest(".home-host-card")?.classList.remove("has-video");
    const resolvedMedia = resolveOverlayMediaSource(video);
    if (resolvedMedia.src) {
      video.src = resolvedMedia.src;
      video.dataset.resolvedSrc = resolvedMedia.src;
      video.dataset.resolvedType = resolvedMedia.type;
    }
    video.muted = false;
    video.defaultMuted = false;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.autoplay = false;
    video.loop = false;
    video.controls = false;
    video.preload = "metadata";
    video.volume = 0.88;
    video.classList.remove("is-ready");
    const markReady = () => {
      video.classList.add("is-ready");
    };
    video.addEventListener("loadeddata", markReady, { once: true });
    video.addEventListener("canplay", markReady, { once: true });
    video.addEventListener(
      "playing",
      () => {
        markReady();
        video.closest(".home-host-card")?.classList.add("has-video");
      },
      { once: true }
    );
    video.load();
  };

  const playSpeechFallback = async (speaker) => {
    if (!("speechSynthesis" in window)) return false;
    const line = speakerLines[speaker];
    if (!line) return false;

    return await new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(line);
      utterance.lang = "es-MX";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        utterance.onend = null;
        utterance.onerror = null;
        resolve(result);
      };

      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);

      try {
        cancelSpeechFallback();
        window.speechSynthesis.speak(utterance);
      } catch {
        finish(false);
      }
    });
  };

  const playSequenceVideo = async (speaker) => {
    const video = speakerVideos[speaker];
    if (!(video instanceof HTMLVideoElement)) return { started: false, audible: false };
    const fallbackAudio = speakerFallbackAudio[speaker];
    try {
      video.currentTime = 0;
    } catch {}
    if (fallbackAudio instanceof HTMLAudioElement) {
      fallbackAudio.preload = "metadata";
      fallbackAudio.loop = false;
      fallbackAudio.volume = 0.88;
      try {
        fallbackAudio.currentTime = 0;
      } catch {}
    }
    try {
      video.muted = false;
      video.defaultMuted = false;
      await video.play();
      video.classList.add("is-ready");
      video.closest(".home-host-card")?.classList.add("has-video");
      if (!mediaHasUsableAudio(video) && fallbackAudio instanceof HTMLAudioElement) {
        video.muted = true;
        video.defaultMuted = true;
        await fallbackAudio.play();
        return { started: true, audible: true };
      }
      return { started: true, audible: mediaHasUsableAudio(video) };
    } catch {
      if (fallbackAudio instanceof HTMLAudioElement) {
        try {
          await fallbackAudio.play();
          return { started: true, audible: true };
        } catch {
          // Keep image fallback visible if playback is blocked.
        }
      }
      return { started: false, audible: false };
    }
  };

  const pauseSequenceVideos = () => {
    Object.values(speakerVideos).forEach((video) => {
      if (!(video instanceof HTMLVideoElement)) return;
      video.pause();
    });
    Object.values(speakerFallbackAudio).forEach((audio) => {
      if (!(audio instanceof HTMLAudioElement)) return;
      audio.pause();
    });
    cancelSpeechFallback();
  };

  const setSpeakerState = (speaker) => {
    Object.entries(speakerCards).forEach(([key, card]) => {
      if (!(card instanceof HTMLElement)) return;
      const isActive = key === speaker;
      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-speaking", isActive);
    });
    pauseSequenceVideos();
  };

  const waitForSpeakerCompletion = async (speaker) => {
    const video = speakerVideos[speaker];
    const fallbackMs = speakerPlaybackFallbackMs[speaker] || 3600;
    const playback = await playSequenceVideo(speaker);

    if (!playback.audible) {
      const usedSpeechFallback = await playSpeechFallback(speaker);
      if (usedSpeechFallback) return;
    }

    if (!(video instanceof HTMLVideoElement) || !playback.started) {
      await new Promise((resolve) => {
        playbackTimer = window.setTimeout(resolve, fallbackMs);
      });
      return;
    }

    await new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        video.removeEventListener("ended", finish);
        video.removeEventListener("error", finish);
        window.clearTimeout(playbackTimer);
        resolve();
      };

      video.addEventListener("ended", finish, { once: true });
      video.addEventListener("error", finish, { once: true });

      const durationMs =
        Number.isFinite(video.duration) && video.duration > 0 ? Math.round(video.duration * 1000) + 120 : fallbackMs;

      playbackTimer = window.setTimeout(finish, Math.max(durationMs, fallbackMs));
    });
  };

  const revealSpeakerCard = (speaker, onComplete) => {
    const card = speakerCards[speaker];
    if (!(card instanceof HTMLElement) || revealedSpeakers.has(speaker)) {
      onComplete?.();
      return;
    }

    revealedSpeakers.add(speaker);
    card.classList.add("is-mounted");
    window.requestAnimationFrame(() => {
      card.classList.add("is-visible");
      gsap.fromTo(
        card,
        { y: reducedMotion ? 0 : 24, opacity: 0.01 },
        {
          y: 0,
          opacity: 1,
          duration: revealDuration,
          ease: "power2.out",
          overwrite: true,
          onComplete,
        }
      );
    });
  };

  const finishSequence = () => {
    if (sequenceCompleted) return;
    sequenceCompleted = true;
    clearTimers();
    gsap.killTweensOf(availableCards);
    pauseSequenceVideos();
    Object.values(speakerCards).forEach((card) => {
      if (card instanceof HTMLElement) card.classList.remove("is-speaking", "is-active");
    });

    gsap.to(homeHostsExperiment, {
      autoAlpha: 0,
      y: reducedMotion ? 0 : -12,
      duration: exitDuration,
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => {
        homeHostsExperiment.hidden = true;
        homeHostsExperiment.setAttribute("aria-hidden", "true");
        document.body.classList.remove("home-hosts-active");
        document.body.dataset.homeHostsExperimentComplete = "true";
        window.dispatchEvent(new CustomEvent(HOME_HOSTS_COMPLETE_EVENT));
      },
    });
  };

  const runSpeakerSequence = async () => {
    revealSpeakerCard("fabian", async () => {
      if (sequenceCompleted) return;
      setSpeakerState("fabian");
      await waitForSpeakerCompletion("fabian");
      if (sequenceCompleted) return;

      nextStepTimer = window.setTimeout(() => {
        revealSpeakerCard("favio", async () => {
          if (sequenceCompleted) return;
          setSpeakerState("favio");
          await waitForSpeakerCompletion("favio");
          if (sequenceCompleted) return;
          finishSequence();
        });
      }, betweenLineMs);
    });
  };

  const runStep = () => {
    if (sequenceCompleted) {
      finishSequence();
      return;
    }
    void runSpeakerSequence();
  };

  gsap.killTweensOf(homeHostsExperiment);
  gsap.killTweensOf(availableCards);
  Object.values(speakerVideos).forEach((video) => {
    prepareSequenceVideo(video);
  });
  availableCards.forEach((card) => {
    card.classList.remove("is-mounted", "is-visible", "is-speaking", "is-active");
  });
  gsap.set(homeHostsExperiment, { autoAlpha: 0, y: reducedMotion ? 0 : 16 });
  gsap.set(availableCards, { clearProps: "opacity,transform" });
  gsap.to(homeHostsExperiment, {
    autoAlpha: 1,
    y: 0,
    duration: entranceDuration,
    ease: "power2.out",
    overwrite: true,
    onComplete: () => runStep(),
  });
}

function setupFloatingWhatsapp() {
  if (!floatingWhatsapp) return;
  let initialized = false;

  const activateFloatingExperience = () => {
    if (initialized) return;
    initialized = true;

    floatingWhatsapp.hidden = false;
    if (floatingFabianHost) floatingFabianHost.hidden = false;
    floatingWhatsapp.classList.remove("is-hidden");
    floatingFabianHost?.classList.remove("is-hidden");

    if (floatingFabianHost) {
      gsap.set(floatingFabianHost, { x: 0, y: 0, opacity: 1 });
      floatingFabianHost.classList.remove("has-sprite", "is-walking");
      if (floatingFabianSprite instanceof HTMLElement) floatingFabianSprite.style.backgroundImage = "";
    }

    const floatingFabianFrames = ["/images/fabian.png", "/images/favio.png"];
    const floatingFabianFigure = floatingFabianHost?.querySelector(".floating-fabian-host__figure");
    let floatingFabianFrameIndex = 0;
    let floatingFabianSwapTimer = 0;

    floatingFabianFrames.forEach((src) => {
      const preloadImage = new Image();
      preloadImage.src = src;
    });

    const applyFloatingFabianFrame = (index) => {
      if (!(floatingFabianFigure instanceof HTMLImageElement)) return;
      const safeIndex = ((index % floatingFabianFrames.length) + floatingFabianFrames.length) % floatingFabianFrames.length;
      floatingFabianFrameIndex = safeIndex;
      floatingFabianFigure.removeAttribute("loading");
      floatingFabianFigure.decoding = "async";
      floatingFabianFigure.src = floatingFabianFrames[safeIndex];
      floatingFabianFigure.setAttribute("src", floatingFabianFrames[safeIndex]);
    };

    const scheduleFloatingFabianSwap = () => {
      if (floatingFabianSwapTimer) window.clearInterval(floatingFabianSwapTimer);
      floatingFabianSwapTimer = window.setInterval(() => {
        applyFloatingFabianFrame(floatingFabianFrameIndex + 1);
      }, 10000);
    };

    applyFloatingFabianFrame(0);
    scheduleFloatingFabianSwap();

    let celebrateTimer = 0;
    let idleTimer = 0;

    const clearFabianState = () => {
      if (!floatingFabianHost) return;
      floatingFabianHost.classList.remove("is-celebrating", "is-talking", "is-walking");
      gsap.killTweensOf(floatingFabianHost);
      gsap.set(floatingFabianHost, { clearProps: "x,y,scale,rotate" });
    };

    const playHoverReaction = () => {
      if (!floatingFabianHost || floatingFabianHost.classList.contains("is-celebrating")) return;
      window.clearTimeout(celebrateTimer);
      gsap.killTweensOf(floatingFabianHost);
      floatingFabianHost.classList.remove("is-celebrating", "is-walking");
      floatingFabianHost.classList.add("is-talking");
      gsap.fromTo(
        floatingFabianHost,
        { x: 0, y: 0, rotate: 0, scale: 1 },
        {
          keyframes: [
            { y: -7, rotate: -4, duration: 0.16 },
            { x: -3, y: -10, rotate: 4, duration: 0.14 },
            { x: 0, y: -4, rotate: -2, duration: 0.14 },
            { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.16 },
          ],
          ease: "power2.out",
          overwrite: true,
          onComplete: () => {
            floatingFabianHost.classList.remove("is-talking");
          },
        }
      );
    };

    const playIdleReaction = () => {
      if (!floatingFabianHost || floatingFabianHost.classList.contains("is-celebrating")) return;
      gsap.killTweensOf(floatingFabianHost);
      floatingFabianHost.classList.add("is-talking");
      gsap.fromTo(
        floatingFabianHost,
        { x: 0, y: 0, rotate: 0, scale: 1 },
        {
          keyframes: [
            { y: -5, rotate: -2, duration: 0.2 },
            { x: -5, y: -8, rotate: 3, duration: 0.24 },
            { x: 0, y: -3, rotate: -1, duration: 0.18 },
            { x: 0, y: 0, rotate: 0, duration: 0.22 },
          ],
          ease: "sine.inOut",
          overwrite: true,
          onComplete: () => {
            floatingFabianHost.classList.remove("is-talking");
          },
        }
      );
    };

    const scheduleIdleReaction = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        playIdleReaction();
        scheduleIdleReaction();
      }, window.innerWidth >= 900 ? 13000 : 15000);
    };

    floatingFabianHost?.addEventListener("pointerenter", () => {
      floatingFabianHost.classList.add("is-hovered");
    });

    floatingFabianHost?.addEventListener("pointerleave", () => {
      floatingFabianHost.classList.remove("is-hovered");
    });

    floatingWhatsapp.addEventListener("pointerenter", playHoverReaction);
    floatingWhatsapp.addEventListener(
      "touchstart",
      () => {
        playHoverReaction();
      },
      { passive: true }
    );

    floatingWhatsapp.addEventListener("click", () => {
      if (!floatingFabianHost) return;
      window.clearTimeout(idleTimer);
      clearFabianState();
      window.clearTimeout(celebrateTimer);
      floatingFabianHost.classList.add("is-celebrating");
      gsap.fromTo(
        floatingFabianHost,
        { x: 0, y: 0, scale: 1, rotate: 0 },
        {
          keyframes: [
            { y: -10, scale: 1.02, rotate: -4, duration: 0.16 },
            { y: -24, scale: 1.04, rotate: 5, duration: 0.18 },
            { y: -12, x: 6, scale: 1.03, rotate: -3, duration: 0.18 },
            { y: -3, x: 0, scale: 1.01, rotate: 2, duration: 0.18 },
            { x: 0, y: 0, scale: 1, rotate: 0, duration: 0.28 },
          ],
          ease: "power2.out",
          overwrite: true,
        }
      );
      celebrateTimer = window.setTimeout(() => {
        floatingFabianHost.classList.remove("is-celebrating");
        scheduleIdleReaction();
      }, 1020);
    });

    scheduleIdleReaction();
  };

  const waitForIntroCompletion = () => {
    floatingWhatsapp.classList.add("is-hidden");
    floatingFabianHost?.classList.add("is-hidden");

    floatingWhatsapp.hidden = true;
    if (floatingFabianHost) floatingFabianHost.hidden = true;

    if (IS_EXPERIMENTAL_HOME_DIRECT) {
      window.addEventListener(HOME_HOSTS_COMPLETE_EVENT, () => {
        window.requestAnimationFrame(() => activateFloatingExperience());
      }, { once: true });
      return;
    }

    if (!hasActiveIntro() && !IS_EXPERIMENTAL_HOME_DIRECT) {
      activateFloatingExperience();
      return;
    }

    window.addEventListener(
      "intro:complete",
      () => {
        window.requestAnimationFrame(() => activateFloatingExperience());
      },
      { once: true }
    );
  };

  waitForIntroCompletion();
}

function setupIntroScreen() {
  if (!introScreen) {
    document.body.classList.remove("intro-active");
    window.dispatchEvent(new CustomEvent("intro:complete"));
    return;
  }

  if (IS_EXPERIMENTAL_HOME_DIRECT) {
    introScreen.classList.add("is-hidden");
    introScreen.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-active");
    window.setTimeout(() => {
      introScreen.remove();
      window.dispatchEvent(new CustomEvent("intro:complete"));
    }, 0);
    return;
  }

  Promise.resolve()
    .then(() => import("./intro-experience.js"))
    .then(({ initIntroExperience }) =>
      initIntroExperience({
        introScreen,
        introSkipBtn,
      })
    )
    .catch(() => {
      window.setTimeout(() => {
        introScreen.classList.add("is-hidden");
        introScreen.setAttribute("aria-hidden", "true");
        document.body.classList.remove("intro-active");
        document.body.classList.add("intro-complete");
        window.setTimeout(() => {
          introScreen.remove();
          window.dispatchEvent(new CustomEvent("intro:complete"));
        }, 700);
      }, 1200);
    });
}

function setupDeferredReviews() {
  if (!reviewsSection || reviewsLoaded) return;

  const hydrateReviews = () => {
    if (reviewsLoaded) return;
    reviewsLoaded = true;
    void loadReviews();
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        hydrateReviews();
      },
      { rootMargin: "0px 0px 320px 0px", threshold: 0.01 }
    );

    observer.observe(reviewsSection);
    scheduleIdleWork(hydrateReviews, 2400);
    return;
  }

  scheduleIdleWork(hydrateReviews, 1600);
}

function setupVisitCounter() {
  if (!visitCounter) return;

  const key = "tacos_fabian_visit_count";
  let next = 1;

  try {
    const raw = window.localStorage.getItem(key);
    const current = Number.parseInt(raw || "0", 10);
    next = Number.isFinite(current) && current > 0 ? current + 1 : 1;
    window.localStorage.setItem(key, String(next));
  } catch {
    const seed = Math.floor(Date.now() / 86400000);
    next = Math.max(1, (seed % 5000) + 1);
  }

  visitCounter.textContent = String(next).padStart(6, "0");
}

function setupMenuDestacadoButton() {
  if (!heroMenuDestacadoBtn || !menuCarousel) return;

  heroMenuDestacadoBtn.addEventListener("click", (event) => {
    event.preventDefault();
    menuCarousel.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function getStickyHeaderOffset(extraOffset = 18) {
  const headerHeight = siteHeader?.getBoundingClientRect().height || 0;
  return headerHeight + extraOffset;
}

function setActiveQuickCategory(targetId) {
  if (!quickCategoryLinks.length) return;

  let activeLink = null;

  quickCategoryLinks.forEach((link) => {
    const isActive = link.dataset.categoryLink === targetId;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "true" : "false");
    if (isActive) activeLink = link;
  });

  quickCategoryTargets.forEach((target) => {
    const isActive = target.id === targetId;
    target.classList.toggle("is-category-active", isActive);
    target.setAttribute("data-category-active", isActive ? "true" : "false");
  });

  activeLink?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}

function scrollToCategory(target) {
  if (!(target instanceof HTMLElement)) return;

  const offsetTop = window.scrollY + target.getBoundingClientRect().top - getStickyHeaderOffset();
  window.scrollTo({
    top: Math.max(offsetTop, 0),
    behavior: "smooth",
  });
}

function playQuickCategoryIntroAnimation() {
  const quickCategoryNav = document.querySelector(".quick-category-nav");
  if (!(quickCategoryNav instanceof HTMLElement)) return;
  if (quickCategoryNav.dataset.presented === "true") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  quickCategoryNav.dataset.presented = "true";

  window.requestAnimationFrame(() => {
    quickCategoryNav.classList.add("is-presenting");
    window.setTimeout(() => {
      quickCategoryNav.classList.remove("is-presenting");
    }, 980);
  });
}

function setupQuickCategoryNav() {
  if (!quickCategoryLinks.length || !quickCategoryTargets.length) return;

  quickCategoryLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.dataset.categoryLink;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      setActiveQuickCategory(targetId);
      scrollToCategory(target);
      window.history.replaceState(null, "", `#${targetId}`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)[0];

      if (!visibleEntry?.target?.id) return;
      setActiveQuickCategory(visibleEntry.target.id);
    },
    {
      threshold: [0.35, 0.6, 0.85],
      rootMargin: `-${getStickyHeaderOffset(30)}px 0px -42% 0px`,
    }
  );

  quickCategoryTargets.forEach((target) => observer.observe(target));

  const hashTarget = window.location.hash.replace("#", "");
  if (hashTarget) {
    const initialTarget = document.getElementById(hashTarget);
    if (initialTarget && initialTarget.hasAttribute("data-category-target")) {
      setActiveQuickCategory(hashTarget);
    }
  }

  const runPresentation = () => {
    window.requestAnimationFrame(() => {
      playQuickCategoryIntroAnimation();
    });
  };

  if (!hasActiveIntro()) {
    runPresentation();
    return;
  }

  window.addEventListener("intro:complete", runPresentation, { once: true });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStars(stars) {
  const total = Math.max(1, Math.min(5, Number(stars) || 0));
  const starSvg = (filled) => `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="star-icon ${filled ? "is-filled" : ""}">
      <path d="M12 2.5l2.9 5.88 6.5.95-4.7 4.58 1.1 6.48L12 17.3l-5.8 3.09 1.11-6.48-4.72-4.58 6.53-.95L12 2.5z"></path>
    </svg>
  `;

  return Array.from({ length: 5 }, (_, index) => starSvg(index < total)).join("");
}

function formatDate(dateValue) {
  if (!dateValue) return "Sin fecha";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

function truncateReview(text, maxLength = 96) {
  const cleanText = String(text || "").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trimEnd()}...`;
}

function paintReviews(items) {
  if (!Array.isArray(items) || items.length === 0) {
    reviewsStatus.textContent = "Aún no hay reseñas. Sé la primera persona en opinar.";
    if (reviewsAverage) reviewsAverage.textContent = "Promedio: --/5";
    if (reviewsAverageBadge) reviewsAverageBadge.textContent = "\u2605 -- promedio";
    if (reviewsSatisfied) reviewsSatisfied.textContent = "+0 clientes satisfechos";
    if (heroProofAvg) heroProofAvg.textContent = heroProofAvgLabel;
    if (heroProofCount) heroProofCount.textContent = heroProofCountLabel;
    reviewsList.innerHTML = "";
    return;
  }

  const avg = items.reduce((sum, item) => sum + (Number(item.stars) || 0), 0) / items.length;
  const satisfied = Math.max(items.length * 24, 120);
  reviewsStatus.textContent = `${items.length} reseña${items.length === 1 ? " publicada" : "s publicadas"}`;
  if (reviewsAverage) reviewsAverage.textContent = `Promedio: ${avg.toFixed(1)}/5`;
  if (reviewsAverageBadge) reviewsAverageBadge.textContent = `\u2605 ${avg.toFixed(1)} promedio`;
  if (reviewsSatisfied) reviewsSatisfied.textContent = `+${satisfied} clientes satisfechos`;
  if (heroProofAvg) heroProofAvg.textContent = heroProofAvgLabel;
  if (heroProofCount) heroProofCount.textContent = heroProofCountLabel;

  [reviewsAverageBadge, reviewsSatisfied, heroProofAvg, heroProofCount].forEach((node) => {
    if (!node) return;
    node.classList.remove("is-pop");
    window.requestAnimationFrame(() => node.classList.add("is-pop"));
  });

  reviewsList.innerHTML = items
    .map((item) => {
      const name = escapeHtml(item.name || "Anonimo");
      const avatar = escapeHtml(
        String(item.name || "A")
          .trim()
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() || "")
          .join("") || "A"
      );
      const comment = escapeHtml(item.comment || "");
      const stars = Number(item.stars) || 0;
      const dateText = formatDate(item.date);

      return `
        <li class="review-item" data-avatar="${avatar}">
          <div class="review-item-head">
            <strong>${name}</strong>
            <span class="muted">${dateText}</span>
          </div>
          <p class="stars" aria-label="${stars} de 5 estrellas">${renderStars(stars)}</p>
          <p>${comment}</p>
        </li>
      `;
    })
    .join("");
}

async function loadReviews() {
  reviewsStatus.textContent = "Cargando reseñas...";
  if (reviewsAverage) reviewsAverage.textContent = "Promedio: calculando...";
  if (reviewsAverageBadge) reviewsAverageBadge.textContent = "\u2605 Calculando promedio...";
  if (reviewsSatisfied) reviewsSatisfied.textContent = "Cargando clientes satisfechos...";
  reviewsList.innerHTML = `
    <li class="review-item review-skeleton"></li>
    <li class="review-item review-skeleton"></li>
    <li class="review-item review-skeleton"></li>
  `;

  try {
    const response = await fetch("/api/reviews", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const payload = await response.json();
    paintReviews(payload.items || []);
  } catch {
    reviewsStatus.textContent = "No fue posible cargar reseñas. Intenta más tarde.";
    showToast("No pudimos cargar reseñas por el momento.", "error");
  }
}

function setupCommentCounter() {
  if (!commentInput || !commentCounter) return;

  const update = () => {
    const len = commentInput.value.length;
    commentCounter.textContent = `${len} / 300`;
  };

  commentInput.addEventListener("input", update);
  update();
}

function setupReviewsForm() {
  if (!reviewForm || !formStatus) return;

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "Enviando reseña...";

    const formData = new FormData(reviewForm);
    const data = {
      name: String(formData.get("name") || "").trim(),
      stars: Number(formData.get("stars") || 0),
      comment: String(formData.get("comment") || "").trim(),
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo guardar la reseña.");
      }

      reviewForm.reset();
      formStatus.textContent = "Reseña enviada. Gracias por compartir tu opinión.";
      showToast("Reseña enviada con éxito.", "ok");
      await loadReviews();
    } catch (error) {
      formStatus.textContent = error.message;
      showToast(error.message || "No se pudo enviar la reseña.", "error");
    }
  });
}

function setupMenuCarousel() {
  if (!menuCarousel || !menuTrack || !menuPrev || !menuNext || !menuDots) return;

  const slides = Array.from(menuTrack.children);
  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoTimer = 0;
  let resumeTimer = 0;

  const stopAuto = () => {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = 0;
  };

  const scheduleAuto = (delay = 3800) => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      stopAuto();
      autoTimer = window.setInterval(() => {
        nextSlide();
      }, delay);
    }, 1400);
  };

  function renderDots() {
    menuDots.innerHTML = "";

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Ir al slide ${index + 1}`);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
      dot.addEventListener("click", () => {
        currentIndex = index;
        updateSlide();
        scheduleAuto();
      });
      menuDots.appendChild(dot);
    });
  }

  function updateSlide() {
    const offset = currentIndex * 100;
    menuTrack.style.transform = `translateX(-${offset}%)`;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentIndex);
    });

    const dots = Array.from(menuDots.children);
    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide();
  }

  menuPrev.addEventListener("click", () => {
    prevSlide();
    scheduleAuto();
  });
  menuNext.addEventListener("click", () => {
    nextSlide();
    scheduleAuto();
  });

  let pointerStartX = 0;
  let pointerEndX = 0;

  menuCarousel.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    pointerEndX = event.clientX;
  });

  menuCarousel.addEventListener("pointermove", (event) => {
    if (pointerStartX === 0) return;
    pointerEndX = event.clientX;
  });

  menuCarousel.addEventListener("pointerup", () => {
    const delta = pointerEndX - pointerStartX;
    if (Math.abs(delta) > 45) {
      if (delta < 0) nextSlide();
      if (delta > 0) prevSlide();
      scheduleAuto();
    }
    pointerStartX = 0;
    pointerEndX = 0;
  });

  menuCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
      scheduleAuto();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
      scheduleAuto();
    }
  });

  menuCarousel.addEventListener("pointerenter", stopAuto);
  menuCarousel.addEventListener("pointerleave", () => scheduleAuto());
  menuCarousel.addEventListener("focusin", stopAuto);
  menuCarousel.addEventListener("focusout", () => scheduleAuto());

  renderDots();
  updateSlide();
  scheduleAuto();
}

function setupMenuSpotlightModal() {
  if (
    !menuModal ||
    !menuModalBackdrop ||
    !menuModalClose ||
    !menuModalTitle ||
    !menuModalDescription ||
    !menuModalPrice ||
    menuCards.length === 0
  ) {
    return;
  }

  let lastFocused = null;

  const openModal = (title, description, price) => {
    lastFocused = document.activeElement;
    menuModalTitle.textContent = title;
    menuModalDescription.textContent = description;
    menuModalPrice.textContent = price;
    menuModal.classList.add("open");
    menuModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    menuModalClose.focus();
  };

  const closeModal = () => {
    menuModal.classList.remove("open");
    menuModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  menuCards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalle de ${card.querySelector("h3")?.textContent || "producto"}`);

    const trigger = () => {
      const title = card.querySelector("h3")?.textContent?.trim() || "Producto";
      const firstItem = card.querySelector("li");
      const description = firstItem
        ? `${firstItem.querySelector("span")?.textContent || "Especialidad"} hecho al momento.`
        : "Especialidad de la casa con sabor real.";
      const priceValue = firstItem?.querySelector("strong")?.textContent?.trim();
      const price = priceValue ? `Desde ${priceValue} MXN` : "Pregunta por precios";
      openModal(title, description, price);
    };

    card.addEventListener("click", trigger);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        trigger();
      }
    });
  });

  menuModalClose.addEventListener("click", closeModal);
  menuModalBackdrop.addEventListener("click", closeModal);

  window.addEventListener("keydown", (event) => {
    if (!menuModal.classList.contains("open")) return;

    if (event.key === "Escape") closeModal();

    if (event.key === "Tab") {
      const focusables = menuModal.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function setupMenuOrderingSystem() {
  if (
    !menuOrderFab ||
    !menuOrderFabToggle ||
    !menuOrderFabCheckout ||
    !menuOrderFabCount ||
    !menuOrderFabTotal ||
    !menuOrderBackdrop ||
    !menuOrderShell ||
    !menuOrderClose ||
    !menuOrderItems ||
    !menuOrderEmpty ||
    !menuOrderCount ||
    !menuOrderTotal ||
    !menuOrderCheckout ||
    !menuOrderClear ||
    !orderCheckoutModal ||
    !orderCheckoutBackdrop ||
    !orderCheckoutClose ||
    !orderCheckoutCancel ||
    !orderCheckoutForm ||
    !orderCheckoutCount ||
    !orderCheckoutTotal ||
    !orderCustomerAddress ||
    !orderUseLocationBtn ||
    !orderLocationStatus ||
    !orderManualLocationHint
  ) {
    return;
  }

  const cart = new Map();
  const productPickers = new Map();
  let checkoutLastFocused = null;
  let cartLastFocused = null;
  let sharedLocation = null;
  let isCartPanelOpen = false;
  const desktopOrderMedia = window.matchMedia("(min-width: 960px)");

  const getCartEntries = () => Array.from(cart.values());
  const getCartCount = () => getCartEntries().reduce((sum, item) => sum + item.quantity, 0);
  const getCartTotal = () => getCartEntries().reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const getCartQuantity = (id) => cart.get(id)?.quantity || 0;

  const isDesktopOrderLayout = () => desktopOrderMedia.matches;

  const setManualLocationHint = (message, tone = "neutral") => {
    orderManualLocationHint.textContent = message;
    orderManualLocationHint.dataset.tone = tone;
  };

  const syncOrderLayoutMode = () => {
    const isDesktop = isDesktopOrderLayout();

    document.body.classList.toggle("has-order-fab", !isDesktop);
    document.body.classList.toggle("cart-panel-open", !isDesktop && isCartPanelOpen);
    menuOrderFab.hidden = isDesktop;
    menuOrderFab.setAttribute("aria-hidden", String(isDesktop));
    menuOrderFab.classList.toggle("is-active", !isDesktop && isCartPanelOpen);
    menuOrderShell.classList.toggle("is-desktop", isDesktop);

    if (isDesktop) {
      menuOrderBackdrop.hidden = true;
      menuOrderBackdrop.classList.remove("is-visible");
      menuOrderShell.classList.add("is-open");
      menuOrderShell.setAttribute("aria-hidden", "false");
      menuOrderFabToggle.setAttribute("aria-expanded", "true");
      return;
    }

    menuOrderBackdrop.hidden = !isCartPanelOpen;
    menuOrderBackdrop.classList.toggle("is-visible", isCartPanelOpen);
    menuOrderShell.classList.toggle("is-open", isCartPanelOpen);
    menuOrderShell.setAttribute("aria-hidden", String(!isCartPanelOpen));
    menuOrderFabToggle.setAttribute("aria-expanded", String(isCartPanelOpen));
  };

  const setCartPanelState = (isOpen) => {
    isCartPanelOpen = isOpen;
    syncOrderLayoutMode();
    menuOrderFab.classList.toggle("is-active", isOpen && !isDesktopOrderLayout());
    document.body.classList.toggle("cart-panel-open", isOpen && !isDesktopOrderLayout());

    if (isDesktopOrderLayout()) return;

    if (isOpen) {
      cartLastFocused = document.activeElement;
      menuOrderClose.focus();
    } else if (cartLastFocused instanceof HTMLElement) {
      cartLastFocused.focus();
    }
  };

  const closeCartPanel = () => setCartPanelState(false);
  const toggleCartPanel = () => setCartPanelState(!isCartPanelOpen);

  const syncSummaryLabels = () => {
    const count = getCartCount();
    const total = getCartTotal();
    const countLabel = `${count} ${count === 1 ? "producto" : "productos"}`;

    menuOrderCount.textContent = countLabel;
    menuOrderTotal.textContent = `Total: ${formatMxCurrency(total)}`;
    menuOrderFabCount.textContent = countLabel;
    menuOrderFabTotal.textContent = formatMxCurrency(total);
    orderCheckoutCount.textContent = countLabel;
    orderCheckoutTotal.textContent = `Total: ${formatMxCurrency(total)}`;
    menuOrderEmpty.hidden = count > 0;
    menuOrderCheckout.disabled = count === 0;
    menuOrderClear.disabled = count === 0;
    menuOrderFabCheckout.disabled = count === 0;
    menuOrderFab.classList.toggle("has-items", count > 0);
    menuOrderFab.classList.toggle("is-visible", count > 0 || isCartPanelOpen);
    menuOrderShell.classList.toggle("is-empty", count === 0);
    menuOrderFabCheckout.textContent = count > 0 ? "Enviar pedido" : "Sin productos";
  };

  const adjustCartItem = (id, delta) => {
    const current = cart.get(id);
    if (!current) return;

    const nextQuantity = current.quantity + delta;
    if (nextQuantity <= 0) {
      cart.delete(id);
    } else {
      cart.set(id, { ...current, quantity: nextQuantity });
    }

    renderCart();
  };

  const syncProductPicker = (id) => {
    const controls = productPickers.get(id);
    if (!controls) return;

    const quantity = getCartQuantity(id);
    controls.value.textContent = String(quantity);
    controls.decrease.disabled = quantity === 0;
    controls.row.classList.toggle("has-selection", quantity > 0);
    controls.hint.textContent =
      quantity === 0
        ? "Toca + para agregar"
        : `${quantity} ${quantity === 1 ? "agregado" : "agregados"} en tu pedido`;
  };

  const syncProductPickers = () => {
    productPickers.forEach((_, id) => syncProductPicker(id));
  };

  const renderCart = () => {
    const items = getCartEntries();
    menuOrderItems.innerHTML = "";

    items.forEach((item) => {
      const row = document.createElement("li");
      row.className = "menu-order-item";
      row.innerHTML = `
        <div class="menu-order-item__top">
          <div>
            <p class="menu-order-item__name">${escapeHtml(item.displayName)}</p>
            <span class="menu-order-item__meta">${escapeHtml(item.category)} &middot; ${formatMxCurrency(item.unitPrice)} c/u</span>
          </div>
          <span class="menu-order-item__subtotal">${formatMxCurrency(item.quantity * item.unitPrice)}</span>
        </div>
        <div class="menu-order-item__controls">
          <div class="menu-order-control" aria-label="Cantidad de ${escapeHtml(item.displayName)}">
            <button class="menu-order-control__btn" type="button" data-order-summary-action="decrease" data-order-id="${item.id}" aria-label="Quitar uno">-</button>
            <span class="menu-order-control__value" aria-live="polite">${item.quantity}</span>
            <button class="menu-order-control__btn" type="button" data-order-summary-action="increase" data-order-id="${item.id}" aria-label="Agregar uno">+</button>
          </div>
          <button class="menu-order-line__remove" type="button" data-order-summary-action="remove" data-order-id="${item.id}">Eliminar</button>
        </div>
      `;
      menuOrderItems.appendChild(row);
    });

    syncSummaryLabels();
    syncProductPickers();
  };

  const openCheckoutModal = () => {
    if (getCartCount() === 0) {
      showToast("Agrega al menos un producto antes de enviar tu pedido.", "info");
      return;
    }

    checkoutLastFocused = document.activeElement;
    closeCartPanel();
    orderCheckoutModal.classList.add("open");
    orderCheckoutModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    syncSummaryLabels();
    orderLocationStatus.textContent = sharedLocation ? "Ubicacion actual lista para enviarse con tu pedido." : "Puedes compartir tu ubicacion o escribir tu direccion manualmente.";
    setManualLocationHint(
      sharedLocation
        ? "Tu ubicacion ya esta lista. Si lo prefieres, tambien puedes editar la direccion manualmente."
        : "Escribe la direccion manualmente en el campo de arriba si prefieres terminar mas rapido.",
      sharedLocation ? "success" : "neutral"
    );
    orderCustomerName?.focus();
  };

  const closeCheckoutModal = () => {
    orderCheckoutModal.classList.remove("open");
    orderCheckoutModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (checkoutLastFocused instanceof HTMLElement) checkoutLastFocused.focus();
  };

  const buildGoogleMapsLink = ({ latitude, longitude }) =>
    `https://www.google.com/maps?q=${latitude},${longitude}`;

  const buildWhatsAppMessage = ({ customerName, customerAddress, customerReference, locationLink }) => {
    const lines = [
      "Hola, quiero hacer este pedido:",
      "",
      ...getCartEntries().map(
        (item) => `- ${item.quantity} x ${item.displayName} (${formatMxCurrency(item.unitPrice)} c/u) = ${formatMxCurrency(item.quantity * item.unitPrice)}`
      ),
      "",
      `Total: ${formatMxCurrency(getCartTotal())}`,
      "",
      `Nombre: ${customerName}`,
      `Direccion de entrega: ${customerAddress}`,
    ];

    if (locationLink) {
      lines.push(`Ubicacion en Google Maps: ${locationLink}`);
    }

    if (customerReference) {
      lines.push(`Referencia: ${customerReference}`);
    }

    return lines.join("\n");
  };

  const syncLocationButtonState = (isLoading = false) => {
    orderUseLocationBtn.disabled = isLoading;
    orderUseLocationBtn.textContent = isLoading ? "Obteniendo ubicacion..." : "Usar mi ubicacion actual";
  };

  const enhanceMenuRows = () => {
    menuCards.forEach((card, cardIndex) => {
      const category = card.querySelector("h3")?.textContent?.trim() || `Producto ${cardIndex + 1}`;
      const rows = Array.from(card.querySelectorAll(".price-list li"));

      rows.forEach((row, rowIndex) => {
        const labelNode = row.querySelector("span");
        const priceNode = row.querySelector("strong");
        if (!(labelNode instanceof HTMLElement) || !(priceNode instanceof HTMLElement)) return;

        const variant = labelNode.textContent?.trim() || `Opcion ${rowIndex + 1}`;
        const unitPrice = parsePriceAmount(priceNode.textContent);
        if (!unitPrice) return;

        const orderId = `${card.id || `menu-${cardIndex + 1}`}-${rowIndex + 1}`;
        const displayName = `${category} - ${variant}`;

        row.classList.add("menu-order-enhanced");
        row.dataset.orderId = orderId;

        const orderLine = document.createElement("div");
        orderLine.className = "menu-order-line";
        orderLine.innerHTML = `
          <div class="menu-order-control" aria-label="Seleccionar cantidad para ${escapeHtml(displayName)}">
            <button class="menu-order-control__btn" type="button" data-order-picker="decrease" aria-label="Disminuir cantidad">-</button>
            <span class="menu-order-control__value" data-order-picker-value>0</span>
            <button class="menu-order-control__btn" type="button" data-order-picker="increase" aria-label="Aumentar cantidad">+</button>
          </div>
          <p class="menu-order-line__hint" data-order-picker-hint aria-live="polite">Toca + para agregar</p>
        `;

        const pickerValue = orderLine.querySelector("[data-order-picker-value]");
        const pickerHint = orderLine.querySelector("[data-order-picker-hint]");
        const decreaseButton = orderLine.querySelector('[data-order-picker="decrease"]');
        const increaseButton = orderLine.querySelector('[data-order-picker="increase"]');
        if (
          !(pickerValue instanceof HTMLElement) ||
          !(pickerHint instanceof HTMLElement) ||
          !(decreaseButton instanceof HTMLButtonElement) ||
          !(increaseButton instanceof HTMLButtonElement)
        ) {
          return;
        }

        productPickers.set(orderId, {
          row: orderLine,
          value: pickerValue,
          hint: pickerHint,
          decrease: decreaseButton,
          increase: increaseButton,
        });

        orderLine.addEventListener("click", (event) => {
          event.stopPropagation();
        });

        orderLine.addEventListener("keydown", (event) => {
          event.stopPropagation();
        });

        orderLine.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const action = button.getAttribute("data-order-picker");
            if (action === "decrease") {
              adjustCartItem(orderId, -1);
              return;
            }

            if (action === "increase") {
              const existing = cart.get(orderId);
              const nextQuantity = (existing?.quantity || 0) + 1;
              cart.set(orderId, {
                id: orderId,
                category,
                variant,
                displayName,
                unitPrice,
                quantity: nextQuantity,
              });
              renderCart();
              return;
            }
          });
        });

        row.appendChild(orderLine);
        syncProductPicker(orderId);
      });
    });
  };

  menuOrderItems.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const id = target.dataset.orderId;
    if (!id) return;

    const action = target.dataset.orderSummaryAction;
    if (action === "increase") adjustCartItem(id, 1);
    if (action === "decrease") adjustCartItem(id, -1);
    if (action === "remove") {
      cart.delete(id);
      renderCart();
    }
  });

  menuOrderFabToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleCartPanel();
  });
  menuOrderFabCheckout.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openCheckoutModal();
  });
  menuOrderClose.addEventListener("click", closeCartPanel);
  menuOrderBackdrop.addEventListener("click", closeCartPanel);

  menuOrderClear.addEventListener("click", () => {
    if (getCartCount() === 0) return;
    cart.clear();
    renderCart();
    showToast("Tu pedido se vacio.", "info");
  });

  menuOrderCheckout.addEventListener("click", openCheckoutModal);
  orderCheckoutClose.addEventListener("click", closeCheckoutModal);
  orderCheckoutCancel.addEventListener("click", closeCheckoutModal);
  orderCheckoutBackdrop.addEventListener("click", closeCheckoutModal);

  orderUseLocationBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      orderLocationStatus.textContent = "Tu navegador no pudo compartir la ubicacion desde aqui.";
      setManualLocationHint("Escribe tu direccion manualmente en el campo de arriba para continuar sin problema.", "warning");
      orderCustomerAddress.focus();
      showToast("Tu navegador no permite obtener ubicacion.", "error");
      return;
    }

    syncLocationButtonState(true);
    orderLocationStatus.textContent = "Solicitando acceso a tu ubicacion...";
    setManualLocationHint("Si prefieres no compartirla, escribe tu direccion manualmente y continua con el pedido.", "neutral");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = Number(coords.latitude?.toFixed(6));
        const longitude = Number(coords.longitude?.toFixed(6));
        const mapsLink = buildGoogleMapsLink({ latitude, longitude });
        sharedLocation = { latitude, longitude, mapsLink };

        const locationText = `Ubicacion actual compartida: ${mapsLink}`;
        if (orderCustomerAddress instanceof HTMLTextAreaElement) {
          orderCustomerAddress.value = locationText;
        }

        orderLocationStatus.textContent = "Ubicacion agregada. El repartidor podra abrirla en Google Maps.";
        setManualLocationHint("Si quieres afinar detalles como colonia, piso o referencia, puedes editar el campo de direccion.", "success");
        syncLocationButtonState(false);
        showToast("Ubicacion agregada al pedido.", "ok");
      },
      () => {
        syncLocationButtonState(false);
        orderLocationStatus.textContent = "No pudimos obtener la ubicacion automatica, pero puedes seguir sin problema escribiendo tu direccion manualmente.";
        setManualLocationHint("Captura tu direccion en el campo de arriba. Con eso basta para continuar tu compra.", "warning");
        orderCustomerAddress.focus();
        showToast("No pudimos obtener tu ubicacion.", "error");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isCartPanelOpen) {
      closeCartPanel();
      return;
    }

    if (event.key === "Escape" && orderCheckoutModal.classList.contains("open")) {
      closeCheckoutModal();
    }
  });

  orderCheckoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const customerName = String(orderCustomerName?.value || "").trim();
    const customerAddress = String(orderCustomerAddress?.value || "").trim();
    const customerReference = String(orderCustomerReference?.value || "").trim();
    const locationLink = sharedLocation?.mapsLink || "";

    if (!customerName || !customerAddress) {
      showToast("Completa nombre y direccion para enviar tu pedido.", "error");
      return;
    }

    const message = buildWhatsAppMessage({ customerName, customerAddress, customerReference, locationLink });
    const whatsappUrl = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    closeCheckoutModal();
    showToast("Abrimos WhatsApp con tu pedido listo.", "ok");
  });

  enhanceMenuRows();
  renderCart();
  syncOrderLayoutMode();
  if (typeof desktopOrderMedia.addEventListener === "function") {
    desktopOrderMedia.addEventListener("change", syncOrderLayoutMode);
  } else if (typeof desktopOrderMedia.addListener === "function") {
    desktopOrderMedia.addListener(syncOrderLayoutMode);
  }
}

function setupRevealAnimations() {
  const groups = [
    ".hero-premium .hero-content, .hero-premium .hero-side, .hero-premium .hero-proof, .trust-card",
    "#especialidad .card, .featured-product, .story-copy, .story-highlight",
    "#menu .carousel-slide",
    "#menu .menu-item",
    "#ubicacion .location-copy, #ubicacion .map-wrap",
    "#resenas .review-item, #resenas .review-form-wrap, #resenas .cta-final, #resenas .review-trust",
    "#referencias .card, .final-cta-banner",
  ];

  const items = document.querySelectorAll(groups.join(", "));
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  items.forEach((item, index) => {
    const delay = (index % 6) * 55;
    item.style.setProperty("--reveal-delay", `${delay}ms`);
    item.classList.add("reveal-item");
    observer.observe(item);
  });
}

function optimizeMainPageMedia() {
  const heroPriorityImage = document.querySelector(".menu-carousel--hero .carousel-slide:first-child img");
  if (heroPriorityImage instanceof HTMLImageElement) {
    heroPriorityImage.loading = "eager";
    heroPriorityImage.decoding = "async";
    heroPriorityImage.fetchPriority = "high";
  }

  const deferredImages = document.querySelectorAll(
    "#menu img, #especialidad img, #ubicacion img, #referencias img"
  );
  deferredImages.forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;
    image.loading = "lazy";
    image.decoding = "async";
    if (!image.hasAttribute("fetchpriority")) image.fetchPriority = "low";
  });
}

optimizeMainPageMedia();
setupDeferredIntroPromo();
setupCommentCounter();
setupReviewsForm();
setupMenuCarousel();
setupMenuSpotlightModal();
setupMenuOrderingSystem();
setupRevealAnimations();
setupHeaderEffects();
setupIntroScreen();
scheduleIdleWork(() => {
  setupPwaSupport();
}, 220);
setupFloatingWhatsapp();
setupHomeHostsExperiment();
scheduleIdleWork(() => {
  setupFabianVideos();
  setupSiteAmbientAudio();
  setupWhatsappAudio();
  setupVisitCounter();
}, 650);
setupMenuDestacadoButton();
setupQuickCategoryNav();

setupDeferredReviews();




