const $ = (sel) => document.querySelector(sel);

function setYear() {
  const y = new Date().getFullYear();
  const el = $("#year");
  if (el) el.textContent = String(y);
}

function setupMobileNav() {
  const btn = $("#navToggle");
  const menu = $("#navMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  menu.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.tagName === "A") {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

function starsToText(n) {
  const full = "★★★★★";
  const empty = "☆☆☆☆☆";
  return full.slice(0, n) + empty.slice(0, 5 - n);
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}

function renderReviews(list) {
  const ul = $("#reviewsList");
  const summary = $("#reviewsSummary");
  if (!ul || !summary) return;

  if (!Array.isArray(list) || list.length === 0) {
    ul.innerHTML = `<li class="muted">Aún no hay reseñas. ¡Sé el primero en dejar una!</li>`;
    summary.textContent = "";
    return;
  }

  // Mostrar las más recientes primero
  const sorted = [...list].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const top = sorted.slice(0, 6);

  const avg = sorted.reduce((acc, r) => acc + (Number(r.stars) || 0), 0) / sorted.length;
  summary.textContent = `Total: ${sorted.length} · Promedio: ${avg.toFixed(1)} / 5`;

  ul.innerHTML = top
    .map((r) => {
      const name = escapeHtml(r.name ?? "");
      const comment = escapeHtml(r.comment ?? "");
      const stars = Number(r.stars) || 0;
      const date = r.date ? formatDate(r.date) : "";
      return `
        <li class="review">
          <div class="review__head">
            <div>
              <div class="review__name">${name}</div>
              <div class="stars" aria-label="${stars} de 5 estrellas">${starsToText(stars)}</div>
            </div>
            <div class="review__date">${date}</div>
          </div>
          <p class="review__comment">${comment}</p>
        </li>
      `;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchReviews() {
  const res = await fetch("/api/reviews", { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Error al cargar reseñas (${res.status})`);
  return res.json();
}

async function postReview(payload) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || `No se pudo enviar (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function setupReviews() {
  const refreshBtn = $("#refreshReviews");
  const form = $("#reviewForm");
  const msg = $("#formMsg");

  async function load() {
    try {
      const data = await fetchReviews();
      renderReviews(data?.items || []);
    } catch (e) {
      const ul = $("#reviewsList");
      if (ul) ul.innerHTML = `<li class="muted">No se pudieron cargar las reseñas. Intenta más tarde.</li>`;
    }
  }

  refreshBtn?.addEventListener("click", load);

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!msg) return;

    msg.textContent = "Enviando...";
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      stars: Number(fd.get("stars") || 0),
      comment: String(fd.get("comment") || "").trim()
    };

    try {
      await postReview(payload);
      form.reset();
      msg.textContent = "¡Gracias! Tu reseña se guardó correctamente.";
      await load();
    } catch (err) {
      msg.textContent = err?.message || "Ocurrió un error al enviar la reseña.";
    }
  });

  load();
}

setYear();
setupMobileNav();
setupReviews();