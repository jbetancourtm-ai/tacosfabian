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
const reviewsList = document.querySelector("#reviewsList");
const reviewForm = document.querySelector("#reviewForm");
const formStatus = document.querySelector("#formStatus");
const commentInput = document.querySelector("#comment");
const commentCounter = document.querySelector("#commentCounter");
const toastRegion = document.querySelector("#toastRegion");
const floatingWhatsapp = document.querySelector("#floatingWhatsapp");
const footer = document.querySelector(".site-footer");
const visitCounter = document.querySelector("#visitCounter");
const heroMenuDestacadoBtn = document.querySelector("#heroMenuDestacadoBtn");
const introScreen = document.querySelector("#intro-screen");
const introSkipBtn = document.querySelector("#introSkipBtn");

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

function setupFloatingWhatsapp() {
  if (!floatingWhatsapp) return;
  floatingWhatsapp.classList.remove("is-hidden");
}

function setupIntroScreen() {
  if (!introScreen) {
    document.body.classList.remove("intro-active");
    return;
  }

  import("./intro-experience.js")
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

function paintReviews(items) {
  if (!Array.isArray(items) || items.length === 0) {
    reviewsStatus.textContent = "Aun no hay resenas. Se la primera persona en opinar.";
    if (reviewsAverage) reviewsAverage.textContent = "Promedio: --/5";
    if (reviewsAverageBadge) reviewsAverageBadge.textContent = "\u2605 -- promedio";
    if (reviewsSatisfied) reviewsSatisfied.textContent = "+0 clientes satisfechos";
    if (heroProofAvg) heroProofAvg.textContent = "\u2605 4.8 calificacion promedio";
    if (heroProofCount) heroProofCount.textContent = "+120 clientes satisfechos";
    reviewsList.innerHTML = "";
    return;
  }

  const avg = items.reduce((sum, item) => sum + (Number(item.stars) || 0), 0) / items.length;
  const satisfied = Math.max(items.length * 24, 120);
  reviewsStatus.textContent = `${items.length} resena(s) publicadas`;
  if (reviewsAverage) reviewsAverage.textContent = `Promedio: ${avg.toFixed(1)}/5`;
  if (reviewsAverageBadge) reviewsAverageBadge.textContent = `\u2605 ${avg.toFixed(1)} promedio`;
  if (reviewsSatisfied) reviewsSatisfied.textContent = `+${satisfied} clientes satisfechos`;
  if (heroProofAvg) heroProofAvg.textContent = `\u2605 ${avg.toFixed(1)} calificacion promedio`;
  if (heroProofCount) heroProofCount.textContent = `+${satisfied} clientes satisfechos`;

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
  reviewsStatus.textContent = "Cargando resenas...";
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
    reviewsStatus.textContent = "No fue posible cargar resenas. Intenta mas tarde.";
    showToast("No pudimos cargar resenas por el momento.", "error");
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
    formStatus.textContent = "Enviando resena...";

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
        throw new Error(payload.error || "No se pudo guardar la resena.");
      }

      reviewForm.reset();
      formStatus.textContent = "Resena enviada. Gracias por compartir tu opinion.";
      setupCommentCounter();
      showToast("Resena enviada con exito.", "ok");
      await loadReviews();
    } catch (error) {
      formStatus.textContent = error.message;
      showToast(error.message || "No se pudo enviar la resena.", "error");
    }
  });
}

function setupMenuCarousel() {
  if (!menuCarousel || !menuTrack || !menuPrev || !menuNext || !menuDots) return;

  const slides = Array.from(menuTrack.children);
  if (slides.length === 0) return;

  let currentIndex = 0;

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

  menuPrev.addEventListener("click", prevSlide);
  menuNext.addEventListener("click", nextSlide);

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
    }
    pointerStartX = 0;
    pointerEndX = 0;
  });

  menuCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    }
  });

  renderDots();
  updateSlide();
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

setupCommentCounter();
setupReviewsForm();
setupMenuCarousel();
setupMenuSpotlightModal();
setupRevealAnimations();
setupHeaderEffects();
setupIntroScreen();
setupFloatingWhatsapp();
setupVisitCounter();
setupMenuDestacadoButton();
loadReviews();

