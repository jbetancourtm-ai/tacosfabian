/**
 * Administrador de Tacos Fabian.
 * Autorización: identidad real y rol personalizado "admin" de Azure Static Web Apps.
 * Fuente de verdad de ventas: /api/movements/daily (Azure Table Storage).
 * No se guardan claves ni movimientos comerciales en el navegador.
 */
import { getAPIService } from './services/api-service.js';
import CajaAdminDashboard from './modules/admin/caja-dashboard.js';

const api = getAPIService();
const gate = document.querySelector('#adminAccessGate');
const gateStatus = document.querySelector('#adminAccessStatus');
const dashboard = document.querySelector('#adminDashboard');
const adminStatus = document.querySelector('#adminStatus');
const table = document.querySelector('#salesTableBody');
const reviewsTable = document.querySelector('#adminTableBody');
let ownerDashboard;
let adminAuthorized = false;

const $ = (selector) => document.querySelector(selector);
const mxn = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value) || 0);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function setAuthorized(authorized, message = '') {
  adminAuthorized = authorized;
  if (gate) gate.hidden = authorized;
  if (dashboard) {
    dashboard.hidden = !authorized;
    dashboard.setAttribute('aria-hidden', String(!authorized));
  }
  if (gateStatus) gateStatus.textContent = message;
}

