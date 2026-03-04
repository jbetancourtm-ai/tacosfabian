const $ = (sel) => document.querySelector(sel);

function starsToText(n) {
  const full = "★★★★★";
  const empty = "☆☆☆☆☆";
  return full.slice(0, n) + empty.slice(0, 5 - n);
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-MX", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchAllReviews() {
  // Para este ejemplo, el endpoint público ya devuelve todo.
  const res = await fetch("/api/reviews", { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Error (${res.status})`);
  return res.json();
}

function renderTable(items) {
  const body = $("#adminTableBody");
  const summary = $("#adminSummary");
  if (!body || !summary) return;

  if (!Array.isArray(items) || items.length === 0) {
    body.innerHTML = `<tr><td colspan="4" class="muted">No hay reseñas.</td></tr>`;
    summary.textContent = "";
    return;
  }

  const sorted = [...items].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const avg = sorted.reduce((acc, r) => acc + (Number(r.stars) || 0), 0) / sorted.length;
  summary.textContent = `Total: ${sorted.length} · Promedio: ${avg.toFixed(1)} / 5`;

  body.innerHTML = sorted.map((r) => {
    const date = r.date ? formatDateTime(r.date) : "";
    const name = escapeHtml(r.name ?? "");
    const comment = escapeHtml(r.comment ?? "");
    const stars = Number(r.stars) || 0;

    return `
      <tr>
        <td>${date}</td>
        <td><strong>${name}</strong></td>
        <td><span class="stars" aria-label="${stars} de 5 estrellas">${starsToText(stars)}</span></td>
        <td>${comment}</td>
      </tr>
    `;
  }).join("");
}

async function load() {
  try {
    const data = await fetchAllReviews();
    renderTable(data?.items || []);
  } catch (e) {
    const body = $("#adminTableBody");
    if (body) body.innerHTML = `<tr><td colspan="4" class="muted">No se pudieron cargar las reseñas.</td></tr>`;
  }
}

$("#refreshAdmin")?.addEventListener("click", load);
load();