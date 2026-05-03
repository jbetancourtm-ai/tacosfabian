const adminAccessGate = document.querySelector("#adminAccessGate");
const adminAccessForm = document.querySelector("#adminAccessForm");
const adminAccessCode = document.querySelector("#adminAccessCode");
const adminAccessStatus = document.querySelector("#adminAccessStatus");
const adminResetSession = document.querySelector("#adminResetSession");
const adminDashboard = document.querySelector("#adminDashboard");
const adminStatus = document.querySelector("#adminStatus");
const adminTableBody = document.querySelector("#adminTableBody");
const salesTableBody = document.querySelector("#salesTableBody");
const salesTotalOrders = document.querySelector("#salesTotalOrders");
const salesRevenue = document.querySelector("#salesRevenue");
const salesActiveOrders = document.querySelector("#salesActiveOrders");
const salesCompletedOrders = document.querySelector("#salesCompletedOrders");
const salesCashCount = document.querySelector("#salesCashCount");
const salesCashTotal = document.querySelector("#salesCashTotal");
const salesTransferCount = document.querySelector("#salesTransferCount");
const salesTransferTotal = document.querySelector("#salesTransferTotal");
const adminClearSales = document.querySelector("#adminClearSales");

const SALES_STORAGE_KEY = "tacos_fabian_sales_records_v1";
const CAJA_MOVEMENTS_KEY = "caja_movements";
const SALES_SYNC_CHANNEL = "tacos-fabian-sales-sync";
const ADMIN_ACCESS_CODE_KEY = "tacos_fabian_admin_access_code_v1";
const ADMIN_SESSION_KEY = "tacos_fabian_admin_session_v1";

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

function formatMxCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function readSalesRecords() {
  try {
    const rawValue = window.localStorage.getItem(SALES_STORAGE_KEY) || window.localStorage.getItem(CAJA_MOVEMENTS_KEY);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeSalesRecords(records) {
  const serialized = JSON.stringify(records);
  window.localStorage.setItem(SALES_STORAGE_KEY, serialized);
  window.localStorage.setItem(CAJA_MOVEMENTS_KEY, serialized);
}

function getStoredAdminCode() {
  return window.localStorage.getItem(ADMIN_ACCESS_CODE_KEY) || "";
}

function isAdminSessionUnlocked() {
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "open";
}

function setDashboardVisibility(isVisible) {
  if (adminAccessGate instanceof HTMLElement) adminAccessGate.hidden = isVisible;
  if (adminDashboard instanceof HTMLElement) {
    adminDashboard.hidden = !isVisible;
    adminDashboard.setAttribute("aria-hidden", String(!isVisible));
  }
}

function renderReviewsTable(items) {
  if (!(adminTableBody instanceof HTMLElement)) return;

  if (!Array.isArray(items) || items.length === 0) {
    adminTableBody.innerHTML = "<tr><td colspan=\"4\">Sin registros</td></tr>";
    return;
  }

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

function renderSalesDashboard(records) {
  if (
    !(salesTableBody instanceof HTMLElement) ||
    !(salesTotalOrders instanceof HTMLElement) ||
    !(salesRevenue instanceof HTMLElement) ||
    !(salesActiveOrders instanceof HTMLElement) ||
    !(salesCompletedOrders instanceof HTMLElement)
  ) {
    return;
  }

  const totalOrders = records.length;
  const totalRevenue = records.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const activeOrders = records.filter((item) => item.status === "pendiente" || item.status === "enviado").length;
  const completedOrders = records.filter((item) => item.status === "completado").length;

  salesTotalOrders.textContent = String(totalOrders);
  salesRevenue.textContent = formatMxCurrency(totalRevenue);
  salesActiveOrders.textContent = String(activeOrders);
  salesCompletedOrders.textContent = String(completedOrders);

  if (!records.length) {
    salesTableBody.innerHTML = "<tr><td colspan=\"9\">Todavia no hay ventas registradas en este navegador.</td></tr>";
    adminStatus.textContent = "Sin ventas registradas por ahora.";
    return;
  }

  const paymentSummary = records.reduce((summary, registro) => {
    const method = String(registro.metodo_pago || 'Otro').toLowerCase();
    if (!summary[method]) {
      summary[method] = { count: 0, total: 0 };
    }
    summary[method].count += 1;
    summary[method].total += Number(registro.total) || 0;
    return summary;
  }, {});

  if (salesCashCount instanceof HTMLElement) {
    salesCashCount.textContent = String(paymentSummary.efectivo?.count || 0);
  }
  if (salesCashTotal instanceof HTMLElement) {
    salesCashTotal.textContent = formatMxCurrency(paymentSummary.efectivo?.total || 0);
  }
  if (salesTransferCount instanceof HTMLElement) {
    salesTransferCount.textContent = String(paymentSummary.transferencia?.count || 0);
  }
  if (salesTransferTotal instanceof HTMLElement) {
    salesTransferTotal.textContent = formatMxCurrency(paymentSummary.transferencia?.total || 0);
  }

  adminStatus.textContent = `${totalOrders} ventas registradas. ${activeOrders} activas y ${completedOrders} completadas.`;
  salesTableBody.innerHTML = records
    .map((item) => {
      const productSummary = item.resumen_productos || (Array.isArray(item.productos) && item.productos.length
        ? item.productos
            .map((product) => `${Number(product.cantidad) || 0}x ${escapeHtml(product.nombre || 'Producto')}`)
            .join('<br />')
        : 'Sin detalle');
      const internalId = escapeHtml(item.id || item.folio || 'Sin ID');
      const folio = escapeHtml(item.folio || item.id || 'Sin Folio');
      const total = formatMxCurrency(item.total);
      const createdAt = formatDateTime(item.fecha_hora || item.createdAt || item.updatedAt);
      const status = String(item.estado || item.status || 'pendiente');
      const method = escapeHtml(item.metodo_pago || 'N/A');
      const mesa = escapeHtml(item.mesa_origen || 'N/A');
      const recibido = item.recibido_con != null ? formatMxCurrency(item.recibido_con) : '-';
      const cambio = item.cambio != null ? formatMxCurrency(item.cambio) : '-';

      return `
        <tr>
          <td><strong>${folio}</strong></td>
          <td>${mesa}</td>
          <td>${method}</td>
          <td>${productSummary}</td>
          <td>${recibido}</td>
          <td>${cambio}</td>
          <td>${total}</td>
          <td>${createdAt}</td>
          <td>
            <label class="sr-only" for="status-${internalId}">Estado de la venta ${internalId}</label>
            <select id="status-${internalId}" class="admin-status-select" data-sales-order-id="${internalId}">
              <option value="pendiente" ${status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="enviado" ${status === 'enviado' ? 'selected' : ''}>Enviado</option>
              <option value="completado" ${status === 'completado' ? 'selected' : ''}>Completado</option>
            </select>
          </td>
        </tr>
      `;
    })
    .join('');
}

function syncSalesDashboard() {
  renderSalesDashboard(readSalesRecords());
}

function updateOrderStatus(orderId, status) {
  const nextRecords = readSalesRecords().map((item) => {
    if (item.id !== orderId && item.folio !== orderId) return item;

    return {
      ...item,
      estado: status,
      status,
      updatedAt: new Date().toISOString(),
    };
  });

  writeSalesRecords(nextRecords);
  syncSalesDashboard();
}

async function loadAdminReviews() {
  try {
    const response = await fetch("/api/reviews", {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const payload = await response.json();
    renderReviewsTable(payload.items || []);
  } catch {
    if (adminTableBody instanceof HTMLElement) {
      adminTableBody.innerHTML = "<tr><td colspan=\"4\">Error al cargar datos</td></tr>";
    }
  }
}

function unlockAdminPanel(message) {
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, "open");
  setDashboardVisibility(true);
  adminAccessStatus.textContent = message;
  syncSalesDashboard();
  loadAdminReviews();
}

if (adminAccessForm instanceof HTMLFormElement) {
  adminAccessForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const candidateCode = String(adminAccessCode?.value || "").trim();
    const savedCode = getStoredAdminCode();

    if (candidateCode.length < 4) {
      adminAccessStatus.textContent = "Usa una clave de al menos 4 caracteres.";
      adminAccessCode?.focus();
      return;
    }

    if (!savedCode) {
      window.localStorage.setItem(ADMIN_ACCESS_CODE_KEY, candidateCode);
      unlockAdminPanel("Clave creada y acceso concedido en este navegador.");
      adminAccessForm.reset();
      return;
    }

    if (candidateCode !== savedCode) {
      adminAccessStatus.textContent = "Clave incorrecta. Verifica e intenta de nuevo.";
      adminAccessCode?.focus();
      adminAccessCode?.select();
      return;
    }

    unlockAdminPanel("Acceso correcto. Panel actualizado en tiempo real.");
    adminAccessForm.reset();
  });
}

if (adminResetSession instanceof HTMLButtonElement) {
  adminResetSession.addEventListener("click", () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setDashboardVisibility(false);
    adminAccessStatus.textContent = "Acceso local cerrado.";
    adminAccessForm?.reset();
  });
}

if (adminClearSales instanceof HTMLButtonElement) {
  adminClearSales.addEventListener("click", () => {
    const shouldClear = window.confirm("Esto borrara el historial de ventas guardado en este navegador. Quieres continuar?");
    if (!shouldClear) return;

    writeSalesRecords([]);
    syncSalesDashboard();
  });
}

if (salesTableBody instanceof HTMLElement) {
  salesTableBody.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;

    const orderId = target.dataset.salesOrderId;
    if (!orderId) return;

    updateOrderStatus(orderId, target.value);
  });
}

