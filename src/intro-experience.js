import * as THREE from "three";
import { gsap } from "gsap";

const SCRIPT_SEGMENTS = [
  "Hola, bienvenido a Tacos Fabian en Texcoco.",
  "Aqui preparamos tacos que se antojan desde la primera mordida.",
  "Prueba nuestros tacos de suadero, trocitos y tostadas, siempre preparados con sabor autentico.",
  "Revisa el menu o haz tu pedido por WhatsApp."
];

function createSmokeTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.82)");
  gradient.addColorStop(0.32, "rgba(255,209,169,0.42)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createFireTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(size / 2, size * 0.72, 8, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,220,0.95)");
  gradient.addColorStop(0.18, "rgba(255,198,105,0.92)");
  gradient.addColorStop(0.42, "rgba(255,116,24,0.72)");
  gradient.addColorStop(0.72, "rgba(135,36,0,0.18)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.58, size * 0.22, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createTaqueriaGroup() {
  const group = new THREE.Group();

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(8.2, 4.8),
    new THREE.MeshStandardMaterial({
      color: "#2d1d16",
      roughness: 0.92,
      metalness: 0.02,
      emissive: "#2b1710",
      emissiveIntensity: 0.12,
    })
  );
  backWall.position.set(0, 2.05, -0.65);
  group.add(backWall);

  const floorEdge = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.12, 1.4),
    new THREE.MeshStandardMaterial({ color: "#4f3021", roughness: 0.84, metalness: 0.03 })
  );
  floorEdge.position.set(0, 0.03, 1.05);
  group.add(floorEdge);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 1.7, 2.3),
    new THREE.MeshStandardMaterial({ color: "#2b1b17", roughness: 0.76, metalness: 0.08 })
  );
  base.position.y = 1.05;
  group.add(base);

  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 2.45, 1.05, 4),
    new THREE.MeshStandardMaterial({ color: "#ff7d1e", roughness: 0.42, metalness: 0.12 })
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 2.4;
  roof.scale.set(1.2, 0.7, 1.05);
  group.add(roof);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.42),
    new THREE.MeshStandardMaterial({
      color: "#281611",
      emissive: "#ff8e2f",
      emissiveIntensity: 0.42,
      roughness: 0.38,
    })
  );
  sign.position.set(0, 1.92, 1.18);
  group.add(sign);

  const awningBar = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.14, 0.16),
    new THREE.MeshStandardMaterial({ color: "#6b2713", roughness: 0.54, metalness: 0.06 })
  );
  awningBar.position.set(0, 1.72, 1.3);
  group.add(awningBar);

  [-1.2, -0.6, 0, 0.6, 1.2].forEach((x, index) => {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.46, 0.06),
      new THREE.MeshStandardMaterial({
        color: index % 2 === 0 ? "#ff8f3d" : "#f5d2ad",
        roughness: 0.56,
        metalness: 0.04,
      })
    );
    stripe.position.set(x, 1.46, 1.31);
    stripe.rotation.x = -0.16;
    group.add(stripe);
  });

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: "#ffd397",
    emissive: "#ffaf56",
    emissiveIntensity: 0.92,
    roughness: 0.3,
  });

  [-0.92, 0, 0.92].forEach((x) => {
    const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.74), windowMaterial);
    windowMesh.position.set(x, 1.14, 1.16);
    group.add(windowMesh);
  });

  const doorPivotLeft = new THREE.Group();
  doorPivotLeft.position.set(-0.22, 0.5, 1.16);
  const doorLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.96, 0.04),
    new THREE.MeshStandardMaterial({ color: "#4a2b1d", roughness: 0.66 })
  );
  doorLeft.position.x = 0.21;
  doorPivotLeft.add(doorLeft);
  group.add(doorPivotLeft);

  const doorPivotRight = new THREE.Group();
  doorPivotRight.position.set(0.22, 0.5, 1.16);
  const doorRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.96, 0.04),
    new THREE.MeshStandardMaterial({ color: "#4a2b1d", roughness: 0.66 })
  );
  doorRight.position.x = -0.21;
  doorPivotRight.add(doorRight);
  group.add(doorPivotRight);

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 0.6, 0.72),
    new THREE.MeshStandardMaterial({ color: "#8b4518", roughness: 0.74 })
  );
  counter.position.set(0, 0.44, 1.8);
  group.add(counter);

  [-1.5, 1.5].forEach((x) => {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({
        color: "#fff0d6",
        emissive: "#ffbf76",
        emissiveIntensity: 1.1,
        roughness: 0.22,
      })
    );
    lantern.position.set(x, 1.78, 1.28);
    group.add(lantern);
  });

  const tacoShellMaterial = new THREE.MeshStandardMaterial({ color: "#f1c261", roughness: 0.75 });
  const tacoTopMaterial = new THREE.MeshStandardMaterial({ color: "#56aa40", roughness: 0.9 });
  [-0.6, 0, 0.6].forEach((x, index) => {
    const shell = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.09, 10, 28, Math.PI), tacoShellMaterial);
    shell.rotation.x = Math.PI / 2;
    shell.position.set(x, 0.84 + index * 0.01, 2.05);
    group.add(shell);

    const top = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), tacoTopMaterial);
    top.scale.set(1.6, 0.5, 0.95);
    top.position.set(x, 0.9, 2.02);
    group.add(top);
  });

  return { group, doorPivotLeft, doorPivotRight };
}

function createHostPlane(textureLoader) {
  const texture = textureLoader.load("/images/fabian.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 1.92), material);
  mesh.position.set(3.15, 1.28, 0.75);
  mesh.visible = false;
  return mesh;
}

function createCurtain(side = 1) {
  const geometry = new THREE.PlaneGeometry(2.2, 5.6, 20, 20);
  const material = new THREE.MeshStandardMaterial({
    color: "#6f120d",
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(side * 2.2, 1.8, 2.45);
  return mesh;
}

function createFireGroup(texture) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
  });

  const flameMain = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.95), material.clone());
  flameMain.position.set(-0.22, 0.64, 2.16);
  group.add(flameMain);

  const flameSide = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.72), material.clone());
  flameSide.position.set(0.3, 0.58, 2.12);
  flameSide.material.opacity = 0.28;
  group.add(flameSide);

  const emberLight = new THREE.PointLight("#ff7e2c", 1.6, 8, 2);
  emberLight.position.set(0, 0.66, 2.1);
  group.add(emberLight);

  return { group, emberLight, flames: [flameMain, flameSide] };
}

