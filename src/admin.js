const adminStatus = document.querySelector("#adminStatus");
const adminTableBody = document.querySelector("#adminTableBody");

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function starsLabel(stars) {
  const total = Math.max(1, Math.min(5, Number(stars) || 0));
  return `${"\u2605".repeat(total)}${"\u2606".repeat(5 - total)}`;
}

function formatDateTime(dateValue) {
  if (!dateValue) return "Sin fecha";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function renderTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    adminStatus.textContent = "No hay resenas guardadas.";
    adminTableBody.innerHTML = "<tr><td colspan=\"4\">Sin registros</td></tr>";
    return;
  }

  adminStatus.textContent = `Total de resenas: ${items.length}`;
  adminTableBody.innerHTML = items
    .map((item) => {
      const date = formatDateTime(item.date);
      const name = escapeHtml(item.name || "Sin nombre");
      const comment = escapeHtml(item.comment || "");
      const stars = Number(item.stars) || 0;

      return `
        <tr>
          <td>${date}</td>
          <td>${name}</td>
          <td class="stars" aria-label="${stars} de 5 estrellas">${starsLabel(stars)}</td>
          <td>${comment}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadAdminReviews() {
  adminStatus.textContent = "Cargando resenas...";

  try {
    const response = await fetch("/api/reviews", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const payload = await response.json();
    renderTable(payload.items || []);
  } catch {
    adminStatus.textContent = "No se pudieron cargar las resenas.";
    adminTableBody.innerHTML = "<tr><td colspan=\"4\">Error al cargar datos</td></tr>";
  }
}

loadAdminReviews();
