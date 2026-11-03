/**
 * API Service - Centraliza todas las llamadas a backend
 * Maneja autenticación, reintentos y errores
 */

const API_BASE = '/api';

class APIService {
  constructor() {
    this.baseUrl = API_BASE;
    this.maxRetries = 3;
    this.retryDelay = 500; // ms
  }

  /**
   * Realiza una petición HTTP con reintentos
   */
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (options.headers) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        ...options.headers,
      };
    }

    const parseJsonBody = async (response) => {
      const contentType = response.headers.get('content-type') || '';
      const hasBody = response.status !== 204 && response.status !== 205 && response.headers.get('content-length') !== '0';

      if (!hasBody) {
        return null;
      }

      const text = await response.text();
      if (!text) {
        return null;
      }

      if (contentType.includes('application/json')) {
        try {
          return JSON.parse(text);
        } catch (error) {
          return null;
        }
      }

      return text;
    };

    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, defaultOptions);
        const payload = await parseJsonBody(response);

        if (!response.ok) {
          let errorDetail = response.statusText;
          if (payload && typeof payload === 'object') {
            errorDetail = payload.error || payload.message || errorDetail;
          }
          const error = new Error(`HTTP ${response.status}: ${errorDetail}`);
          error.status = response.status;
          throw error;
        }

        return payload;
      } catch (error) {
        lastError = error;
        // Nunca repetir PINs, permisos, conflictos ni rate limits (HTTP 4xx).
        if (error.status >= 400 && error.status < 500) throw error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }
    throw lastError;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Auth: Validar PIN de caja
   */
  async validateCajaPin(pin) {
    return this.fetch('/auth/validate-pin', {
      method: 'POST',
      body: JSON.stringify({ pin, type: 'caja' }),
    });
  }

  /**
   * Auth: Verificar sesión activa de caja en el servidor
   */
  async validateCajaSession() {
    return this.fetch('/auth/session', {
      method: 'GET',
    });
  }

  /**
   * Movements: Crear nuevo movimiento de venta
   */
  async createMovement(movement) {
    const payload = { ...movement };
    const idempotencyKey = payload.operationId || payload.folio || `sale-${payload.id || Date.now()}`;
    payload.operationId = idempotencyKey;

    return this.fetch('/movements/create', {
      method: 'POST',
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Movements: Obtener movimientos del día
   */
  async getDailyMovements(date = null) {
    const queryDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return this.fetch(`/movements/daily?date=${queryDate}`);
  }

  /**
   * Movements: Obtener movimientos por turno
   */
  async getShiftMovements(shift, date = null) {
    const queryDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return this.fetch(`/movements/shift?shift=${shift}&date=${queryDate}`);
  }

  /**
   * Sales Summary: Obtener resumen de ventas del día
   */
  async getDailySalesSummary(date = null) {
    const queryDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return this.fetch(`/sales-summary/daily?date=${queryDate}`);
  }

  /**
   * Sales Summary: Obtener resumen por rango de fechas
   */
  async getSalesSummaryRange(startDate, endDate) {
    const start = new Date(startDate).toISOString().split('T')[0];
    const end = new Date(endDate).toISOString().split('T')[0];
    return this.fetch(`/sales-summary/range?start=${start}&end=${end}`);
  }

  /**
   * Sales Summary: Obtener KPIs actualizado
   */
  async getSalesKPI(date = null) {
    const queryDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return this.fetch(`/sales-summary/kpi?date=${queryDate}`);
  }
}

// Singleton
let apiServiceInstance = null;

export function getAPIService() {
  if (!apiServiceInstance) {
    apiServiceInstance = new APIService();
  }
  return apiServiceInstance;
}

export default APIService;
