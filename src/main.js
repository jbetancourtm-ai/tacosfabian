const menuBtn = document.querySelector("#menuBtn");
const navMenu = document.querySelector("#navMenu");
const reviewsStatus = document.querySelector("#reviewsStatus");
const reviewsList = document.querySelector("#reviewsList");
const reviewForm = document.querySelector("#reviewForm");
const formStatus = document.querySelector("#formStatus");
const commentInput = document.querySelector("#comment");
const commentCounter = document.querySelector("#commentCounter");
const toastRegion = document.querySelector("#toastRegion");

const menuCarousel = document.querySelector("#menuCarousel");
const menuTrack = document.querySelector("#menuTrack");
const menuPrev = document.querySelector("#menuPrev");
const menuNext = document.querySelector("#menuNext");
const menuDots = document.querySelector("#menuDots");

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
  menuBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navMenu.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      navMenu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
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
  return `${"\u2605".repeat(total)}${"\u2606".repeat(5 - total)}`;
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
    reviewsList.innerHTML = "";
    return;
  }

  reviewsStatus.textContent = `${items.length} resena(s) publicadas`;

  reviewsList.innerHTML = items
    .map((item) => {
      const name = escapeHtml(item.name || "Anonimo");
      const comment = escapeHtml(item.comment || "");
      const stars = Number(item.stars) || 0;
      const dateText = formatDate(item.date);

      return `
        <li class="review-item">
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

setupCommentCounter();
setupReviewsForm();
setupMenuCarousel();
loadReviews();
