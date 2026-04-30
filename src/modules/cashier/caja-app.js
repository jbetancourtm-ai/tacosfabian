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
  ticketItems: {},
};

const products = [
  { id: 'taco-pastor', nombre: 'Taco de pastor', categoria: 'Tacos', precio: 16 },
  { id: 'taco-suadero', nombre: 'Taco de suadero', categoria: 'Tacos', precio: 16 },
  { id: 'taco-longaniza', nombre: 'Taco de longaniza', categoria: 'Tacos', precio: 16 },
  { id: 'taco-campechano', nombre: 'Taco campechano', categoria: 'Tacos', precio: 18 },
  { id: 'taco-cochinita', nombre: 'Taco de cochinita pibil', categoria: 'Tacos', precio: 16 },
  { id: 'tostada-pastor', nombre: 'Tostada de pastor', categoria: 'Tostadas', precio: 17 },
  { id: 'tostada-suadero', nombre: 'Tostada de suadero', categoria: 'Tostadas', precio: 17 },
  { id: 'tostada-longaniza', nombre: 'Tostada de longaniza', categoria: 'Tostadas', precio: 17 },
  { id: 'tostada-campechano', nombre: 'Tostada campechano', categoria: 'Tostadas', precio: 18 },
  { id: 'tostada-cochinita', nombre: 'Tostada de cochinita pibil', categoria: 'Tostadas', precio: 17 },
  { id: 'torta-pastor', nombre: 'Torta de pastor', categoria: 'Tortas', precio: 68 },
  { id: 'torta-suadero', nombre: 'Torta de suadero', categoria: 'Tortas', precio: 68 },
  { id: 'torta-longaniza', nombre: 'Torta de longaniza', categoria: 'Tortas', precio: 68 },
  { id: 'torta-campechano', nombre: 'Torta campechano', categoria: 'Tortas', precio: 75 },
  { id: 'torta-cochinita', nombre: 'Torta de cochinita pibil', categoria: 'Tortas', precio: 68 },
  { id: 'kilo-suadero', nombre: 'Suadero 1kg', categoria: 'Por kilo', precio: 500 },
  { id: 'kilo-pastor', nombre: 'Pastor 1kg', categoria: 'Por kilo', precio: 460 },
  { id: 'kilo-cochinita', nombre: 'Cochinita pibil 1kg', categoria: 'Por kilo', precio: 460 },
  { id: 'kilo-campechano', nombre: 'Campechano 1kg', categoria: 'Por kilo', precio: 0, pendingPrice: true },
  { id: 'kilo-longaniza', nombre: 'Longaniza 1kg', categoria: 'Por kilo', precio: 0, pendingPrice: true },
  { id: 'refresco', nombre: 'Refresco', categoria: 'Bebidas', precio: 30 },
  { id: 'agua', nombre: 'Agua', categoria: 'Bebidas', precio: 30 },
  { id: 'propina', nombre: 'Propina', categoria: 'Otros', precio: 1 },
  { id: 'otro', nombre: 'Otro concepto manual', categoria: 'Otros', precio: 0, isCustom: true, descripcion: '', customPrice: 0 },
];

const filterState = {
  category: 'Todos',
  query: '',
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
const paymentMethodSelect = document.getElementById('cajaPaymentMethod');
const observationsInput = document.getElementById('cajaObservations');
const searchInput = document.getElementById('cajaSearch');
const categoryFilters = document.getElementById('cajaCategoryFilters');
const productsContainer = document.getElementById('cajaProductsGrid');
const ticketItemsContainer = document.getElementById('cajaTicketItems');
const ticketTotalDisplay = document.getElementById('cajaTicketTotal');
const ticketCountDisplay = document.getElementById('cajaTicketCount');
const ticketMethodDisplay = document.getElementById('cajaTicketMethod');
const clearTicketButton = document.getElementById('cajaClearTicket');

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
  renderProductCatalog();
  updateTicketSummary();

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

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterState.query = e.target.value.toLowerCase();
      renderProductCatalog();
    });
  }

  if (categoryFilters) {
    categoryFilters.addEventListener('click', (event) => {
      const button = event.target.closest('[data-category]');
      if (!button) {
        return;
      }
      filterState.category = button.dataset.category;
      categoryFilters.querySelectorAll('[data-category]').forEach((btn) => {
        btn.classList.toggle('active', btn === button);
      });
      renderProductCatalog();
    });
  }

  if (productsContainer) {
    productsContainer.addEventListener('click', handleProductCardClick);
    productsContainer.addEventListener('input', handleProductCardInput);
  }

  if (clearTicketButton) {
    clearTicketButton.addEventListener('click', clearTicket);
  }

  shiftSelect.addEventListener('change', (e) => {
    state.currentShift = e.target.value;
    refreshMovements();
  });

  cajaForm.addEventListener('submit', handleFormSubmit);
}

function handleProductCardClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const productCard = button.closest('.product-card');
  const productId = productCard?.dataset.productId;
  const delta = button.dataset.action === 'increment' ? 1 : -1;

  changeTicketItemQuantity(productId, delta);
}

function handleProductCardInput(event) {
  const input = event.target;
  const productCard = input.closest('.product-card');
  if (!productCard || productCard.dataset.productId !== 'otro') {
    return;
  }

  const product = products.find((item) => item.id === 'otro');
  if (!product) {
    return;
  }

  if (input.id === 'otroDescription') {
    product.descripcion = input.value;
  }

  if (input.id === 'otroPrice') {
    product.customPrice = parseFloat(input.value) || 0;
  }

  updateTicketSummary();
}

function changeTicketItemQuantity(productId, delta) {
  if (!productId) {
    return;
  }

  const currentQuantity = state.ticketItems[productId] || 0;
  const nextQuantity = Math.max(0, currentQuantity + delta);

  if (nextQuantity === 0) {
    delete state.ticketItems[productId];
  } else {
    state.ticketItems[productId] = nextQuantity;
  }

  renderProductCatalog();
  updateTicketSummary();
}

function getTicketItems() {
  return products
    .filter((product) => state.ticketItems[product.id] > 0)
    .map((product) => {
      const quantity = state.ticketItems[product.id] || 0;
      const unitPrice = product.isCustom ? (product.customPrice || 0) : product.precio;
      const nombre = product.isCustom ? (product.descripcion?.trim() || 'Otro') : product.nombre;
      return {
        ...product,
        nombre,
        cantidad: quantity,
        precio_unitario: unitPrice,
        subtotal: unitPrice * quantity,
      };
    });
}

function updateTicketSummary() {
  if (!ticketItemsContainer || !ticketTotalDisplay || !ticketCountDisplay || !ticketMethodDisplay) {
    return;
  }

  const items = getTicketItems();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.cantidad, 0);
  const paymentMethodLabel = paymentMethodSelect.value
    ? paymentMethodSelect.options[paymentMethodSelect.selectedIndex].text
    : 'No seleccionado';

  if (items.length === 0) {
    ticketItemsContainer.innerHTML = '<div class="empty-list">No hay productos en el ticket.</div>';
  } else {
    ticketItemsContainer.innerHTML = items
      .map(
        (item) => `
          <div class="ticket-item">
            <div class="ticket-item-name">
              <strong>${item.cantidad}x ${item.nombre}</strong>
              <span>${formatMxCurrency(item.precio_unitario)} c/u</span>
            </div>
            <div>${formatMxCurrency(item.subtotal)}</div>
          </div>
        `
      )
      .join('');
  }

  ticketTotalDisplay.textContent = formatMxCurrency(total);
  ticketCountDisplay.textContent = `${totalUnits} producto${totalUnits !== 1 ? 's' : ''} seleccionados`;
  ticketMethodDisplay.textContent = paymentMethodLabel;
}

function clearTicket() {
  state.ticketItems = {};
  const otherProduct = products.find((item) => item.id === 'otro');
  if (otherProduct) {
    otherProduct.descripcion = '';
    otherProduct.customPrice = 0;
  }

  renderProductCatalog();
  updateTicketSummary();
}