function createHeatLayer() {
  const material = new THREE.MeshBasicMaterial({
    color: "#ffbf7f",
    transparent: true,
    opacity: 0.075,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.1), material);
  mesh.position.set(0, 1.04, 1.92);
  return mesh;
}

function inferSteamQuality(reducedMotion) {
  if (reducedMotion) return "off";

  const isMobileViewport = window.innerWidth <= 720;
  const lowMemory =
    typeof navigator.deviceMemory === "number" && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4;

  if (isMobileViewport || lowMemory || lowCpu) return "light";
  return "full";
}

function isLowEndDevice() {
  const isMobileViewport = window.innerWidth <= 899;
  const lowMemory =
    typeof navigator.deviceMemory === "number" && navigator.deviceMemory > 0 && navigator.deviceMemory <= 4;
  const lowCpu =
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4;

  return isMobileViewport || lowMemory || lowCpu;
}

function buildSpeechQueue() {
  return {
    speak() {},
    stop() {},
  };
}

function readStoredFlag(key) {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeStoredFlag(key, value) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // Ignore storage write failures.
  }
}

function getIntroRevealTargets() {
  return [
    document.querySelector(".site-header"),
    document.querySelector("main"),
    document.querySelector(".site-footer"),
    document.querySelector(".social-floating-links"),
    document.querySelector(".floating-fabian-host"),
    document.querySelector(".floating-whatsapp"),
  ].filter(Boolean);
}

function createIntroCubeTransition({ introScreen, reducedMotion, lowEndDevice, skipPremium }) {
  if (!(introScreen instanceof HTMLElement)) return null;

  const pageTargets = getIntroRevealTargets();
  const body = document.body;

  if (reducedMotion || skipPremium || lowEndDevice || pageTargets.length === 0) {
    body.classList.add("intro-transitioning-quick");
    gsap.set(pageTargets, {
      opacity: 0,
      y: 24,
      scale: 0.985,
      filter: "blur(10px)",
      willChange: "transform, opacity, filter",
    });

    const timeline = gsap.timeline({ defaults: { overwrite: true } });
    timeline
      .to(
        introScreen,
        {
          opacity: 0,
          y: -10,
          scale: 0.985,
          duration: reducedMotion ? 0.18 : 0.24,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        pageTargets,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: reducedMotion ? 0.18 : 0.32,
          ease: "power2.out",
          stagger: 0.03,
          clearProps: "willChange",
        },
        reducedMotion ? 0 : 0.08
      );

    return {
      durationMs: reducedMotion ? 180 : 300,
      cleanup() {
        timeline.kill();
        body.classList.remove("intro-transitioning-quick");
        gsap.set(pageTargets, { clearProps: "opacity,transform,filter,willChange" });
      },
    };
  }

  body.classList.add("intro-transitioning-3d");
  introScreen.classList.add("is-cube-transition");

  const introRender = introScreen.querySelector(".intro-screen__render");
  const introUi = introScreen.querySelector(".intro-screen__ui");
  const introLayers = [introScreen, introRender, introUi].filter(Boolean);
  const pagePanel = document.createElement("div");
  pagePanel.className = "intro-page-panel";
  pagePanel.setAttribute("aria-hidden", "true");
  body.appendChild(pagePanel);

  const sheen = document.createElement("span");
  sheen.className = "intro-cube-sheen";
  pagePanel.appendChild(sheen);

  gsap.set(introScreen, {
    transformOrigin: "left center",
    transformPerspective: 1800,
    rotationY: 0,
    z: 0,
    xPercent: 0,
    scale: 1,
    opacity: 1,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    willChange: "transform, opacity, filter",
  });
  gsap.set([introRender, introUi].filter(Boolean), {
    transformOrigin: "center center",
    willChange: "transform, opacity, filter",
  });
  gsap.set(pagePanel, {
    transformOrigin: "right center",
    transformPerspective: 1800,
    rotationY: 88,
    xPercent: -50,
    z: -140,
    opacity: 0.82,
    willChange: "transform, opacity, filter",
  });
  gsap.set(sheen, {
    opacity: 0,
    xPercent: -28,
    willChange: "transform, opacity",
  });
  gsap.set(pageTargets, {
    opacity: 0,
    rotationY: 88,
    xPercent: -4,
    z: -140,
    scale: 1.04,
    filter: "blur(9px) brightness(1.08)",
    transformOrigin: "right center",
    transformPerspective: 1800,
    willChange: "transform, opacity, filter",
  });

  const timeline = gsap.timeline({ defaults: { overwrite: true } });
  timeline
    .to(
      introLayers,
      {
        rotateY: -91,
        xPercent: 12,
        z: -170,
        opacity: 0.12,
        scale: 0.985,
        filter: "brightness(1.12) blur(4px)",
        duration: 0.98,
        ease: "power2.inOut",
        stagger: 0.015,
      },
      0
    )
    .to(
      introScreen,
      {
        boxShadow: "0 40px 90px rgba(0,0,0,0.34)",
        duration: 0.36,
        ease: "power2.out",
      },
      0
    )
    .to(
      pagePanel,
      {
        rotationY: 0,
        xPercent: 0,
        z: 0,
        opacity: 1,
        duration: 0.98,
        ease: "power2.inOut",
      },
      0
    )
    .to(
      pageTargets,
      {
        opacity: 1,
        rotationY: 0,
        xPercent: 0,
        z: 0,
        scale: 1,
        filter: "blur(0px) brightness(1)",
        duration: 0.9,
        ease: "power2.inOut",
        stagger: 0.025,
      },
      0.08
    )
    .to(
      sheen,
      {
        opacity: 0.72,
        xPercent: 112,
        duration: 0.54,
        ease: "power2.inOut",
      },
      0.16
    )
    .to(
      sheen,
      {
        opacity: 0,
        duration: 0.2,
        ease: "sine.out",
      },
      0.62
    );

  return {
    durationMs: 980,
    cleanup() {
      timeline.kill();
      pagePanel.remove();
      introScreen.classList.remove("is-cube-transition");
      body.classList.remove("intro-transitioning-3d");
      gsap.set(introLayers, { clearProps: "transform,opacity,filter,willChange,boxShadow" });
      gsap.set(pageTargets, { clearProps: "transform,opacity,filter,willChange" });
      gsap.set(sheen, { clearProps: "transform,opacity,willChange" });
    },
  };
}

