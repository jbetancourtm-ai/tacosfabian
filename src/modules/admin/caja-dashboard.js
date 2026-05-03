/**
 * Dashboard POS para movimientos de caja.
 * Se monta sobre admin.html sin cambiar rutas ni el flujo de caja.
 */

import { getAPIService } from '../../services/api-service.js';

const MOVEMENTS_KEY = 'caja_movements';

class CajaAdminDashboard {
  constructor() {
    this.apiService = getAPIService();
    this.refreshInterval = 5000;
    this.movements = [];
    this.filterDate = new Date().toISOString().split('T')[0];
    this.autoRefreshTimer = null;
  }

  async init() {
    this.setupDOM();
    if (!this.elements) return;
    this.attachEventListeners();
    this.startAutoRefresh();
    await this.loadMovements();
  }

  setupDOM() {
    const adminPanel = document.querySelector('.admin-panel-grid');
    if (!adminPanel || document.getElementById('cajaDashboardSection')) return;

    this.injectStyles();

    const container = document.createElement('section');
    container.id = 'cajaDashboardSection';
    container.className = 'card admin-panel-card pos-owner-dashboard';
    container.innerHTML = `
      <div class="admin-panel-card__head pos-dashboard-head">
        <div>
          <p class="section-kicker">Dashboard del dueño</p>
          <h2>Reporte diario</h2>
          <p class="muted">Consulta ventas por día, productos, horarios y mesas sin borrar histórico.</p>
        </div>
        <div class="pos-report-tools">
          <input type="date" id="cajaFilterDate" aria-label="Filtrar reporte por fecha" />
          <button id="cajaRefreshBtn" class="btn btn-secondary" type="button">Actualizar</button>
          <button id="cajaPrintReportBtn" class="btn btn-secondary" type="button">Imprimir</button>
          <button id="cajaExportCsvBtn" class="btn btn-secondary" type="button">CSV</button>
        </div>
      </div>

      <div class="pos-kpi-grid" id="ownerKpiGrid"></div>

      <div class="pos-report-grid">
        <section class="pos-report-card">
          <div class="pos-report-card__head">
            <h3>Productos más vendidos</h3>
          </div>
          <div id="topProductsList" class="pos-list"></div>
        </section>

        <section class="pos-report-card">
          <div class="pos-report-card__head">
            <h3>Ventas por hora</h3>
          </div>
          <div id="salesByHourList" class="pos-list"></div>
        </section>

        <section class="pos-report-card">
          <div class="pos-report-card__head">
            <h3>Mesas y mostrador</h3>
          </div>
          <div id="salesByMesaList" class="pos-list"></div>
        </section>
      </div>

      <div class="table-wrap" role="region" aria-label="Ventas recientes de caja" tabindex="0">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Hora</th>
              <th>Mesa</th>
              <th>Productos</th>
              <th>Método</th>
              <th>Total</th>
              <th>Cambio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="cajaMovementsTable"></tbody>
        </table>
      </div>

      <section id="saleDetailPanel" class="pos-sale-detail" hidden></section>
      <section id="adminDailyPrintArea" class="admin-daily-print" aria-hidden="true"></section>
    `;

    adminPanel.parentNode.insertBefore(container, adminPanel);

    this.elements = {
      filterDate: document.getElementById('cajaFilterDate'),
      refreshBtn: document.getElementById('cajaRefreshBtn'),
      printBtn: document.getElementById('cajaPrintReportBtn'),
      csvBtn: document.getElementById('cajaExportCsvBtn'),
      ownerKpiGrid: document.getElementById('ownerKpiGrid'),
      topProductsList: document.getElementById('topProductsList'),
      salesByHourList: document.getElementById('salesByHourList'),
      salesByMesaList: document.getElementById('salesByMesaList'),
      movementsTable: document.getElementById('cajaMovementsTable'),
      saleDetailPanel: document.getElementById('saleDetailPanel'),
      printArea: document.getElementById('adminDailyPrintArea'),
    };
    this.elements.filterDate.value = this.filterDate;
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .pos-owner-dashboard { grid-column: 1 / -1; }
      .pos-dashboard-head { align-items: flex-start; gap: 1rem; }
      .pos-report-tools { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: flex-end; }
      .pos-report-tools input { min-height: 42px; border: 1px solid #e5e7eb; border-radius: 8px; padding: .55rem .7rem; font: inherit; }
      .pos-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .85rem; margin: 1rem 0; }
      .pos-kpi-card, .pos-report-card, .pos-sale-detail { border: 1px solid #e7e2d9; border-radius: 12px; background: #fff; padding: 1rem; box-shadow: 0 10px 24px rgba(23, 23, 23, .05); }
      .pos-kpi-card span { display: block; color: #6b7280; font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
      .pos-kpi-card strong { display: block; margin-top: .35rem; color: #171717; font-size: 1.35rem; line-height: 1.1; }
      .pos-kpi-card small { display: block; margin-top: .3rem; color: #6b7280; }
      .pos-report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: .85rem; margin-bottom: 1rem; }
      .pos-report-card__head h3 { margin: 0 0 .65rem; font-size: 1rem; }
      .pos-list { display: grid; gap: .45rem; }
      .pos-list-row { display: flex; justify-content: space-between; gap: .75rem; padding: .55rem 0; border-bottom: 1px solid #f0ebe4; color: #171717; font-size: .9rem; }
      .pos-list-row:last-child { border-bottom: 0; }
      .pos-list-row strong { white-space: nowrap; }
      .pos-table-action { border: 0; background: transparent; color: #9E2A2B; font: inherit; font-weight: 800; cursor: pointer; padding: 0; }
      .pos-sale-detail { margin: 1rem 0; }
      .pos-sale-detail h3 { margin-top: 0; }
      .admin-daily-print { display: none; }
      @media (max-width: 760px) {
        .pos-report-tools { justify-content: stretch; }
        .pos-report-tools > * { flex: 1 1 140px; }
      }
      @media print {
        body * { visibility: hidden !important; }
        .admin-daily-print, .admin-daily-print * { visibility: visible !important; }
        .admin-daily-print { display: block !important; position: fixed; inset: 0; color: #000; background: #fff; font-family: Arial, sans-serif; padding: 12mm; }
        .admin-daily-print table { width: 100%; border-collapse: collapse; }
        .admin-daily-print th, .admin-daily-print td { border-bottom: 1px solid #ddd; padding: 6px; text-align: left; }
      }
    `;
    document.head.appendChild(style);
  }

  attachEventListeners() {
    this.elements.filterDate?.addEventListener('change', (event) => {
      this.filterDate = event.target.value;
      this.loadMovements();
    });
    this.elements.refreshBtn?.addEventListener('click', () => this.loadMovements());
    this.elements.printBtn?.addEventListener('click', () => this.printDailyReport());
    this.elements.csvBtn?.addEventListener('click', () => this.exportCsv());
    this.elements.movementsTable?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-folio]');
      if (button) this.renderSaleDetail(button.dataset.folio);
    });
  }

  startAutoRefresh() {
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
    this.autoRefreshTimer = setInterval(() => this.loadMovements(), this.refreshInterval);
  }

  async loadMovements() {
    const dateToLoad = this.filterDate || new Date().toISOString().split('T')[0];
    try {
      const result = await this.apiService.getDailyMovements(dateToLoad);
      this.movements = this.normalizeMovements(result.movements || []);
      if (!this.movements.length) {
        this.movements = this.loadMovementsFromLocalStorage(dateToLoad);
      }
    } catch (error) {
      console.warn('API no disponible, usando localStorage:', error);
      this.movements = this.loadMovementsFromLocalStorage(dateToLoad);
    }
    this.renderDashboard();
  }

  loadMovementsFromLocalStorage(date) {
    const all = JSON.parse(localStorage.getItem(MOVEMENTS_KEY) || '[]');
    return this.normalizeMovements(all).filter((movement) => movement.operationDate === date && movement.estado !== 'cancelado');
  }

  normalizeMovements(items) {
    return items.map((movement) => {
      const date = new Date(movement.fecha_hora || movement.timestamp || Date.now());
      return {
        ...movement,
        operationDate: date.toISOString().split('T')[0],
        total: Number(movement.total) || 0,
        cambio: Number(movement.cambio) || 0,
        recibido_con: movement.recibido_con == null ? null : Number(movement.recibido_con),
        cantidad_total: Number(movement.cantidad_total || movement.cantidad || 0),
      };
    });
  }

  getSummary() {
    const total = this.movements.reduce((sum, movement) => sum + movement.total, 0);
    const efectivo = this.sumByMethod('efectivo');
    const transferencia = this.sumByMethod('transferencia');
    const topProduct = this.getProducts()[0];
    const lastSale = this.movements.slice().sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))[0];
    return {
      total,
      count: this.movements.length,
      efectivo,
      transferencia,
      average: this.movements.length ? total / this.movements.length : 0,
      topProduct,
      lastSale,
    };
  }

  renderDashboard() {
    const summary = this.getSummary();
    this.elements.ownerKpiGrid.innerHTML = [
      ['Ventas del día', this.formatCurrency(summary.total), this.filterDate],
      ['Tickets', summary.count, 'ventas registradas'],
      ['Efectivo', this.formatCurrency(summary.efectivo), 'método efectivo'],
      ['Transferencia', this.formatCurrency(summary.transferencia), 'método transferencia'],
      ['Ticket promedio', this.formatCurrency(summary.average), 'promedio del día'],
      ['Producto más vendido', summary.topProduct?.name || '-', summary.topProduct ? `${summary.topProduct.quantity} pzas` : 'sin ventas'],
      ['Última venta', summary.lastSale?.folio || '-', summary.lastSale ? this.formatCurrency(summary.lastSale.total) : 'sin ventas'],
    ].map(([label, value, hint]) => `
      <article class="pos-kpi-card">
        <span>${this.escapeHtml(label)}</span>
        <strong>${this.escapeHtml(String(value))}</strong>
        <small>${this.escapeHtml(String(hint))}</small>
      </article>
    `).join('');

    this.renderList(this.elements.topProductsList, this.getProducts().slice(0, 8), (item) => [item.name, `${item.quantity} pzas · ${this.formatCurrency(item.total)}`]);
    this.renderList(this.elements.salesByHourList, this.groupByHour(), (item) => [`${item.hour}:00`, `${item.count} tickets · ${this.formatCurrency(item.total)}`]);
    this.renderList(this.elements.salesByMesaList, this.groupByMesa(), (item) => [item.name, `${item.count} tickets · ${this.formatCurrency(item.total)}`]);
    this.renderMovementsTable();
  }

  renderList(container, items, mapper) {
    container.innerHTML = items.length
      ? items.map((item) => {
        const [label, value] = mapper(item);
        return `<div class="pos-list-row"><span>${this.escapeHtml(label)}</span><strong>${this.escapeHtml(value)}</strong></div>`;
      }).join('')
      : '<div class="pos-list-row"><span>Sin datos</span><strong>-</strong></div>';
  }

  renderMovementsTable() {
    if (!this.movements.length) {
      this.elements.movementsTable.innerHTML = '<tr><td colspan="8">Sin ventas para la fecha seleccionada.</td></tr>';
      return;
    }
    this.elements.movementsTable.innerHTML = this.movements
      .slice()
      .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
      .map((movement) => {
        const date = new Date(movement.fecha_hora);
        return `
          <tr>
            <td><button type="button" class="pos-table-action" data-folio="${this.escapeHtml(movement.folio || '')}">${this.escapeHtml(movement.folio || '-')}</button></td>
            <td>${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${this.escapeHtml(movement.mesa_origen || '-')}</td>
            <td>${this.escapeHtml(movement.resumen_productos || movement.producto_concepto || '-')}</td>
            <td>${this.capitalizeText(movement.metodo_pago || '-')}</td>
            <td>${this.formatCurrency(movement.total)}</td>
            <td>${this.formatCurrency(movement.cambio || 0)}</td>
            <td>${this.escapeHtml(movement.estado || 'registrado')}</td>
          </tr>
        `;
      }).join('');
  }

  renderSaleDetail(folio) {
    const sale = this.movements.find((movement) => movement.folio === folio);
    if (!sale) return;
    const products = Array.isArray(sale.productos) ? sale.productos : [];
    this.elements.saleDetailPanel.hidden = false;
    this.elements.saleDetailPanel.innerHTML = `
      <h3>Detalle ${this.escapeHtml(sale.folio || '-')}</h3>
      <p class="muted">${this.escapeHtml(sale.mesa_origen || '-')} · ${this.capitalizeText(sale.metodo_pago || '-')} · ${this.formatCurrency(sale.total)}</p>
      <div class="pos-list">
        ${products.map((product) => `<div class="pos-list-row"><span>${this.escapeHtml(product.nombre)} x${Number(product.cantidad || 0)}</span><strong>${this.formatCurrency(product.subtotal)}</strong></div>`).join('') || '<div class="pos-list-row"><span>Sin productos</span><strong>-</strong></div>'}
      </div>
    `;
  }

  printDailyReport() {
    const summary = this.getSummary();
    this.elements.printArea.innerHTML = `
      <h1>Tacos Fabian</h1>
      <h2>Reporte diario ${this.escapeHtml(this.filterDate)}</h2>
      <p>Total vendido: <strong>${this.formatCurrency(summary.total)}</strong></p>
      <p>Ventas: ${summary.count} · Efectivo: ${this.formatCurrency(summary.efectivo)} · Transferencia: ${this.formatCurrency(summary.transferencia)} · Ticket promedio: ${this.formatCurrency(summary.average)}</p>
      <table>
        <thead><tr><th>Folio</th><th>Hora</th><th>Mesa</th><th>Productos</th><th>Método</th><th>Total</th></tr></thead>
        <tbody>
          ${this.movements.map((movement) => `<tr><td>${this.escapeHtml(movement.folio || '-')}</td><td>${new Date(movement.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td><td>${this.escapeHtml(movement.mesa_origen || '-')}</td><td>${this.escapeHtml(movement.resumen_productos || movement.producto_concepto || '-')}</td><td>${this.capitalizeText(movement.metodo_pago || '-')}</td><td>${this.formatCurrency(movement.total)}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
    window.print();
  }

  exportCsv() {
    const header = ['folio', 'fecha_hora', 'mesa', 'productos', 'metodo_pago', 'recibido_con', 'cambio', 'total', 'estado'];
    const rows = this.movements.map((movement) => [
      movement.folio || '',
      movement.fecha_hora || '',
      movement.mesa_origen || '',
      movement.resumen_productos || movement.producto_concepto || '',
      movement.metodo_pago || '',
      movement.recibido_con ?? '',
      movement.cambio ?? '',
      movement.total ?? '',
      movement.estado || '',
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-diario-${this.filterDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  getProducts() {
    const grouped = {};
    this.movements.forEach((movement) => {
      (Array.isArray(movement.productos) ? movement.productos : []).forEach((product) => {
        const name = product.nombre || 'Producto';
        if (!grouped[name]) grouped[name] = { name, quantity: 0, total: 0 };
        grouped[name].quantity += Number(product.cantidad) || 0;
        grouped[name].total += Number(product.subtotal) || 0;
      });
    });
    return Object.values(grouped).sort((a, b) => b.quantity - a.quantity);
  }

  groupByHour() {
    const grouped = {};
    this.movements.forEach((movement) => {
      const hour = new Date(movement.fecha_hora).getHours().toString().padStart(2, '0');
      if (!grouped[hour]) grouped[hour] = { hour, count: 0, total: 0 };
      grouped[hour].count += 1;
      grouped[hour].total += movement.total;
    });
    return Object.values(grouped).sort((a, b) => a.hour.localeCompare(b.hour));
  }

  groupByMesa() {
    const grouped = {};
    this.movements.forEach((movement) => {
      const name = movement.mesa_origen || 'Sin mesa';
      if (!grouped[name]) grouped[name] = { name, count: 0, total: 0 };
      grouped[name].count += 1;
      grouped[name].total += movement.total;
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }

  sumByMethod(method) {
    return this.movements
      .filter((movement) => movement.metodo_pago === method)
      .reduce((sum, movement) => sum + movement.total, 0);
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(value || 0);
  }

  capitalizeText(text) {
    return String(text).charAt(0).toUpperCase() + String(text).slice(1);
  }

  escapeHtml(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value).replace(/[&<>"']/g, (char) => map[char]);
  }

  destroy() {
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
  }
}

export default CajaAdminDashboard;
