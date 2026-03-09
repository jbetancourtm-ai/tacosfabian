import * as THREE from "three";
import { gsap } from "gsap";

const SCRIPT_SEGMENTS = [
  "Hola, bienvenido a Taqueria Fabian en Texcoco.",
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
  const texture = textureLoader.load("/brand/mascot-fabian.svg");
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 2.75), material);
  mesh.position.set(2.55, 1.55, 0.55);
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

function buildSpeechQueue() {
  let active = true;
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  if (!synth) {
    return {
      speak() {},
      stop() {
        active = false;
      },
    };
  }

  const pickVoice = () => {
    const voices = synth.getVoices();
    return (
      voices.find((voice) => voice.lang?.toLowerCase().startsWith("es-mx")) ||
      voices.find((voice) => voice.lang?.toLowerCase().startsWith("es")) ||
      null
    );
  };

  let voice = pickVoice();
  if (!voice) {
    window.setTimeout(() => {
      voice = pickVoice();
    }, 120);
  }

  return {
    speak(text) {
      if (!active || !text) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang || "es-MX";
      utterance.voice = voice;
      utterance.rate = 1.05;
      utterance.pitch = 1;
      utterance.volume = 1;
      try {
        synth.speak(utterance);
      } catch {
        // Ignore browser autoplay or synth errors; subtitles remain visible.
      }
    },
    stop() {
      active = false;
      synth.cancel();
    },
  };
}

