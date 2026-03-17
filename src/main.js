import { gsap } from "gsap";
import { initIntroExperience } from "./intro-experience.js";

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
const heroProofAvgLabel = "★ 5.0 calificación promedio";
const heroProofCountLabel = "+216 clientes satisfechos";
const heroReviewsCard = document.querySelector("#heroReviewsCard");
const heroReviewsAvg = document.querySelector("#heroReviewsAvg");
const heroReviewsCount = document.querySelector("#heroReviewsCount");
const heroReviewsPreview = document.querySelector("#heroReviewsPreview");
const reviewsList = document.querySelector("#reviewsList");
const reviewForm = document.querySelector("#reviewForm");
const formStatus = document.querySelector("#formStatus");
const commentInput = document.querySelector("#comment");
const commentCounter = document.querySelector("#commentCounter");
const toastRegion = document.querySelector("#toastRegion");
const floatingFabianHost = document.querySelector("#fabianMain");
const floatingFabianSprite = floatingFabianHost?.querySelector(".floating-fabian-host__sprite");
const floatingFabianFigure = floatingFabianHost?.querySelector(".floating-fabian-host__figure");
const floatingWhatsapp = document.querySelector("#floatingWhatsapp");
const footer = document.querySelector(".site-footer");
const visitCounter = document.querySelector("#visitCounter");
const heroMenuDestacadoBtn = document.querySelector("#heroMenuDestacadoBtn");
const heroGallery = document.querySelector("#heroGallery");
const heroGalleryPrev = document.querySelector("#heroGalleryPrev");
const heroGalleryNext = document.querySelector("#heroGalleryNext");
const heroGalleryDots = document.querySelector("#heroGalleryDots");
const introScreen = document.querySelector("#intro-screen");
const introSkipBtn = document.querySelector("#introSkipBtn");
const whatsappLinks = Array.from(document.querySelectorAll('a[href*="wa.me/"]')).filter((link) => !link.closest("#intro-screen"));
const installAppButtons = Array.from(document.querySelectorAll("#installAppBtn, #introInstallAppBtn"));
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
let heroReviewsRotationTimer = 0;
let heroReviewsCache = [];
let heroReviewsStartIndex = 0;
let siteAmbientAudio = null;
let siteAmbientStarting = false;
let siteAmbientObserver = null;
let ambientAudioSourceIndex = 0;
let whatsappAudioContext = null;
let deferredInstallPrompt = null;
let heroGalleryTimer = 0;
let swRefreshPending = false;

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
  const isMobileViewport = window.matchMedia("(max-width: 899px)");
  const hasIosInstallPath = isIos && !isStandaloneMode();

  const syncInstallButton = (visible) => {
    installAppButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      button.hidden = !visible;
      button.setAttribute("aria-hidden", visible ? "false" : "true");
      button.disabled = !visible;
      button.classList.toggle("is-ready", visible);
    });
  };

  syncInstallButton(false);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    if (isStandaloneMode()) return;
    deferredInstallPrompt = event;
    syncInstallButton(true);
    window.dispatchEvent(new CustomEvent("app-installable"));
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    syncInstallButton(false);
  });

  if (hasIosInstallPath) {
    syncInstallButton(true);
  }

  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", (event) => {
    if (!event.matches) return;
    deferredInstallPrompt = null;
    syncInstallButton(false);
  });

  const handleInstallClick = async (event) => {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;

    if (isIos && !deferredInstallPrompt && !isStandaloneMode()) {
      showToast("En iPhone o iPad: toca Compartir y luego Agregar a pantalla de inicio.", "info");
      syncInstallButton(true);
      return;
    }

    if (!deferredInstallPrompt || isStandaloneMode()) {
      if (isMobileViewport.matches && !isStandaloneMode()) {
        showToast("Si tu navegador lo permite, usa el menu y toca Instalar app o Agregar a pantalla de inicio.", "info");
      }
      syncInstallButton(false);
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
      syncInstallButton(Boolean(deferredInstallPrompt));
    }
  };

  installAppButtons.forEach((button) => {
    button.addEventListener("click", handleInstallClick);
  });

  if (!deferredInstallPrompt && hasIosInstallPath) {
    syncInstallButton(true);
  } else if (!deferredInstallPrompt && !hasIosInstallPath) {
    syncInstallButton(false);
  }

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

  window.addEventListener("load", async () => {
    scheduleIdleWork(async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        watchServiceWorkerRegistration(registration);
        void registration.update();
      } catch (error) {
        console.error("No se pudo registrar el service worker", error);
      }
    }, 1600);
  });
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

  let hydrated = false;

  const hydratePromo = () => {
    if (hydrated) return;
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
    scheduleIdleWork(hydratePromo, 1200);
  }

  scheduleIdleWork(hydratePromo, 1800);
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