async function verifyAdminIdentity() {
  const response = await fetch('/.auth/me', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo validar la sesión de Azure.');
  const payload = await response.json();
  const principal = payload?.clientPrincipal;
  return Boolean(principal?.userId && Array.isArray(principal.userRoles) && principal.userRoles.includes('admin'));
}

function normalizeSale(sale) {
  let products = sale.productos;
  if (typeof products === 'string') {
    try { products = JSON.parse(products); } catch { products = []; }
  }
  return { ...sale, productos: Array.isArray(products) ? products : [], total: Number(sale.total) || 0 };
}

function updateKpi(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function resetSalesDisplay(message) {
  for (const id of ['salesTotalOrders', 'salesRevenue', 'salesActiveOrders', 'salesCompletedOrders', 'salesCashCount', 'salesCashTotal', 'salesTransferCount', 'salesTransferTotal']) {
    updateKpi(id, '—');
  }
  if (table) table.innerHTML = `<tr><td colspan="9">${escapeHtml(message)}</td></tr>`;
  if (adminStatus) adminStatus.textContent = message;
}

function renderSales(sales, date) {
  const total = sales.reduce((n, s) => n + s.total, 0);
  const active = sales.filter((s) => ['registrado', 'pendiente', 'enviado'].includes(String(s.estado || '').toLowerCase())).length;
  const completed = sales.filter((s) => String(s.estado || '').toLowerCase() === 'completado').length;
  const byMethod = (method) => sales.filter((s) => String(s.metodo_pago || '').toLowerCase() === method);
  const cash = byMethod('efectivo');
  const transfers = byMethod('transferencia');
  updateKpi('salesTotalOrders', sales.length);
  updateKpi('salesRevenue', mxn(total));
  updateKpi('salesActiveOrders', active);
  updateKpi('salesCompletedOrders', completed);
  updateKpi('salesCashCount', cash.length);
  updateKpi('salesCashTotal', mxn(cash.reduce((n, s) => n + s.total, 0)));
  updateKpi('salesTransferCount', transfers.length);
  updateKpi('salesTransferTotal', mxn(transfers.reduce((n, s) => n + s.total, 0)));
  if (adminStatus) adminStatus.textContent = `Ventas del ${date}: ${sales.length} movimientos obtenidos del servidor.`;
  if (!table) return;
  table.innerHTML = sales.length ? sales.map((s) => {
    const summary = s.resumen_productos || s.producto_concepto ||
      s.productos.map((p) => `${p.cantidad || 0}x ${p.nombre || 'Producto'}`).join(', ');
    const stamp = new Date(s.fecha_hora);
    const when = Number.isNaN(stamp.getTime()) ? '—' : stamp.toLocaleString('es-MX');
    // Estado en modo consulta: cambiarlo en el navegador no actualiza Azure Table Storage.
    return `<tr>
      <td><strong>${escapeHtml(s.folio)}</strong></td>
      <td>${escapeHtml(s.mesa_origen)}</td>
      <td>${escapeHtml(s.metodo_pago)}</td>
      <td>${escapeHtml(summary)}</td>
      <td>${s.recibido_con == null ? '—' : mxn(s.recibido_con)}</td>
      <td>${s.cambio == null ? '—' : mxn(s.cambio)}</td>
      <td>${mxn(s.total)}</td>
      <td>${escapeHtml(when)}</td>
      <td>${escapeHtml(s.estado || 'registrado')}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="9">Sin ventas para la fecha de hoy.</td></tr>';
}

async function loadSales() {
  if (!adminAuthorized) return;
  const date = ownerDashboard?.filterDate || todayLocal();
  try {
    const result = await api.getDailyMovements(date);
    if (!result || !Array.isArray(result.movements)) throw new Error('Respuesta de ventas no válida.');
    renderSales(result.movements.map(normalizeSale), date);
  } catch (error) {
    resetSalesDisplay('No se pudieron consultar las ventas. No se muestran datos almacenados en el navegador.');
    console.warn('Consulta administrativa de ventas no disponible:', error.message);
  }
}

function starText(input) {
  const n = Math.max(0, Math.min(5, Number(input) || 0));
  return `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`;
}

async function loadReviews() {
  if (!adminAuthorized || !reviewsTable) return;
  try {
    const response = await fetch('/api/reviews', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Reseñas no disponibles');
    const payload = await response.json();
    const rows = Array.isArray(payload?.items) ? payload.items : [];
    reviewsTable.innerHTML = rows.length ? rows.map((r) => {
      const d = new Date(r.date);
      const when = Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('es-MX');
      return `<tr><td>${escapeHtml(when)}</td><td>${escapeHtml(r.name || 'Sin nombre')}</td><td>${escapeHtml(starText(r.stars))}</td><td>${escapeHtml(r.comment || '')}</td></tr>`;
    }).join('') : '<tr><td colspan="4">Sin reseñas registradas.</td></tr>';
  } catch {
    reviewsTable.innerHTML = '<tr><td colspan="4">No se pudieron consultar las reseñas.</td></tr>';
  }
}

async function initializeAdmin() {
  setAuthorized(false, 'Verificando sesión y rol admin...');
  try {
    const isAdmin = await verifyAdminIdentity();
    if (!isAdmin) {
      setAuthorized(false, 'Acceso denegado: tu cuenta no tiene el rol admin autorizado.');
      return;
    }
    setAuthorized(true);
    ownerDashboard = new CajaAdminDashboard();
    await Promise.all([loadSales(), loadReviews(), ownerDashboard.init()]);
    $('#cajaFilterDate')?.addEventListener('change', () => void loadSales());
    $('#adminRefreshSales')?.addEventListener('click', () => {
      void loadSales();
      void ownerDashboard?.loadMovements();
    });
    // Revalidar identidad al regresar a la pestaña antes de mostrar nuevas consultas.
    window.addEventListener('pageshow', async () => {
      try {
        if (!await verifyAdminIdentity()) {
          ownerDashboard?.destroy();
          resetSalesDisplay('La sesión administrativa ha terminado.');
          setAuthorized(false, 'Inicia sesión nuevamente con una cuenta autorizada.');
        }
      } catch {
        ownerDashboard?.destroy();
        setAuthorized(false, 'No se pudo verificar la sesión.');
      }
    });
  } catch (error) {
    setAuthorized(false, 'No se pudo verificar la identidad de Azure Static Web Apps.');
    console.warn('Validación administrativa no disponible:', error.message);
  }
}

void initializeAdmin();