export async function initIntroExperience({
  introScreen,
  introSkipBtn,
  introCountdown,
}) {
  const canvas = introScreen.querySelector("#introCanvas");
  const narration = introScreen.querySelector("#introNarration");
  const hostCard = introScreen.querySelector("#introHostCard");
  const hostLine = introScreen.querySelector("#introHostLine");
  const hostMural = introScreen.querySelector("#introHostMural");
  const introSoundBtn = introScreen.querySelector("#introSoundBtn");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoDismissMs = reducedMotion ? 500 : 15000;
  const speechQueue = buildSpeechQueue();
  const narrationAudio = new Audio("/audio/intro-narration-es-mx.mp3");
  const ambientAudio = new Audio("/audio/taqueria-ambient-night.wav");
  narrationAudio.preload = "auto";
  narrationAudio.playsInline = true;
  ambientAudio.preload = "auto";
  ambientAudio.playsInline = true;
  ambientAudio.loop = true;
  ambientAudio.volume = 0.18;
  let useSpeechFallback = true;

  if (!(canvas instanceof HTMLCanvasElement) || !(narration instanceof HTMLElement)) {
    document.body.classList.remove("intro-active");
    return;
  }

  let closed = false;
  let autoDismissTimer = 0;
  let countdownInterval = 0;
  let rafId = 0;
  let speakingTimer = 0;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#090a0d", 0.1);

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.set(0, 2.1, 10.4);
  camera.lookAt(0, 1.4, 0);

  const ambientLight = new THREE.AmbientLight("#815031", 0.42);
  scene.add(ambientLight);

  const rimLight = new THREE.PointLight("#ffab54", 3.5, 20, 2);
  rimLight.position.set(0, 5.2, 4.8);
  scene.add(rimLight);

  const signLight = new THREE.PointLight("#ff7a1a", 4.4, 18, 2);
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
  taqueria.scale.setScalar(0.72);
  scene.add(taqueria);

  const textureLoader = new THREE.TextureLoader();
  const hostPlane = createHostPlane(textureLoader);
  scene.add(hostPlane);

  const curtainLeft = createCurtain(-1);
  const curtainRight = createCurtain(1);
  scene.add(curtainLeft, curtainRight);

  const fireTexture = createFireTexture();
  const { group: fireGroup, emberLight, flames } = createFireGroup(fireTexture);
  fireGroup.position.y = -0.02;
  fireGroup.visible = false;
  scene.add(fireGroup);

  const smokeTexture = createSmokeTexture();
  const smokeMaterial = new THREE.PointsMaterial({
    map: smokeTexture,
    transparent: true,
    opacity: 0.18,
    size: 1.3,
    depthWrite: false,
    color: "#ffd7b1",
    blending: THREE.AdditiveBlending,
  });
  const smokeGeometry = new THREE.BufferGeometry();
  const smokeCount = 42;
  const smokePositions = new Float32Array(smokeCount * 3);
  const smokeData = Array.from({ length: smokeCount }, () => ({
    x: (Math.random() - 0.5) * 2.2,
    y: 1 + Math.random() * 1.3,
    z: 1.35 + Math.random() * 0.8,
    speed: 0.004 + Math.random() * 0.009,
  }));

  smokeData.forEach((particle, index) => {
    smokePositions[index * 3] = particle.x;
    smokePositions[index * 3 + 1] = particle.y;
    smokePositions[index * 3 + 2] = particle.z;
  });
  smokeGeometry.setAttribute("position", new THREE.BufferAttribute(smokePositions, 3));
  const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
  scene.add(smoke);

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = 120;
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

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  };
  window.addEventListener("resize", resize);

  const tryPlayNarrationAudio = async () => {
    if (reducedMotion) return false;
    try {
      ambientAudio.currentTime = 0;
      narrationAudio.currentTime = 0;
      await ambientAudio.play();
      narrationAudio.currentTime = 0;
      await narrationAudio.play();
      useSpeechFallback = false;
      introSoundBtn?.classList.add("is-hidden");
      return true;
    } catch {
      ambientAudio.pause();
      ambientAudio.currentTime = 0;
      useSpeechFallback = true;
      introSoundBtn?.classList.remove("is-hidden");
      return false;
    }
  };

  const pulseSpeaking = (duration = 2200) => {
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
    if (useSpeechFallback) speechQueue.speak(narratorText);
  };

  const finishIntro = () => {
    if (closed) return;
    closed = true;

    if (speakingTimer) window.clearTimeout(speakingTimer);
    hostCard?.classList.remove("is-speaking");
    hostMural?.classList.remove("is-visible");
    ambientAudio.pause();
    ambientAudio.currentTime = 0;
    narrationAudio.pause();
    narrationAudio.currentTime = 0;
    speechQueue.stop();
    if (autoDismissTimer) window.clearTimeout(autoDismissTimer);
    if (countdownInterval) window.clearInterval(countdownInterval);

    introScreen.classList.add("is-hidden");
    introScreen.setAttribute("aria-hidden", "true");
    document.body.classList.remove("intro-active");
    document.body.classList.add("intro-complete");

    timeline.kill();
    window.cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    renderer.dispose();
    smokeGeometry.dispose();
    smokeMaterial.dispose();
    particlesGeometry.dispose();

    window.setTimeout(() => {
      introScreen.remove();
      if (introSkipBtn instanceof HTMLElement) introSkipBtn.blur();
    }, reducedMotion ? 40 : 720);
  };

  introSkipBtn?.addEventListener("click", finishIntro);
  introSoundBtn?.addEventListener("click", async () => {
    const started = await tryPlayNarrationAudio();
    if (started) {
      pulseSpeaking(2600);
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finishIntro();
  });

  if (introCountdown) {
    const startedAt = Date.now();
    const updateCountdown = () => {
      const remainingMs = Math.max(0, autoDismissMs - (Date.now() - startedAt));
      const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      introCountdown.textContent =
        remainingMs > 0
          ? `Entrando al menu en ${remainingSeconds} segundo${remainingSeconds === 1 ? "" : "s"}`
          : "Abriendo Taqueria Fabian...";
    };
    updateCountdown();
    countdownInterval = window.setInterval(updateCountdown, 1000);
  }

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete: finishIntro,
  });

  timeline
    .to([spotLeft, spotRight], { intensity: 2.8, duration: 1.15 }, 0)
    .to(signLight, { intensity: 5.9, duration: 1.35 }, 0.2)
    .to(titlePlane.material, { opacity: 0.5, duration: 1.25 }, 0.3)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[0]), null, 0.35)
    .to(camera.position, { z: 8.35, y: 2.3, duration: 3.1 }, 0.95)
    .to(taqueria.scale, { x: 0.98, y: 0.98, z: 0.98, duration: 3.1 }, 0.95)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[1]), null, 3.4)
    .call(() => {
      fireGroup.visible = true;
      grillLight.intensity = 1.2;
    }, null, 4.2)
    .to(curtainLeft.position, { x: -4.4, duration: 1.35 }, 5.6)
    .to(curtainRight.position, { x: 4.4, duration: 1.35 }, 5.6)
    .to(doorPivotLeft.rotation, { y: -1.04, duration: 1.05 }, 5.9)
    .to(doorPivotRight.rotation, { y: 1.04, duration: 1.05 }, 5.9)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[2]), null, 6.25)
    .call(() => {
      hostPlane.visible = true;
      hostCard?.classList.add("is-visible");
      hostMural?.classList.add("is-visible");
    }, null, 8.05)
    .fromTo(hostPlane.position, { y: 0.8 }, { y: 1.55, duration: 1.15, ease: "back.out(1.3)" }, 8.05)
    .call(() => setNarrationLine(SCRIPT_SEGMENTS[3]), null, 10.55)
    .to(camera.position, { z: 7.72, y: 2.14, duration: 1.45 }, 12.25)
    .to([spotLeft, spotRight], { intensity: 1.7, duration: 1.2 }, 12.7)
    .to(signLight, { intensity: 3.9, duration: 1.2 }, 12.7)
    .to(titlePlane.material, { opacity: 0.28, duration: 1.05 }, 13.1);

  const clock = new THREE.Clock();
  const render = () => {
    if (closed) return;
    const elapsed = clock.getElapsedTime();

    spotLeft.position.x = -6.5 + Math.sin(elapsed * 0.7) * 2.1;
    spotLeft.position.z = 8 + Math.cos(elapsed * 0.45) * 1.2;
    spotRight.position.x = 6.5 + Math.cos(elapsed * 0.62) * 2.1;
    spotRight.position.z = 8 + Math.sin(elapsed * 0.4) * 1.2;
    spotLeft.target.position.x = Math.sin(elapsed * 0.32) * 1.2;
    spotRight.target.position.x = Math.cos(elapsed * 0.28) * 1.2;
    grillLight.intensity = fireGroup.visible ? 1 + Math.sin(elapsed * 11) * 0.14 + Math.cos(elapsed * 6) * 0.08 : 0.08;
    emberLight.intensity = fireGroup.visible ? 1.3 + Math.sin(elapsed * 13) * 0.22 : 0.2;

    titlePlane.lookAt(camera.position);
    particles.rotation.y += 0.0009;
    particles.position.y = Math.sin(elapsed * 0.3) * 0.08;
    smoke.rotation.y += 0.002;
    flames.forEach((flame, index) => {
      flame.scale.y = 0.9 + Math.sin(elapsed * (8 + index * 2)) * 0.08;
      flame.position.x += Math.sin(elapsed * (3.5 + index)) * 0.0008;
      flame.material.opacity = 0.22 + Math.abs(Math.sin(elapsed * (7 + index))) * 0.12;
      flame.lookAt(camera.position);
    });

    const positions = smokeGeometry.attributes.position.array;
    smokeData.forEach((particle, index) => {
      particle.y += particle.speed * 0.82;
      particle.x += Math.sin(elapsed * 0.8 + index) * 0.0012;
      if (particle.y > 3.05) {
        particle.y = 1 + Math.random() * 0.28;
        particle.x = (Math.random() - 0.5) * 1.55;
      }
      positions[index * 3] = particle.x;
      positions[index * 3 + 1] = particle.y;
      positions[index * 3 + 2] = particle.z;
    });
    smokeGeometry.attributes.position.needsUpdate = true;

    hostPlane.position.y = hostPlane.visible ? 1.55 + Math.sin(elapsed * 2.1) * 0.05 : 0.8;
    hostPlane.rotation.z = hostPlane.visible ? Math.sin(elapsed * 2.4) * 0.035 : 0;
    hostPlane.rotation.y = hostPlane.visible ? Math.sin(elapsed * 1.9) * 0.07 : 0;
    renderer.render(scene, camera);
    rafId = window.requestAnimationFrame(render);
  };

  if (reducedMotion) {
    setNarrationLine(SCRIPT_SEGMENTS[0], SCRIPT_SEGMENTS[0]);
  }

  void tryPlayNarrationAudio();
  autoDismissTimer = window.setTimeout(finishIntro, autoDismissMs);
  render();
}
