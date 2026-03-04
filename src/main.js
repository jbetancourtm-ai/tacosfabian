const menuBtn = document.querySelector("#menuBtn");
const menu = document.querySelector("#menu");
const reviewsStatus = document.querySelector("#reviewsStatus");
const reviewsList = document.querySelector("#reviewsList");
const reviewForm = document.querySelector("#reviewForm");
const formStatus = document.querySelector("#formStatus");

if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
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
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
  }).format(date);
}

function paintReviews(items) {
  if (!Array.isArray(items) || items.length === 0) {
    reviewsStatus.textContent = "Aún no hay reseñas.";
    reviewsList.innerHTML = "";
    return;
  }

  reviewsStatus.textContent = `${items.length} reseña(s) publicadas`;
  reviewsList.innerHTML = items
    .map((item) => {
      const name = escapeHtml(item.name || "Anónimo");
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
  reviewsStatus.textContent = "Cargando reseñas...";
  try {
    const response = await fetch("/api/reviews", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const payload = await response.json();
    paintReviews(payload.items || []);
  } catch (error) {
    reviewsStatus.textContent = "No fue posible cargar reseñas. Intenta más tarde.";
  }
}

if (reviewForm) {
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
      await loadReviews();
    } catch (error) {
      formStatus.textContent = error.message;
    }
  });
}

loadReviews();