function setupFloatingWhatsapp() {
  if (!floatingWhatsapp) return;
  floatingWhatsapp.classList.remove("is-hidden");
  floatingFabianHost?.classList.remove("is-hidden");

  if (floatingFabianHost) {
    gsap.set(floatingFabianHost, { x: 0, y: 0, opacity: 1 });
    floatingFabianHost.classList.remove("has-sprite", "is-walking");
    if (floatingFabianSprite instanceof HTMLElement) floatingFabianSprite.style.backgroundImage = "";
  }

  const floatingFabianFrames = ["/images/fabian.png", "/images/favio.png"];
  let floatingFabianFrameIndex = 0;
  let floatingFabianSwapTimer = 0;

  const applyFloatingFabianFrame = (index) => {
    if (!(floatingFabianFigure instanceof HTMLImageElement)) return;
    const safeIndex = ((index % floatingFabianFrames.length) + floatingFabianFrames.length) % floatingFabianFrames.length;
    floatingFabianFrameIndex = safeIndex;
    floatingFabianFigure.src = floatingFabianFrames[safeIndex];
    floatingFabianFigure.setAttribute("src", floatingFabianFrames[safeIndex]);
  };

  const scheduleFloatingFabianSwap = () => {
    window.clearTimeout(floatingFabianSwapTimer);
    floatingFabianSwapTimer = window.setTimeout(() => {
      applyFloatingFabianFrame(floatingFabianFrameIndex + 1);
      scheduleFloatingFabianSwap();
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
}

function setupIntroScreen() {
  if (!introScreen) {
    document.body.classList.remove("intro-active");
    return;
  }

  Promise.resolve()
    .then(() =>
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
        window.setTimeout(() => introScreen.remove(), 700);
      }, 1200);
    });
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

function getHeroReviewVisibleCount() {
  return 2;
}

function stopHeroReviewsRotation() {
  if (!heroReviewsRotationTimer) return;
  window.clearInterval(heroReviewsRotationTimer);
  heroReviewsRotationTimer = 0;
}

function renderHeroReviewSlice(items) {
  if (!heroReviewsPreview) return;

  const visibleCount = getHeroReviewVisibleCount();
  const safeItems = Array.isArray(items) ? items : [];

  if (!safeItems.length) {
    heroReviewsPreview.innerHTML = `
      <article class="hero-reviews-card__item hero-reviews-card__item--empty">
        <p>Sé la primera persona en dejar una reseña.</p>
      </article>
    `;
    return;
  }

  const currentItems = Array.from({ length: Math.min(visibleCount, safeItems.length) }, (_, offset) => {
    const index = (heroReviewsStartIndex + offset) % safeItems.length;
    return safeItems[index];
  });

  heroReviewsPreview.innerHTML = currentItems
    .map((item) => {
      const name = escapeHtml(item.name || "Anonimo");
      const stars = Math.max(1, Math.min(5, Number(item.stars) || 0));
      const comment = escapeHtml(truncateReview(item.comment || "", 88));
      return `
        <article class="hero-reviews-card__item">
          <div class="hero-reviews-card__item-head">
            <strong>${name}</strong>
            <span aria-label="${stars} de 5 estrellas">${"&#9733;".repeat(stars)}${"&#9734;".repeat(5 - stars)}</span>
          </div>
          <p>${comment}</p>
        </article>
      `;
    })
    .join("");
}

function syncHeroReviewsRotation() {
  if (!heroReviewsPreview) return;

  stopHeroReviewsRotation();
  renderHeroReviewSlice(heroReviewsCache);

  const visibleCount = getHeroReviewVisibleCount();
  if (heroReviewsCache.length <= visibleCount) return;

  heroReviewsRotationTimer = window.setInterval(() => {
    heroReviewsPreview.classList.add("is-switching");

    window.setTimeout(() => {
      heroReviewsStartIndex = (heroReviewsStartIndex + visibleCount) % heroReviewsCache.length;
      renderHeroReviewSlice(heroReviewsCache);
      heroReviewsPreview.classList.remove("is-switching");
    }, 220);
  }, 5000);
}

function paintHeroReviews(items) {
  if (!heroReviewsCard || !heroReviewsAvg || !heroReviewsCount || !heroReviewsPreview) return;

  if (!Array.isArray(items) || items.length === 0) {
    stopHeroReviewsRotation();
    heroReviewsCache = [];
    heroReviewsStartIndex = 0;
    heroReviewsAvg.innerHTML = "&#9733; --";
    heroReviewsCount.textContent = "Sin reseñas aún";
    renderHeroReviewSlice([]);
    return;
  }

  const avg = items.reduce((sum, item) => sum + (Number(item.stars) || 0), 0) / items.length;
  heroReviewsCache = [...items]
    .sort((a, b) => (Number(b.stars) || 0) - (Number(a.stars) || 0))
    .slice(0, 6);
  heroReviewsStartIndex = 0;

  heroReviewsAvg.innerHTML = `&#9733; ${avg.toFixed(1)}`;
  heroReviewsCount.textContent = `${items.length} reseña${items.length === 1 ? "" : "s"}`;
  syncHeroReviewsRotation();
}

function paintReviews(items) {
  if (!Array.isArray(items) || items.length === 0) {
    reviewsStatus.textContent = "Aún no hay reseñas. Sé la primera persona en opinar.";
    if (reviewsAverage) reviewsAverage.textContent = "Promedio: --/5";
    if (reviewsAverageBadge) reviewsAverageBadge.textContent = "\u2605 -- promedio";
    if (reviewsSatisfied) reviewsSatisfied.textContent = "+0 clientes satisfechos";
    if (heroProofAvg) heroProofAvg.textContent = heroProofAvgLabel;
    if (heroProofCount) heroProofCount.textContent = heroProofCountLabel;
    paintHeroReviews([]);
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
  paintHeroReviews(items);

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
  stopHeroReviewsRotation();
  if (heroReviewsAvg) heroReviewsAvg.innerHTML = "&#9733; --";
  if (heroReviewsCount) heroReviewsCount.textContent = "Cargando...";
  if (heroReviewsPreview) {
    heroReviewsPreview.innerHTML = `
      <article class="hero-reviews-card__item is-loading"></article>
      <article class="hero-reviews-card__item is-loading"></article>
    `;
  }
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
    paintHeroReviews([]);
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

function setupRevealAnimations() {
  const groups = [
    ".hero-content, .hero-side, .hero-proof",
    "#especialidad .card",
    "#menu .carousel-slide",
    "#menu .menu-item",
    "#ubicacion .location-copy, #ubicacion .map-wrap",
    "#resenas .review-item, #resenas .review-form-wrap, #resenas .cta-final, #resenas .review-trust",
    "#referencias .card",
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

function setupHeroGalleryCarousel() {
  if (!heroGallery || !heroGalleryDots) return;

  const slides = Array.from(heroGallery.querySelectorAll(".hero-gallery-item"));
  if (slides.length <= 1) return;

  let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (currentIndex < 0) currentIndex = 0;

  const stopAuto = () => {
    if (!heroGalleryTimer) return;
    window.clearInterval(heroGalleryTimer);
    heroGalleryTimer = 0;
  };

  const render = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentIndex);
    });

    const dots = Array.from(heroGalleryDots.children);
    dots.forEach((dot, index) => {
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  };

  const startAuto = () => {
    stopAuto();
    heroGalleryTimer = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      render();
    }, 3000);
  };

  heroGalleryDots.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-gallery__dot";
    dot.setAttribute("aria-label", `Ver imagen ${index + 1}`);
    dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    dot.addEventListener("click", () => {
      currentIndex = index;
      render();
      startAuto();
    });
    heroGalleryDots.appendChild(dot);
  });

  heroGalleryPrev?.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    render();
    startAuto();
  });

  heroGalleryNext?.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    render();
    startAuto();
  });

  heroGallery.addEventListener("pointerenter", stopAuto);
  heroGallery.addEventListener("pointerleave", startAuto);

  render();
  startAuto();
}

if (heroReviewsCard) {
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    if (!heroReviewsCache.length) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      syncHeroReviewsRotation();
    }, 120);
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
    "#menu img, #especialidad img, #ubicacion img, #referencias img, .hero-gallery-item img:not(:first-child)"
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
setupRevealAnimations();
setupHeaderEffects();
setupIntroScreen();
setupPwaSupport();
setupFabianVideos();
setupSiteAmbientAudio();
setupFloatingWhatsapp();
setupWhatsappAudio();
setupVisitCounter();
setupMenuDestacadoButton();
setupHeroGalleryCarousel();
loadReviews();

