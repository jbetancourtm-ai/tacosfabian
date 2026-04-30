/**
 * Aplicación Principal de Caja
 * Maneja formulario, validación, cálculos y persistencia
 */

import { getAPIService } from '../../services/api-service.js';

// Estado de la aplicación
const state = {
  authenticated: false,
  currentShift: null,
  movements: [],
  dailyTotal: 0,
  shiftTotal: 0,
};

// ============================================================================
// PIN & Autenticación
// ============================================================================
function hashPin(pin) {
  // Simple hash para PIN (en producción usar comparación server-side)
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Conversión a entero de 32bit
  }
  return hash.toString();
}

// Cache PIN (válido durante la sesión)
const SESSION_PIN_KEY = 'tacos_fabian_caja_session_pin';
const PIN_HASH = hashPin('1980'); // PIN: 1980

// ============================================================================
// DOM Elements
// ============================================================================
const accessGate = document.getElementById('cajaAccessGate');
const accessForm = document.getElementById('cajaAccessForm');
const pinInput = document.getElementById('cajaPinInput');
const accessStatus = document.getElementById('cajaAccessStatus');

const cajaForm = document.getElementById('cajaForm');
const shiftSelect = document.getElementById('cajaShift');
const productInput = document.getElementById('cajaProduct');
const quantityInput = document.getElementById('cajaQuantity');
const unitPriceInput = document.getElementById('cajaUnitPrice');
const totalDisplay = document.getElementById('cajaTotal');
const paymentMethodSelect = document.getElementById('cajaPaymentMethod');
const observationsInput = document.getElementById('cajaObservations');

const todayTotalDisplay = document.getElementById('cajaTodayTotal');
const todayCountDisplay = document.getElementById('cajaTodayCount');
const shiftTotalDisplay = document.getElementById('cajaShiftTotal');
const shiftCountDisplay = document.getElementById('cajaShiftCount');
const recentItemsContainer = document.getElementById('cajaRecentItems');

const currentTimeDisplay = document.getElementById('cajaCurrentTime');
const currentDateDisplay = document.getElementById('cajaCurrentDate');

// ============================================================================
// Inicialización
// ============================================================================
function init() {
  // Verificar si hay sesión válida
  const sessionPin = sessionStorage.getItem(SESSION_PIN_KEY);
  if (sessionPin === PIN_HASH) {
    authenticateUser();
  } else {
    showAccessGate();
  }

  // Actualizar reloj
  updateClock();
  setInterval(updateClock, 1000);

  // Event listeners
  setupEventListeners();

  // Auto-refresh de datos cada 5 segundos
  refreshMovements();
  setInterval(refreshMovements, 5000);
}

function showAccessGate() {
  accessGate.removeAttribute('hidden');
}

function hideAccessGate() {
  accessGate.setAttribute('hidden', '');
}

function authenticateUser() {
  state.authenticated = true;
  hideAccessGate();
  cajaForm.focus();
}

// ============================================================================
// Event Listeners
// ============================================================================
function setupEventListeners() {
  // Acceso a caja - Validación de PIN
  if (accessForm) {
    accessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = pinInput.value.trim();
      const pinHash = hashPin(pin);

      if (pinHash === PIN_HASH) {
        sessionStorage.setItem(SESSION_PIN_KEY, PIN_HASH);
        pinInput.value = '';
        accessStatus.style.display = 'none';
        authenticateUser();
      } else {
        accessStatus.textContent = 'PIN incorrecto. Intenta de nuevo.';
        accessStatus.style.display = 'block';
        pinInput.value = '';
        pinInput.focus();
      }
    });
  }

  // Cálculo automático de total
  [quantityInput, unitPriceInput].forEach((input) => {
    input.addEventListener('change', calculateTotal);
    input.addEventListener('input', calculateTotal);
  });

  // Actualizar turno cuando cambia
  shiftSelect.addEventListener('change', (e) => {
    state.currentShift = e.target.value;
    refreshMovements();
  });

  // Envío del formulario
  cajaForm.addEventListener('submit', handleFormSubmit);
}