window.addEventListener("storage", (event) => {
  if ((event.key === SALES_STORAGE_KEY || event.key === CAJA_MOVEMENTS_KEY) && isAdminSessionUnlocked()) {
    syncSalesDashboard();
  }
});

if ("BroadcastChannel" in window) {
  const channel = new BroadcastChannel(SALES_SYNC_CHANNEL);
  channel.addEventListener("message", (event) => {
    if (event.data?.type === "sales:update" && isAdminSessionUnlocked()) {
      syncSalesDashboard();
    }
  });
}

if (isAdminSessionUnlocked()) {
  unlockAdminPanel("Acceso recuperado en esta sesion.");
} else {
  setDashboardVisibility(false);
}

// ============================================================================
// Integración: Dashboard de Movimientos de Caja
// ============================================================================
// Importar módulo de caja dashboard
import CajaAdminDashboard from './modules/admin/caja-dashboard.js';

// Inicializar dashboard cuando el panel esté unlocked
const originalUnlockAdminPanel = unlockAdminPanel;
unlockAdminPanel = function(message) {
  originalUnlockAdminPanel(message);
  
  // Inicializar dashboard de caja
  setTimeout(() => {
    if (isAdminSessionUnlocked()) {
      const cajaDashboard = new CajaAdminDashboard();
      cajaDashboard.init().catch(error => {
        console.warn('Error inicializando dashboard de caja:', error);
      });
    }
  }, 500);
};

if (isAdminSessionUnlocked()) {
  setTimeout(() => {
    const cajaDashboard = new CajaAdminDashboard();
    cajaDashboard.init().catch(error => {
      console.warn('Error inicializando dashboard de caja:', error);
    });
  }, 500);
}