export async function initIntroExperience({
  introScreen,
  introSkipBtn,
}) {
  const canvas = introScreen.querySelector("#introCanvas");
  const narration = introScreen.querySelector("#introNarration");
  const hostCard = introScreen.querySelector("#fabianIntro");
  const hostSprite = introScreen.querySelector(".intro-screen__host-sprite");
  const hostLine = introScreen.querySelector("#introHostLine");
  const introSoundBtn = introScreen.querySelector("#introSoundBtn");
  const hostVideo = introScreen.querySelector(".intro-screen__host-video");
  const isStandaloneMode =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEndDevice = isLowEndDevice();
  const introTransitionSeenKey = "tacos_fabian_intro_cube_seen";
  const skipPremiumIntroTransition = readStoredFlag(introTransitionSeenKey);
  const steamQuality = inferSteamQuality(reducedMotion);
  const autoDismissMs = reducedMotion ? 650 : 17000;
  const introOutroBufferMs = isStandaloneMode ? 1400 : 1100;
  const preferredVisualSrc =
    hostVideo instanceof HTMLVideoElement ? hostVideo.dataset.preferredVisual || "/images/fabian_transparente_mejor.webm" : "";
  const visualFallbackSrc =
    hostVideo instanceof HTMLVideoElement
      ? hostVideo.dataset.browserFallback || hostVideo.dataset.audioFallback || "/images/fabian_web_audio5.mp4"
      : "";
  const audioFallbackSrc =
    hostVideo instanceof HTMLVideoElement ? hostVideo.dataset.audioFallback || "/images/fabian_web_audio5.mp4" : "";
  const fallbackAudio = audioFallbackSrc ? new Audio(audioFallbackSrc) : null;
  const ambientIntro = !isStandaloneMode ? new Audio("/audio/ambient-intro.mp3.mp3") : null;
  if (fallbackAudio) {
    fallbackAudio.preload = "auto";
    fallbackAudio.loop = false;
    fallbackAudio.volume = 0.88;
  }
  if (ambientIntro) {
    ambientIntro.preload = "auto";
    ambientIntro.loop = true;
    ambientIntro.volume = 0.01;
    ambientIntro.crossOrigin = "anonymous";
  }
  if (hostVideo instanceof HTMLVideoElement) {
    if (isStandaloneMode && preferredVisualSrc) {
      hostVideo.src = preferredVisualSrc;
      hostVideo.dataset.resolvedSrc = preferredVisualSrc;
      hostVideo.dataset.resolvedType =
        preferredVisualSrc.endsWith(".mp4") ? "video/mp4" : 'video/webm; codecs="vp9,opus"';
      hostVideo.load();
    } else if (!isStandaloneMode && visualFallbackSrc) {
      hostVideo.src = visualFallbackSrc;
      hostVideo.dataset.resolvedSrc = visualFallbackSrc;
      hostVideo.dataset.resolvedType = "video/mp4";
      hostVideo.load();
    }
    hostVideo.autoplay = true;
    hostVideo.preload = "auto";
    hostVideo.playsInline = true;
    hostVideo.setAttribute("playsinline", "");
    hostVideo.setAttribute("webkit-playsinline", "");
    hostVideo.loop = false;
    hostVideo.muted = false;
    hostVideo.defaultMuted = false;
    hostVideo.removeAttribute("muted");
    hostVideo.volume = 0.88;
  }

  if (!(canvas instanceof HTMLCanvasElement) || !(narration instanceof HTMLElement)) {
    document.body.classList.remove("intro-active");
    return;
  }

  let closed = false;
  let autoDismissTimer = 0;
  let rafId = 0;
  let speakingTimer = 0;
  let timeline = null;
  let audioMode = "idle";
  let audioToken = 0;
  let usingFallbackAudio = false;
  let ambientEnabled = false;
  let autoplayRetryTimer = 0;
  let autoplayRetryCount = 0;
  const exitDurationMs = reducedMotion ? 180 : skipPremiumIntroTransition || lowEndDevice ? 300 : 980;
  let hostSideSwapped = false;
  let introAudioUnlockBound = false;
  let viewportRepairTimer = 0;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowEndDevice,
    alpha: true,
    powerPreference: "high-performance",
  });
  const maxPixelRatio = reducedMotion ? 1 : lowEndDevice ? 1.15 : 1.6;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#090a0d", 0.1);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.set(0, 2.1, 10.4);
  camera.lookAt(0, 1.4, 0);

  const ambientLight = new THREE.AmbientLight("#8f5b39", 0.5);
  scene.add(ambientLight);

  const rimLight = new THREE.PointLight("#ffab54", 4, 20, 2);
  rimLight.position.set(0, 5.2, 4.8);
  scene.add(rimLight);

  const signLight = new THREE.PointLight("#ff7a1a", 5.1, 18, 2);
  signLight.position.set(0, 2.7, 3.8);
  scene.add(signLight);

  const grillLight = new THREE.PointLight("#ff6f1b", 0.1, 9, 2);
  grillLight.position.set(0, 0.52, 2.1);
  scene.add(grillLight);

  const spotLeft = new THREE.SpotLight("#ffe0b6", 0.1, 30, 0.36, 0.6, 1.4);
  const spotRight = new THREE.SpotLight("#ffd2a3", 0.1, 30, 0.36, 0.6, 1.4);
  spotLeft.position.set(-6.5, 8.5, 8);
  spotRight.position.set(6.5, 8.5, 8);
  spotLeft.target.position.set(0, 1.5, 1);
  spotRight.target.position.set(0, 1.5, 1);
  scene.add(spotLeft, spotRight, spotLeft.target, spotRight.target);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 60),
    new THREE.MeshStandardMaterial({
      color: "#101214",
      roughness: 0.95,
      metalness: 0.03,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  scene.add(floor);

  const floorGlow = new THREE.Mesh(
    new THREE.CircleGeometry(4.8, 48),
    new THREE.MeshBasicMaterial({ color: "#ff8b26", transparent: true, opacity: 0.08 })
  );
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.y = 0.02;
  scene.add(floorGlow);

  const titlePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6.8, 1.35),
    new THREE.MeshBasicMaterial({ color: "#ffb77b", transparent: true, opacity: 0 })
  );
  titlePlane.position.set(0, 4.1, -1.2);
  scene.add(titlePlane);

  const { group: taqueria, doorPivotLeft, doorPivotRight } = createTaqueriaGroup();
  taqueria.position.set(0, -0.2, 0.2);
  taqueria.scale.setScalar(0.82);
  scene.add(taqueria);

  const textureLoader = new THREE.TextureLoader();
  const hostPlane = createHostPlane(textureLoader);
  const hostBasePosition = { x: 3.45, y: 0.98 };
  hostPlane.visible = false;
  scene.add(hostPlane);
  hostCard?.classList.add("is-visible");
  if (hostCard) hostCard.classList.remove("has-sprite", "is-walking");
  if (hostSprite instanceof HTMLElement) hostSprite.style.backgroundImage = "";

  const curtainLeft = createCurtain(-1);
  const curtainRight = createCurtain(1);
  scene.add(curtainLeft, curtainRight);

  const fireTexture = createFireTexture();
  const { group: fireGroup, emberLight, flames } = createFireGroup(fireTexture);
  fireGroup.position.y = -0.02;
  fireGroup.visible = false;
  scene.add(fireGroup);

  const heatLayer = createHeatLayer();
  heatLayer.visible = false;
  scene.add(heatLayer);

  const smokeTexture = createSmokeTexture();
  const smokeMaterial = new THREE.PointsMaterial({
    map: smokeTexture,
    transparent: true,
    opacity: steamQuality === "light" ? 0.11 : 0.14,
    size: steamQuality === "light" ? 1.2 : 1.42,
    depthWrite: false,
    color: "#fff1df",
    blending: THREE.AdditiveBlending,
  });
  const smokeGeometry = new THREE.BufferGeometry();
  const smokeCount = steamQuality === "light" ? 24 : 42;
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeData = Array.from({ length: smokeCount }, () => ({
    x: (Math.random() - 0.5) * 0.9,
    y: 0.94 + Math.random() * 0.44,
    z: 1.7 + Math.random() * 0.28,
    speed: 0.0018 + Math.random() * 0.0026,
    drift: 0.0004 + Math.random() * 0.0008,
    swirl: 0.35 + Math.random() * 0.55,
  }));

  smokeData.forEach((particle, index) => {
    smokePositions[index * 3] = particle.x;
    smokePositions[index * 3 + 1] = particle.y;
    smokePositions[index * 3 + 2] = particle.z;
  });
  smokeGeometry.setAttribute("position", new THREE.BufferAttribute(smokePositions, 3));
  const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
  scene.add(smoke);

  const steamMaterial = new THREE.PointsMaterial({
    map: smokeTexture,
    transparent: true,
    opacity: steamQuality === "light" ? 0.07 : 0.095,
    size: steamQuality === "light" ? 1.65 : 2,
    depthWrite: false,
    color: "#ffdcb8",
    blending: THREE.AdditiveBlending,
  });
  const steamGeometry = new THREE.BufferGeometry();
  const steamCount = steamQuality === "light" ? 10 : 18;
  const steamPositions = new Float32Array(steamCount * 3);
  const steamData = Array.from({ length: steamCount }, () => ({
    x: (Math.random() - 0.5) * 1.2,
    y: 0.9 + Math.random() * 0.24,
    z: 1.6 + Math.random() * 0.46,
    speed: 0.0014 + Math.random() * 0.0018,
    drift: 0.00055 + Math.random() * 0.00055,
  }));

  steamData.forEach((particle, index) => {
    steamPositions[index * 3] = particle.x;
    steamPositions[index * 3 + 1] = particle.y;
    steamPositions[index * 3 + 2] = particle.z;
  });
  steamGeometry.setAttribute("position", new THREE.BufferAttribute(steamPositions, 3));
  const steam = new THREE.Points(steamGeometry, steamMaterial);
  scene.add(steam);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = lowEndDevice ? 56 : 120;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    particlePositions[index * 3] = (Math.random() - 0.5) * 18;
    particlePositions[index * 3 + 1] = Math.random() * 8;
    particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: "#ffd2a2",
      transparent: true,
      opacity: 0.75,
      size: 0.05,
      sizeAttenuation: true,
    })
  );
  scene.add(particles);

  const emberGeometry = new THREE.BufferGeometry();
  const emberCount = steamQuality === "light" ? 8 : 14;
  const emberPositions = new Float32Array(emberCount * 3);
  const emberData = Array.from({ length: emberCount }, () => ({
    x: (Math.random() - 0.5) * 0.72,
    y: 0.48 + Math.random() * 0.18,
    z: 1.98 + Math.random() * 0.18,
    speed: 0.0016 + Math.random() * 0.0022,
  }));

  emberData.forEach((particle, index) => {
    emberPositions[index * 3] = particle.x;
    emberPositions[index * 3 + 1] = particle.y;
    emberPositions[index * 3 + 2] = particle.z;
  });
  emberGeometry.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
  const embers = new THREE.Points(
    emberGeometry,
    new THREE.PointsMaterial({
      color: "#ffb065",
      transparent: true,
      opacity: 0.42,
      size: 0.07,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  embers.visible = false;
  scene.add(embers);

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  };
  window.addEventListener("resize", resize);

  const syncFallbackAudioTime = (force = false) => {
    if (!usingFallbackAudio || !fallbackAudio || !(hostVideo instanceof HTMLVideoElement)) return;
    if (force || Math.abs(fallbackAudio.currentTime - hostVideo.currentTime) > 0.2) {
      try {
        fallbackAudio.currentTime = hostVideo.currentTime;
      } catch {
        // Ignore sync issues while media metadata is still settling.
      }
    }
  };

  const stopFallbackAudio = ({ reset = false } = {}) => {
    if (!fallbackAudio) return;
    fallbackAudio.pause();
    if (reset) {
      try {
        fallbackAudio.currentTime = 0;
      } catch {
        // Ignore reset issues if audio has not loaded yet.
      }
    }
  };

  const fadeAmbientTo = (volume, duration = 0.55) => {
    if (!ambientIntro) return;
    gsap.killTweensOf(ambientIntro);
    gsap.to(ambientIntro, {
      volume,
      duration,
      ease: "sine.inOut",
      overwrite: true,
    });
  };

  const stopAmbientIntro = ({ reset = false } = {}) => {
    if (!ambientIntro) return;
    ambientIntro.pause();
    if (reset) {
      try {
        ambientIntro.currentTime = 0;
      } catch {
        // Ignore reset issues if the track has not buffered enough yet.
      }
    }
    ambientEnabled = false;
  };

  const ensureAmbientIntro = async ({ force = false } = {}) => {
    if (!ambientIntro || closed) return false;
    if (!force && ambientEnabled && !ambientIntro.paused) return true;
    try {
      await ambientIntro.play();
      ambientEnabled = true;
      return true;
    } catch {
      ambientEnabled = false;
      return false;
    }
  };

  const clearAutoplayRetry = () => {
    if (autoplayRetryTimer) window.clearTimeout(autoplayRetryTimer);
    autoplayRetryTimer = 0;
  };

  const scheduleAutoplayRetry = (delay = 220) => {
    if (closed || document.hidden || audioMode === "media" || audioMode === "starting") return;
    if (autoplayRetryCount >= 3) return;
    clearAutoplayRetry();
    autoplayRetryTimer = window.setTimeout(() => {
      autoplayRetryCount += 1;
      void tryPlayNarrationAudio({ restart: autoplayRetryCount > 1 });
    }, delay);
  };

  const isUsingAudioFallbackVideoSource = () => {
    if (!(hostVideo instanceof HTMLVideoElement) || !audioFallbackSrc) return false;
    const resolvedSrc = hostVideo.dataset.resolvedSrc || hostVideo.currentSrc || hostVideo.src;
    if (!resolvedSrc) return false;
    const absoluteAudioFallback = new URL(audioFallbackSrc, window.location.origin).href;
    return resolvedSrc === audioFallbackSrc || resolvedSrc === absoluteAudioFallback;
  };

  const swapHostVideoSource = (src) => {
    if (!(hostVideo instanceof HTMLVideoElement) || !src) return false;
    const resolvedSrc = hostVideo.dataset.resolvedSrc || hostVideo.currentSrc || hostVideo.src;
    const absoluteTarget = new URL(src, window.location.origin).href;
    if (resolvedSrc === src || resolvedSrc === absoluteTarget) return false;
    hostVideo.pause();
    hostVideo.src = src;
    hostVideo.dataset.resolvedSrc = src;
    hostVideo.dataset.resolvedType = src.endsWith(".mp4") ? "video/mp4" : 'video/webm; codecs="vp9,opus"';
    hostVideo.load();
    return true;
  };

  const waitForVideoProgress = (timeout = 1200) =>
    new Promise((resolve) => {
      if (!(hostVideo instanceof HTMLVideoElement)) {
        resolve(false);
        return;
      }

      const startTime = hostVideo.currentTime;
      const startedAt = performance.now();

      const finish = (result) => {
        hostVideo.removeEventListener("timeupdate", onProgress);
        resolve(result);
      };

      const onProgress = () => {
        if (hostVideo.currentTime > startTime + 0.05) finish(true);
      };

      const tick = () => {
        if (!(hostVideo instanceof HTMLVideoElement)) {
          finish(false);
          return;
        }

        if (hostVideo.currentTime > startTime + 0.05) {
          finish(true);
          return;
        }

        if (performance.now() - startedAt >= timeout) {
          finish(false);
          return;
        }

        window.requestAnimationFrame(tick);
      };

      hostVideo.addEventListener("timeupdate", onProgress, { once: false });
      tick();
    });

  const ensureVisualPlayback = async ({ restart = false, muted = true, preferFallback = false } = {}) => {
    if (!(hostVideo instanceof HTMLVideoElement)) return false;

    if (preferFallback && visualFallbackSrc) {
      swapHostVideoSource(visualFallbackSrc);
    }

    try {
      if (restart) {
        hostVideo.pause();
        hostVideo.currentTime = 0;
      }
      hostVideo.muted = muted;
      hostVideo.defaultMuted = muted;
      hostVideo.volume = muted ? 0 : 0.88;
      await hostVideo.play();
      hostCard?.classList.add("is-playing");
      const progressed = await waitForVideoProgress(preferFallback ? 1500 : 1200);
      if (progressed) hostVideo.classList.add("is-ready");
      if (!progressed && visualFallbackSrc && !preferFallback && swapHostVideoSource(visualFallbackSrc)) {
        return ensureVisualPlayback({ restart: true, muted, preferFallback: true });
      }
      return progressed;
    } catch {
      hostCard?.classList.remove("is-playing");
      if (visualFallbackSrc && !preferFallback && swapHostVideoSource(visualFallbackSrc)) {
        return ensureVisualPlayback({ restart: true, muted, preferFallback: true });
      }
      return false;
    }
  };

  const fadeHostVideoTo = (volume, duration = 0.45) => {
    if (!(hostVideo instanceof HTMLVideoElement)) return;
    gsap.killTweensOf(hostVideo);
    gsap.to(hostVideo, {
      volume,
      duration,
      ease: "sine.inOut",
      overwrite: true,
    });
    if (usingFallbackAudio && fallbackAudio) {
      gsap.killTweensOf(fallbackAudio);
      gsap.to(fallbackAudio, {
        volume,
        duration,
        ease: "sine.inOut",
        overwrite: true,
      });
    }
  };

  const mediaHasUsableAudio = () => {
    if (!(hostVideo instanceof HTMLVideoElement)) return false;
    if (typeof hostVideo.mozHasAudio === "boolean") return hostVideo.mozHasAudio;
    if (hostVideo.audioTracks && typeof hostVideo.audioTracks.length === "number") {
      return hostVideo.audioTracks.length > 0;
    }
    if (typeof hostVideo.webkitAudioDecodedByteCount === "number") {
      return hostVideo.webkitAudioDecodedByteCount > 0;
    }
    return false;
  };

  const restoreIntroPlayback = async () => {
    if (closed || !(hostVideo instanceof HTMLVideoElement) || document.hidden) return;

    if (audioMode === "media") {
      try {
        if (hostVideo.paused) await hostVideo.play();
        if (usingFallbackAudio && fallbackAudio?.paused) {
          syncFallbackAudioTime(true);
          await fallbackAudio.play();
        }
        if (ambientEnabled && ambientIntro?.paused) {
          await ambientIntro.play();
        }
        hostCard?.classList.add("is-playing");
        hostVideo.classList.add("is-ready");
        return;
      } catch {
        // Fall through to the safe restart path below.
      }
    }

    if (audioMode === "starting") return;

    const visualStarted = await ensureVisualPlayback({ restart: false, muted: audioMode !== "media" });
    if (!visualStarted) {
      await ensureVisualPlayback({ restart: true, muted: audioMode !== "media", preferFallback: true });
    }

    if (audioMode === "media") {
      await tryPlayNarrationAudio({ restart: false });
    } else if (autoplayRetryCount < 3) {
      scheduleAutoplayRetry(120);
    }
  };

  const scheduleViewportRepair = () => {
    if (closed) return;
    if (viewportRepairTimer) window.clearTimeout(viewportRepairTimer);
    viewportRepairTimer = window.setTimeout(() => {
      resize();
      void restoreIntroPlayback();
    }, 220);
  };

  const unlockIntroAudioOnInteraction = (event) => {
    if (closed || audioMode === "media" || audioMode === "starting") return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("a, button, input, textarea, select, label, [role='button']")
    ) {
      return;
    }
    void restartIntroExperience();
  };

  const removeIntroAudioUnlockListeners = () => {
    if (!introAudioUnlockBound) return;
    introAudioUnlockBound = false;
    window.removeEventListener("pointerdown", unlockIntroAudioOnInteraction, true);
    window.removeEventListener("touchstart", unlockIntroAudioOnInteraction, true);
  };

  const armIntroAudioUnlockListeners = () => {
    if (introAudioUnlockBound) return;
    introAudioUnlockBound = true;
    window.addEventListener("pointerdown", unlockIntroAudioOnInteraction, true);
    window.addEventListener("touchstart", unlockIntroAudioOnInteraction, true);
  };

  const moveHostToOppositeSide = () => {
    if (!hostCard || hostSideSwapped || closed) return;
    hostSideSwapped = true;
    hostCard.classList.add("is-swapped");
    gsap.fromTo(
      hostCard,
      { x: 0, y: 0, scale: 1 },
      {
        keyframes: [
          { x: -18, y: -12, scale: 1.02, duration: reducedMotion ? 0.16 : 0.3 },
          { x: -10, y: -5, scale: 0.995, duration: reducedMotion ? 0.16 : 0.28 },
          { x: 0, y: 0, scale: 1, duration: reducedMotion ? 0.16 : 0.32 },
        ],
        ease: "power2.inOut",
        overwrite: true,
        clearProps: "x,y,scale",
      }
    );
  };

  const tryPlayNarrationAudio = async ({ restart = false } = {}) => {
    if (!(hostVideo instanceof HTMLVideoElement)) return false;
    if (!restart && audioMode === "media" && !hostVideo.paused) return true;

    const token = ++audioToken;
    audioMode = "starting";
    usingFallbackAudio = false;

    try {
      stopFallbackAudio({ reset: true });
      hostVideo.pause();
      hostVideo.currentTime = 0;
      hostVideo.muted = false;
      hostVideo.defaultMuted = false;
      hostVideo.volume = 0;
      await hostVideo.play();
      if (!isUsingAudioFallbackVideoSource() && !mediaHasUsableAudio() && fallbackAudio) {
        usingFallbackAudio = true;
        hostVideo.muted = true;
        hostVideo.defaultMuted = true;
        syncFallbackAudioTime(true);
        fallbackAudio.volume = 0;
        await fallbackAudio.play();
      }
      fadeHostVideoTo(0.88, 0.18);
      await ensureAmbientIntro({ force: restart });
      const visualReady = await waitForVideoProgress(1200);
      if (!visualReady && visualFallbackSrc && swapHostVideoSource(visualFallbackSrc)) {
        stopFallbackAudio({ reset: true });
        usingFallbackAudio = false;
        return tryPlayNarrationAudio({ restart: true });
      }
      if (token !== audioToken) return false;
      hostVideo.classList.add("is-ready");
      if (ambientEnabled) fadeAmbientTo(0.06, 0.65);
      audioMode = "media";
      scheduleFinishFromMedia();
      if (ambientEnabled || isStandaloneMode) {
        introSoundBtn?.classList.add("is-hidden");
      } else {
        introSoundBtn?.classList.remove("is-hidden");
      }
      clearAutoplayRetry();
      autoplayRetryCount = 0;
      removeIntroAudioUnlockListeners();
      return true;
    } catch {
      if (token !== audioToken) return false;
      try {
        usingFallbackAudio = false;
        stopFallbackAudio({ reset: true });
        const visualStarted = await ensureVisualPlayback({ restart: true, muted: true });
        if (!visualStarted) throw new Error("visual-playback-failed");
        if (token !== audioToken) return false;
        await ensureAmbientIntro({ force: restart });
        if (ambientEnabled) fadeAmbientTo(0.085, 0.6);
        audioMode = "idle";
        introSoundBtn?.classList.remove("is-hidden");
        scheduleAutoplayRetry(280);
        armIntroAudioUnlockListeners();
        return false;
      } catch {
        if (token !== audioToken) return false;
        usingFallbackAudio = false;
        stopFallbackAudio({ reset: true });
        hostVideo.pause();
        hostVideo.currentTime = 0;
        hostVideo.muted = true;
        hostVideo.defaultMuted = true;
        hostVideo.volume = 0;
        stopAmbientIntro({ reset: true });
        audioMode = "idle";
        introSoundBtn?.classList.remove("is-hidden");
        scheduleAutoplayRetry(320);
        armIntroAudioUnlockListeners();
        return false;
      }
    }
  };

  const scheduleFinish = (delay = autoDismissMs) => {
    if (autoDismissTimer) window.clearTimeout(autoDismissTimer);
    autoDismissTimer = window.setTimeout(finishIntro, delay);
  };

  const scheduleFinishFromMedia = () => {
    if (!(hostVideo instanceof HTMLVideoElement)) {
      scheduleFinish(autoDismissMs);
      return;
    }

    if (audioMode === "media") {
      if (usingFallbackAudio && fallbackAudio) {
        const fallbackDuration = fallbackAudio.duration;
        if (Number.isFinite(fallbackDuration) && fallbackDuration > 0) {
          const fallbackRemainingMs = Math.max(
            4600,
            Math.round((fallbackDuration - fallbackAudio.currentTime) * 1000) + introOutroBufferMs + 900
          );
          scheduleFinish(fallbackRemainingMs);
          return;
        }
      }

      const hostDuration = hostVideo.duration;
      if (Number.isFinite(hostDuration) && hostDuration > 0) {
        const hostRemainingMs = Math.max(
          4600,
          Math.round((hostDuration - hostVideo.currentTime) * 1000) + introOutroBufferMs + 900
        );
        scheduleFinish(hostRemainingMs);
        return;
      }
    }

    const durationSeconds = usingFallbackAudio && fallbackAudio ? fallbackAudio.duration : hostVideo.duration;
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
      const remainingMs = Math.max(3200, Math.round((durationSeconds - hostVideo.currentTime) * 1000) + introOutroBufferMs);
      scheduleFinish(remainingMs);
      return;
    }

    scheduleFinish(autoDismissMs);
  };

  const restartIntroExperience = async () => {
    if (closed) return false;

    timeline?.pause(0);
    timeline?.restart();
    hostSideSwapped = false;
    hostCard?.classList.remove("is-swapped", "is-playing");
    setNarrationLine(SCRIPT_SEGMENTS[0], SCRIPT_SEGMENTS[0]);
    const started = await tryPlayNarrationAudio({ restart: true });

    if (started) pulseSpeaking(2600);

    return started;
  };

  const pulseSpeaking = (duration = 2500) => {
    if (!hostCard) return;
    hostCard.classList.add("is-speaking");
    if (speakingTimer) window.clearTimeout(speakingTimer);
    speakingTimer = window.setTimeout(() => {
      hostCard.classList.remove("is-speaking");
    }, duration);
  };

  const setNarrationLine = (text, narratorText = text) => {
    narration.innerHTML = "";
    const line = document.createElement("p");
    line.className = "intro-screen__narration-line is-active";
    line.textContent = text;
    narration.appendChild(line);
    if (hostLine) hostLine.textContent = text;
    pulseSpeaking();
  };

  const finishIntro = () => {
    if (closed) return;
    closed = true;

    if (speakingTimer) window.clearTimeout(speakingTimer);
    if (viewportRepairTimer) window.clearTimeout(viewportRepairTimer);
    clearAutoplayRetry();
    hostCard?.classList.remove("is-speaking");
    hostCard?.classList.remove("is-playing");
    audioToken += 1;
    audioMode = "idle";
    fadeHostVideoTo(0, 0.35);
    fadeAmbientTo(0.01, 0.25);
    window.setTimeout(() => {
      if (!(hostVideo instanceof HTMLVideoElement)) return;
      usingFallbackAudio = false;
      stopFallbackAudio({ reset: true });
      stopAmbientIntro({ reset: true });
      hostVideo.pause();
      hostVideo.currentTime = 0;
      hostVideo.volume = 0.88;
    }, 360);
    removeIntroAudioUnlockListeners();
    if (autoDismissTimer) window.clearTimeout(autoDismissTimer);
    const cubeTransition = createIntroCubeTransition({
      introScreen,
      reducedMotion,
      lowEndDevice,
      skipPremium: skipPremiumIntroTransition,
    });
    introScreen.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-active");
    document.body.classList.add("intro-transition-static");
    document.body.classList.add("intro-complete");
    if (!skipPremiumIntroTransition && !reducedMotion && !lowEndDevice) {
      writeStoredFlag(introTransitionSeenKey, true);
    }

    timeline.kill();
    window.cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("orientationchange", scheduleViewportRepair);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pageshow", scheduleViewportRepair);
    renderer.dispose();
    smokeGeometry.dispose();
    smokeMaterial.dispose();
    steamGeometry.dispose();
    steamMaterial.dispose();
    particlesGeometry.dispose();
    emberGeometry.dispose();

    window.setTimeout(() => {
      cubeTransition?.cleanup?.();
      introScreen.classList.add("is-hidden");
      introScreen.remove();
      if (introSkipBtn instanceof HTMLElement) introSkipBtn.blur();
    }, cubeTransition?.durationMs ?? exitDurationMs);
  };

  introSkipBtn?.addEventListener("click", finishIntro);
  introSoundBtn?.addEventListener("click", async () => {
    if (audioMode === "media" && hostVideo instanceof HTMLVideoElement && !hostVideo.paused) {
      const ambientStarted = await ensureAmbientIntro({ force: true });
      if (ambientStarted) {
        fadeAmbientTo(0.06, 0.5);
        introSoundBtn?.classList.add("is-hidden");
      }
      return;
    }
    void restartIntroExperience();
  });
  hostVideo?.addEventListener("timeupdate", () => syncFallbackAudioTime());
  hostVideo?.addEventListener("seeking", () => syncFallbackAudioTime(true));
  hostVideo?.addEventListener("seeked", () => syncFallbackAudioTime(true));
  hostVideo?.addEventListener("pause", () => {
    if (usingFallbackAudio) stopFallbackAudio();
    if (!closed && !document.hidden) {
      scheduleViewportRepair();
    }
  });
  hostVideo?.addEventListener("play", () => {
    hostCard?.classList.add("is-playing");
  });
  hostVideo?.addEventListener("stalled", () => {
    if (closed || isStandaloneMode) return;
    void ensureVisualPlayback({ restart: false, muted: audioMode !== "media" });
  });
  hostVideo?.addEventListener("loadeddata", () => {
    if (closed || document.hidden) return;
    scheduleAutoplayRetry(90);
  });
  hostVideo?.addEventListener("canplay", () => {
    if (closed || document.hidden) return;
    scheduleAutoplayRetry(60);
  });
  hostVideo?.addEventListener("error", () => {
    if (closed) return;
    if (visualFallbackSrc) swapHostVideoSource(visualFallbackSrc);
    void ensureVisualPlayback({ restart: true, muted: audioMode !== "media", preferFallback: true });
  });
  hostVideo?.addEventListener("ended", () => {
    if (usingFallbackAudio && fallbackAudio && !fallbackAudio.ended) return;
    hostCard?.classList.remove("is-playing");
    finishIntro();
  });
  fallbackAudio?.addEventListener("ended", () => {
    if (!usingFallbackAudio) return;
    finishIntro();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finishIntro();
  });
  const handleVisibilityChange = () => {
    if (document.hidden) return;
    scheduleViewportRepair();
  };
  window.addEventListener("orientationchange", scheduleViewportRepair);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pageshow", scheduleViewportRepair);

  timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete: scheduleFinishFromMedia,
  });

  timeline
    .to([spotLeft, spotRight], { intensity: 2.65, duration: 1.05 }, 0)
    .to(signLight, { intensity: 5.8, duration: 1.2 }, 0.12)
    .to(titlePlane.material, { opacity: 0.5, duration: 1.12 }, 0.2)
    .fromTo(hostCard, { x: -24, y: 28, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 1.1, ease: "power2.out" }, 0.22)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[0]), null, 0.28)
    .to(camera.position, { z: 8.45, y: 2.28, duration: 2.9 }, 0.9)
    .to(taqueria.scale, { x: 0.96, y: 0.96, z: 0.96, duration: 2.9 }, 0.9)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[1]), null, 3.2)
    .call(moveHostToOppositeSide, null, 5)
    .call(() => {
      fireGroup.visible = true;
      grillLight.intensity = 1.2;
      heatLayer.visible = true;
      embers.visible = true;
    }, null, 4.05)
    .to(curtainLeft.position, { x: -4.4, duration: 1.1 }, 5.55)
    .to(curtainRight.position, { x: 4.4, duration: 1.1 }, 5.55)
    .to(doorPivotLeft.rotation, { y: -1.04, duration: 0.9 }, 5.8)
    .to(doorPivotRight.rotation, { y: 1.04, duration: 0.9 }, 5.8)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[2]), null, 6.15)
    .fromTo(hostPlane.position, { x: hostBasePosition.x, y: hostBasePosition.y }, { x: 2.82, y: 1.28, duration: 1.05, ease: "power2.out" }, 8.2)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[3]), null, 10.55)
    .to(camera.position, { z: 7.88, y: 2.1, duration: 1.15 }, 12.25)
    .to([spotLeft, spotRight], { intensity: 1.5, duration: 1.05 }, 12.65)
    .to(signLight, { intensity: 3.55, duration: 1.05 }, 12.65)
    .to(titlePlane.material, { opacity: 0.24, duration: 0.95 }, 12.95);

  const clock = new THREE.Clock();
  let lastFrameTime = 0;
  const minFrameGap = reducedMotion ? 48 : lowEndDevice ? 34 : 0;
  const render = () => {
    if (closed) return;
    const now = performance.now();
    if (minFrameGap && now - lastFrameTime < minFrameGap) {
      rafId = window.requestAnimationFrame(render);
      return;
    }
    lastFrameTime = now;
    const elapsed = clock.getElapsedTime();

    spotLeft.position.x = -6.5 + Math.sin(elapsed * 0.7) * 2.1;
    spotLeft.position.z = 8 + Math.cos(elapsed * 0.45) * 1.2;
    spotRight.position.x = 6.5 + Math.cos(elapsed * 0.62) * 2.1;
    spotRight.position.z = 8 + Math.sin(elapsed * 0.4) * 1.2;
    spotLeft.target.position.x = Math.sin(elapsed * 0.32) * 1.2;
    spotRight.target.position.x = Math.cos(elapsed * 0.28) * 1.2;
    grillLight.intensity = fireGroup.visible ? 1 + Math.sin(elapsed * 11) * 0.14 + Math.cos(elapsed * 6) * 0.08 : 0.08;
    emberLight.intensity = fireGroup.visible ? 1.3 + Math.sin(elapsed * 13) * 0.22 : 0.2;
    heatLayer.visible = fireGroup.visible;
    heatLayer.material.opacity = fireGroup.visible ? 0.045 + Math.abs(Math.sin(elapsed * 2.4)) * 0.025 : 0;
    heatLayer.lookAt(camera.position);

    titlePlane.lookAt(camera.position);
    particles.rotation.y += 0.0009;
    particles.position.y = Math.sin(elapsed * 0.3) * 0.08;
    smoke.rotation.y += 0.002;
    flames.forEach((flame, index) => {
      flame.scale.y = 0.88 + Math.sin(elapsed * (7.2 + index * 1.8)) * 0.055;
      flame.position.x += Math.sin(elapsed * (3.5 + index)) * 0.0008;
      flame.material.opacity = 0.16 + Math.abs(Math.sin(elapsed * (6.5 + index))) * 0.08;
      flame.lookAt(camera.position);
    });

    const positions = smokeGeometry.attributes.position.array;
    smokeData.forEach((particle, index) => {
      particle.y += particle.speed;
      particle.x += Math.sin(elapsed * particle.swirl + index * 0.16) * particle.drift;
      if (particle.y > 2.54) {
        particle.y = 0.96 + Math.random() * 0.16;
        particle.x = (Math.random() - 0.5) * 0.82;
      }
      positions[index * 3] = particle.x;
      positions[index * 3 + 1] = particle.y;
      positions[index * 3 + 2] = particle.z;
    });
    smokeGeometry.attributes.position.needsUpdate = true;

    const steamPositionsArray = steamGeometry.attributes.position.array;
    steamData.forEach((particle, index) => {
      particle.y += particle.speed;
      particle.x += Math.sin(elapsed * 0.48 + index * 0.42) * particle.drift;
      if (particle.y > 2.04) {
        particle.y = 0.9 + Math.random() * 0.12;
        particle.x = (Math.random() - 0.5) * 1.08;
      }
      steamPositionsArray[index * 3] = particle.x;
      steamPositionsArray[index * 3 + 1] = particle.y;
      steamPositionsArray[index * 3 + 2] = particle.z;
    });
    steamGeometry.attributes.position.needsUpdate = true;

    const emberPositionsArray = emberGeometry.attributes.position.array;
    emberData.forEach((particle, index) => {
      particle.y += particle.speed;
      particle.x += Math.sin(elapsed * (2.4 + index * 0.14)) * 0.0012;
      if (particle.y > 0.96) {
        particle.y = 0.48 + Math.random() * 0.08;
        particle.x = (Math.random() - 0.5) * 0.68;
      }
      emberPositionsArray[index * 3] = particle.x;
      emberPositionsArray[index * 3 + 1] = particle.y;
      emberPositionsArray[index * 3 + 2] = particle.z;
    });
    emberGeometry.attributes.position.needsUpdate = true;
    embers.visible = fireGroup.visible;

    const targetHostX = hostPlane.visible ? 2.82 : hostBasePosition.x;
    const targetHostY = hostPlane.visible ? 1.28 : hostBasePosition.y;
    hostPlane.position.y = targetHostY + Math.sin(elapsed * 2.4) * 0.028;
    hostPlane.position.x = targetHostX + Math.sin(elapsed * 1.7) * 0.018;
    hostPlane.rotation.z = hostPlane.visible ? Math.sin(elapsed * 2.8) * 0.03 : 0;
    hostPlane.rotation.y = hostPlane.visible ? Math.sin(elapsed * 2.1) * 0.08 : 0;
    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(render);
  };

  if (reducedMotion) {
    setNarrationLine(SCRIPT_SEGMENTS[0], SCRIPT_SEGMENTS[0]);
  }

  void tryPlayNarrationAudio();
  render();
}