function calculateTotal() {
  const quantity = parseFloat(quantityInput.value) || 0;
  const unitPrice = parseFloat(unitPriceInput.value) || 0;
  const total = quantity * unitPrice;

  totalDisplay.textContent = formatMxCurrency(total);
  totalDisplay.dataset.value = total;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!state.authenticated) {
    showNotification('Debes autenticarte primero', 'error');
    return;
  }

  const movement = {
    fecha_hora: new Date().toISOString(),
    turno: shiftSelect.value,
    producto_concepto: productInput.value,
    cantidad: parseInt(quantityInput.value),
    precio_unitario: parseFloat(unitPriceInput.value),
    total: parseFloat(totalDisplay.dataset.value || 0),
    metodo_pago: paymentMethodSelect.value,
    observaciones: observationsInput.value,
    usuario_cajera: 'Cajera',
    estado: 'activo',
  };

  // Validación básica
  if (!movement.turno || !movement.producto_concepto || movement.cantidad <= 0 || movement.precio_unitario <= 0) {
    showNotification('Completa todos los campos requeridos', 'error');
    return;
  }

  try {
    // Guardar movimiento
    const submitBtn = cajaForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    // Intentar guardar en backend (opcional), luego en localStorage
    try {
      const api = getAPIService();
      await api.createMovement(movement);
    } catch (error) {
      console.warn('Backend no disponible, guardando localmente:', error);
    }

    // Guardar localmente
    saveMovementLocally(movement);

    // Feedback visual
    showNotification('✓ Movimiento guardado correctamente', 'success');

    // Reset formulario
    cajaForm.reset();
    totalDisplay.textContent = '$0.00';
    totalDisplay.dataset.value = 0;

    // Refresh datos
    refreshMovements();

    // Reset estado del botón
    submitBtn.disabled = false;
    submitBtn.textContent = 'Guardar Movimiento';
  } catch (error) {
    console.error('Error al guardar movimiento:', error);
    showNotification('Error al guardar. Intenta de nuevo.', 'error');
  }
}

// ============================================================================
// Persistencia Local
// ============================================================================
function saveMovementLocally(movement) {
  let movements = JSON.parse(localStorage.getItem('caja_movements') || '[]');
  movements.push({
    id: Date.now().toString(),
    ...movement,
  });
  localStorage.setItem('caja_movements', JSON.stringify(movements));
}

function loadMovementsLocally() {
  return JSON.parse(localStorage.getItem('caja_movements') || '[]');
}

function getMovementsByShift(shift, date = null) {
  const allMovements = loadMovementsLocally();
  const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  return allMovements.filter((m) => {
    const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
    return m.turno === shift && mDate === targetDate && m.estado === 'activo';
  });
}

function getDailyMovements(date = null) {
  const allMovements = loadMovementsLocally();
  const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  return allMovements.filter((m) => {
    const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
    return mDate === targetDate && m.estado === 'activo';
  });
}

// ============================================================================
// UI Updates
// ============================================================================
function refreshMovements() {
  const dailyMovements = getDailyMovements();
  const shiftMovements = state.currentShift ? getMovementsByShift(state.currentShift) : [];

  // Calcular totales
  state.dailyTotal = dailyMovements.reduce((sum, m) => sum + (m.total || 0), 0);
  state.shiftTotal = shiftMovements.reduce((sum, m) => sum + (m.total || 0), 0);

  // Actualizar displays
  todayTotalDisplay.textContent = formatMxCurrency(state.dailyTotal);
  todayCountDisplay.textContent = `${dailyMovements.length} movimiento${dailyMovements.length !== 1 ? 's' : ''}`;

  shiftTotalDisplay.textContent = formatMxCurrency(state.shiftTotal);
  shiftCountDisplay.textContent = `${shiftMovements.length} movimiento${shiftMovements.length !== 1 ? 's' : ''}`;

  // Actualizar recientes
  updateRecentItems(dailyMovements.slice(-5).reverse());
}

function updateRecentItems(movements) {
  recentItemsContainer.innerHTML = '';

  if (movements.length === 0) {
    recentItemsContainer.innerHTML = '<div class="empty-list">Sin movimientos aún</div>';
    return;
  }

  movements.forEach((movement) => {
    const item = document.createElement('div');
    item.className = 'recent-item';
    item.innerHTML = `
      <div class="recent-product">
        <strong>${movement.producto_concepto.substring(0, 20)}</strong>
        <div style="font-size: 0.8rem; color: #9ca3af;">x${movement.cantidad} @ $${movement.precio_unitario.toFixed(2)}</div>
      </div>
      <div class="recent-price">${formatMxCurrency(movement.total)}</div>
    `;
    recentItemsContainer.appendChild(item);
  });
}

// ============================================================================
// Utilidades
// ============================================================================
function formatMxCurrency(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function updateClock() {
  const now = new Date();
  const time = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  const date = new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  currentTimeDisplay.textContent = time;
  currentDateDisplay.textContent = date;
}

function showNotification(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `feedback-toast ${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================================
// Arrancar aplicación
// ============================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