function renderProductCatalog() {
  if (!productsContainer) {
    return;
  }

  const filteredProducts = products.filter((product) => {
    const categoryMatch = filterState.category === 'Todos' || product.categoria === filterState.category;
    const query = filterState.query.trim();
    const searchMatch = !query || product.nombre.toLowerCase().includes(query) || product.categoria.toLowerCase().includes(query);
    return categoryMatch && searchMatch;
  });

  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = '<div class="empty-list">No hay productos que coincidan con la búsqueda.</div>';
    return;
  }

  productsContainer.innerHTML = filteredProducts
    .map((product) => {
      const quantity = state.ticketItems[product.id] || 0;
      const unitPrice = product.isCustom ? product.customPrice : product.precio;
      const priceLabel = product.isCustom
        ? product.customPrice > 0
          ? formatMxCurrency(product.customPrice)
          : 'Precio a capturar'
        : product.precio > 0
          ? formatMxCurrency(product.precio)
          : 'Pendiente de precio';
      const priceClass = product.precio <= 0 && !product.isCustom ? 'pending' : '';
      const customDescription = product.isCustom ? (product.descripcion || '') : '';

      return `
        <article class="product-card" data-product-id="${product.id}">
          <span class="product-tag">${product.categoria}</span>
          <div class="product-name">${product.nombre}</div>
          <div class="product-price ${priceClass}">${priceLabel}</div>
          ${product.isCustom ? `
            <div class="custom-fields">
              <label for="otroDescription">Descripción</label>
              <input id="otroDescription" type="text" placeholder="Descripción del producto" value="${customDescription.replace(/"/g, '&quot;')}" />
              <label for="otroPrice">Precio unitario</label>
              <input id="otroPrice" type="number" min="0" step="0.50" placeholder="0.00" value="${product.customPrice > 0 ? product.customPrice : ''}" />
            </div>
          ` : ''}
          <div class="product-controls">
            <button type="button" class="qty-btn" data-action="decrement" ${quantity === 0 ? 'disabled' : ''}>-</button>
            <span class="product-quantity">${quantity}</span>
            <button type="button" class="qty-btn" data-action="increment">+</button>
          </div>
          <div class="product-subtotal">${quantity > 0 ? formatMxCurrency(unitPrice * quantity) : '&nbsp;'}</div>
        </article>
      `;
    })
    .join('');
}

async function handleFormSubmit(e) {
  e.preventDefault();

  if (!state.authenticated) {
    showNotification('Debes autenticarte primero', 'error');
    return;
  }

  const selectedItems = getTicketItems();
  const totalUnits = selectedItems.reduce((sum, item) => sum + item.cantidad, 0);
  const total = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (totalUnits === 0) {
    showNotification('Selecciona al menos un producto antes de registrar la venta.', 'error');
    return;
  }

  if (!shiftSelect.value) {
    showNotification('Selecciona un turno antes de continuar.', 'error');
    return;
  }

  if (!paymentMethodSelect.value) {
    showNotification('Selecciona un método de pago para registrar la venta.', 'error');
    return;
  }

  const invalidPriceItem = selectedItems.find((item) => item.precio_unitario <= 0 && !item.isCustom);
  if (invalidPriceItem) {
    showNotification(`Configura el precio de ${invalidPriceItem.nombre} antes de registrar la venta.`, 'error');
    return;
  }

  const otherItem = selectedItems.find((item) => item.id === 'otro');
  if (otherItem && (!otherItem.nombre || otherItem.precio_unitario <= 0)) {
    showNotification('Completa la descripción y el precio del producto Otro.', 'error');
    return;
  }

  const productSummary = selectedItems
    .map((item) => `${item.cantidad}x ${item.nombre}`)
    .join(', ');

  const averagePrice = totalUnits > 0 ? total / totalUnits : 0;

  const movement = {
    fecha_hora: new Date().toISOString(),
    turno: shiftSelect.value,
    producto_concepto: productSummary,
    cantidad: totalUnits,
    precio_unitario: parseFloat(averagePrice.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    metodo_pago: paymentMethodSelect.value,
    observaciones: observationsInput.value.trim(),
    usuario_cajera: 'Cajera',
    estado: 'activo',
    productos: selectedItems.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    })),
  };

  try {
    const submitBtn = cajaForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      const api = getAPIService();
      await api.createMovement(movement);
    } catch (error) {
      console.warn('Backend no disponible, guardando localmente:', error);
    }

    saveMovementLocally(movement);
    showNotification('✓ Movimiento guardado correctamente', 'success');

    state.ticketItems = {};
    const otherProduct = products.find((item) => item.id === 'otro');
    if (otherProduct) {
      otherProduct.descripcion = '';
      otherProduct.customPrice = 0;
    }

    renderProductCatalog();
    updateTicketSummary();
    paymentMethodSelect.value = '';
    observationsInput.value = '';

    refreshMovements();

    submitBtn.disabled = false;
    submitBtn.textContent = 'Registrar venta';
  } catch (error) {
    console.error('Error al guardar movimiento:', error);
    showNotification('Error al guardar. Intenta de nuevo.', 'error');
  }
}

// ============================================================================
// Persistencia Local


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
