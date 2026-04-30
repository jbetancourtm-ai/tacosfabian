/**
 * Módulo: Admin Dashboard para Movimientos de Caja
 * Se integra con admin.html y proporciona:
 * - Auto-refresh cada 5-10 segundos
 * - Filtros por fecha
 * - Resumen de ingresos por método de pago
 * - Tabla de movimientos
 */

import { getAPIService } from '../../services/api-service.js';

class CajaAdminDashboard {
  constructor() {
    this.apiService = getAPIService();
    this.refreshInterval = 5000; // 5 segundos
    this.currentDate = new Date();
    this.movements = [];
    this.filterDate = null;
    this.autoRefreshTimer = null;
  }

  /**
   * Inicializar dashboard
   */
  async init() {
    this.setupDOM();
    this.attachEventListeners();
    this.startAutoRefresh();
    await this.loadMovements();
  }

  /**
   * Configurar elementos del DOM
   */
  setupDOM() {
    // Crear contenedor para sección de movimientos si no existe
    const adminPanel = document.querySelector('.admin-panel-grid');
    if (!adminPanel) return;

    const container = document.createElement('section');
    container.id = 'cajaDashboardSection';
    container.className = 'card admin-panel-card';
    container.innerHTML = `
      <div class="admin-panel-card__head">
        <div>
          <p class="section-kicker">Movimientos de Caja</p>
          <h2>Registro de ventas</h2>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <input
            type="date"
            id="cajaFilterDate"
            aria-label="Filtrar por fecha"
            style="padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 0.9rem;"
          />
          <button id="cajaRefreshBtn" class="btn btn-secondary" type="button">
            🔄 Actualizar
          </button>
        </div>
      </div>

      <div id="cajaMovementsSummary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #f9fafb; padding: 1rem; border-radius: 6px;">
          <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.5rem;">Total Movimientos</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #1f2937;" id="cajaMovementCount">0</div>
        </div>
        <div style="background: #f9fafb; padding: 1rem; border-radius: 6px;">
          <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.5rem;">Total Ingresos</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #059669;" id="cajaMovementTotal">$0.00</div>
        </div>
        <div style="background: #f9fafb; padding: 1rem; border-radius: 6px;">
          <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.5rem;">Ticket Promedio</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;" id="cajaAverageTicket">$0.00</div>
        </div>
      </div>

      <div id="cajaPaymentSummary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <!-- Se llena dinámicamente -->
      </div>

      <div class="table-wrap" role="region" aria-label="Tabla de movimientos de caja" tabindex="0">
        <table>
          <thead>
            <tr>
              <th style="min-width: 100px;">Folio</th>
              <th style="min-width: 120px;">Mesa</th>
              <th style="min-width: 100px;">Fecha/Hora</th>
              <th style="min-width: 120px;">Turno</th>
              <th style="min-width: 150px;">Resumen</th>
              <th style="text-align: center; min-width: 60px;">Cant.</th>
              <th style="text-align: right; min-width: 100px;">Total</th>
              <th style="min-width: 100px;">Método</th>
              <th style="min-width: 100px;">Cambio</th>
            </tr>
          </thead>
          <tbody id="cajaMovementsTable">
            <tr>
              <td colspan="6" style="text-align: center; padding: 2rem; color: #9ca3af;">Cargando movimientos...</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Inserta antes de la última sección o al final
    adminPanel.parentNode.insertBefore(container, adminPanel.nextSibling);

    this.elements = {
      filterDate: document.getElementById('cajaFilterDate'),
      refreshBtn: document.getElementById('cajaRefreshBtn'),
      movementCount: document.getElementById('cajaMovementCount'),
      movementTotal: document.getElementById('cajaMovementTotal'),
      averageTicket: document.getElementById('cajaAverageTicket'),
      paymentSummary: document.getElementById('cajaPaymentSummary'),
      movementsTable: document.getElementById('cajaMovementsTable'),
    };

    // Establecer fecha actual en el input
    const today = new Date().toISOString().split('T')[0];
    this.elements.filterDate.value = today;
  }

  /**
   * Adjuntar event listeners
   */
  attachEventListeners() {
    if (this.elements.filterDate) {
      this.elements.filterDate.addEventListener('change', (e) => {
        this.filterDate = e.target.value;
        this.loadMovements();
      });
    }

    if (this.elements.refreshBtn) {
      this.elements.refreshBtn.addEventListener('click', () => {
        this.loadMovements();
      });
    }
  }

  /**
   * Iniciar auto-refresh
   */
  startAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    this.autoRefreshTimer = setInterval(() => {
      this.loadMovements();
    }, this.refreshInterval);
  }

  /**
   * Detener auto-refresh
   */
  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  /**
   * Cargar movimientos
   */
  async loadMovements() {
    try {
      const dateToLoad = this.filterDate || new Date().toISOString().split('T')[0];

      // Intentar desde la API
      try {
        const result = await this.apiService.getDailyMovements(dateToLoad);
        this.movements = result.movements || [];
      } catch (error) {
        console.warn('API no disponible, cargando desde localStorage:', error);
        this.movements = this.loadMovementsFromLocalStorage(dateToLoad);
      }

      this.renderDashboard();
    } catch (error) {
      console.error('Error cargando movimientos:', error);
      this.showError('Error al cargar movimientos');
    }
  }

  /**
   * Cargar movimientos del localStorage
   */
  loadMovementsFromLocalStorage(date) {
    const all = JSON.parse(localStorage.getItem('caja_movements') || '[]');
    return all.filter((m) => {
      const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
      return mDate === date && m.estado === 'activo';
    });
  }

  /**
   * Renderizar dashboard
   */
  renderDashboard() {
    const totalMovements = this.movements.length;
    const totalIncome = this.movements.reduce((sum, m) => sum + (parseFloat(m.total) || 0), 0);
    const averageTicket = totalMovements > 0 ? totalIncome / totalMovements : 0;

    // Actualizar resumen
    this.elements.movementCount.textContent = totalMovements;
    this.elements.movementTotal.textContent = this.formatCurrency(totalIncome);
    this.elements.averageTicket.textContent = this.formatCurrency(averageTicket);

    // Actualizar resumen por método de pago
    this.renderPaymentSummary();

    // Actualizar tabla
    this.renderMovementsTable();
  }

  /**
   * Renderizar resumen por método de pago
   */
  renderPaymentSummary() {
    const summary = {};

    this.movements.forEach((m) => {
      const method = m.metodo_pago || 'Otro';
      if (!summary[method]) {
        summary[method] = { count: 0, total: 0 };
      }
      summary[method].count++;
      summary[method].total += parseFloat(m.total) || 0;
    });

    const container = this.elements.paymentSummary;
    container.innerHTML = '';

    Object.entries(summary).forEach(([method, data]) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: #f9fafb;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #ff6a00;
      `;
      card.innerHTML = `
        <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.25rem;">
          ${this.capitalizeText(method)}
        </div>
        <div style="font-size: 1.1rem; font-weight: 700; color: #1f2937;">
          ${this.formatCurrency(data.total)}
        </div>
        <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 0.25rem;">
          ${data.count} mov.
        </div>
      `;
      container.appendChild(card);
    });
  }

  /**
   * Renderizar tabla de movimientos
   */
  renderMovementsTable() {
    const tbody = this.elements.movementsTable;

    if (this.movements.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: #9ca3af;">
            Sin movimientos registrados
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.movements
      .slice()
      .reverse()
      .map((m) => {
        const dateTime = new Date(m.fecha_hora).toLocaleString('es-MX', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        return `
          <tr>
            <td><strong>${this.escapeHtml(m.folio || '—')}</strong></td>
            <td>${this.escapeHtml(m.mesa_origen || '-')}</td>
            <td>${dateTime}</td>
            <td>${this.capitalizeText(m.turno || '-')}</td>
            <td>${this.escapeHtml(m.resumen_productos || m.producto_concepto || '-')}</td>
            <td style="text-align: center;">${m.cantidad}</td>
            <td style="text-align: right; font-weight: 600; color: #059669;">
              ${this.formatCurrency(m.total)}
            </td>
            <td>${this.capitalizeText(m.metodo_pago || '-')}</td>
            <td>${this.formatCurrency(m.cambio || 0)}</td>
          </tr>
        `;
      })
      .join('');
  }

  /**
   * Mostrar error
   */
  showError(message) {
    const tbody = this.elements.movementsTable;
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #ef4444;">
          ${message}
        </td>
      </tr>
    `;
  }

  // ========================================
  // Utilidades
  // ========================================
  formatCurrency(value) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  capitalizeText(text) {
    return String(text)
      .charAt(0)
      .toUpperCase() + String(text).slice(1);
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Destructor
   */
  destroy() {
    this.stopAutoRefresh();
  }
}

// Exportar
export default CajaAdminDashboard;
