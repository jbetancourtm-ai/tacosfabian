/**
 * Aplicación Principal de Caja
 * Maneja formulario, validación, cálculos y persistencia
 */

import { getAPIService } from '../../services/api-service.js';

// Estado de la aplicación
const state = {
  authenticated: false,
  currentShift: 'Horario único',
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
const SALES_STORAGE_KEY = 'tacos_fabian_sales_records_v1';
const SALES_SYNC_CHANNEL = 'tacos-fabian-sales-sync';

// ============================================================================
// DOM Elements
// ============================================================================
const accessGate = document.getElementById('cajaAccessGate');
const accessForm = document.getElementById('cajaAccessForm');
const pinInput = document.getElementById('cajaPinInput');
const accessStatus = document.getElementById('cajaAccessStatus');

const cajaForm = document.getElementById('cajaForm');
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
const folioDisplay = document.getElementById('cajaFolioDisplay');
const mesaOrigenSelect = document.getElementById('cajaMesaOrigen');
const receivedInput = document.getElementById('cajaReceivedAmount');
const receivedGroup = document.getElementById('cajaReceivedGroup');
const changeGroup = document.getElementById('cajaChangeGroup');
const changeDisplay = document.getElementById('cajaChangeDisplay');
const mobileCheckout = document.getElementById('cajaMobileCheckout');
const mobileToggle = document.getElementById('cajaMobileToggle');
const mobileToggleLabel = document.getElementById('cajaMobileToggleLabel');
const mobileToggleArrow = document.getElementById('cajaMobileToggleArrow');
const mobileDetails = document.getElementById('cajaMobileDetails');
const mobileTotalDisplay = document.getElementById('cajaMobileTotal');
const mobileCountDisplay = document.getElementById('cajaMobileCount');
const mobilePaymentDisplay = document.getElementById('cajaMobilePayment');
const mobilePaymentDetail = document.getElementById('cajaMobilePaymentDetail');
const mobileFolioDisplay = document.getElementById('cajaMobileFolio');
const mobileMesaDisplay = document.getElementById('cajaMobileMesa');
const mobileReceivedGroup = document.getElementById('cajaMobileReceivedGroup');
const mobileChangeGroup = document.getElementById('cajaMobileChangeGroup');
const mobileChangeDisplay = document.getElementById('cajaMobileChange');
const mobileClearTicketButton = document.getElementById('cajaMobileClearTicket');
const mobileRegisterButton = document.getElementById('cajaMobileRegister');

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

  // LIMPIAR ESTADO INICIAL - No cargar venta anterior
  state.ticketItems = {};
  const otherProduct = products.find((item) => item.id === 'otro');
  if (otherProduct) {
    otherProduct.descripcion = '';
    otherProduct.customPrice = 0;
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

  if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', updateTicketSummary);
  }

  if (mesaOrigenSelect) {
    mesaOrigenSelect.addEventListener('change', updateTicketSummary);
  }

  if (receivedInput) {
    receivedInput.addEventListener('input', updateTicketSummary);
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileDetails);
  }

  if (mobileClearTicketButton) {
    mobileClearTicketButton.addEventListener('click', clearTicket);
  }

  if (mobileRegisterButton) {
    mobileRegisterButton.addEventListener('click', () => {
      if (cajaForm) {
        cajaForm.requestSubmit();
      }
    });
  }

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

function getCurrentDateStamp() {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

function getNextFolioForToday() {
  const today = new Date().toISOString().split('T')[0];
  const dailyMovements = loadMovementsLocally().filter((movement) => {
    const movementDate = new Date(movement.fecha_hora).toISOString().split('T')[0];
    return movementDate === today;
  });
  const sequence = dailyMovements.length + 1;
  return `TF-${today.replace(/-/g, '')}-${String(sequence).padStart(4, '0')}`;
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
  const folioText = items.length > 0 ? getNextFolioForToday() : '-';
  const isCash = paymentMethodSelect.value === 'efectivo';
  const receivedValue = parseFloat(receivedInput?.value || '0') || 0;
  const changeValue = parseFloat((receivedValue - total).toFixed(2));

  if (folioDisplay) {
    folioDisplay.textContent = folioText;
  }
  if (mobileFolioDisplay) {
    mobileFolioDisplay.textContent = folioText;
  }
  if (mobileMesaDisplay) {
    mobileMesaDisplay.textContent = mesaOrigenSelect?.value || '-';
  }
  if (mobilePaymentDetail) {
    mobilePaymentDetail.textContent = paymentMethodLabel;
  }
  if (mobileTotalDisplay) {
    mobileTotalDisplay.textContent = formatMxCurrency(total);
  }
  if (mobileCountDisplay) {
    mobileCountDisplay.textContent = `${totalUnits} producto${totalUnits !== 1 ? 's' : ''}`;
  }
  if (mobilePaymentDisplay) {
    mobilePaymentDisplay.textContent = `Método: ${paymentMethodLabel}`;
  }

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

  if (mobileCheckout) {
    mobileCheckout.hidden = false;
  }

  const hasProducts = items.length > 0;
  
  // Desktop: mostrar/ocultar según método
  if (receivedGroup && changeGroup && changeDisplay) {
    if (isCash && hasProducts) {
      receivedGroup.hidden = false;
      changeGroup.hidden = false;
      changeDisplay.textContent = receivedValue >= total
        ? formatMxCurrency(changeValue)
        : 'Monto insuficiente';
    } else {
      receivedGroup.hidden = true;
      changeGroup.hidden = true;
      if (changeDisplay) {
        changeDisplay.textContent = '-';
      }
    }
  }

  // MÓVIL: El campo "Recibí con" SIEMPRE debe ser visible cuando hay productos y es efectivo
  // No usar hidden para que siempre sea visible en el panel inferior
  if (mobileReceivedGroup && mobileChangeGroup && mobileChangeDisplay) {
    if (isCash && hasProducts) {
      // En móvil siempre visible (no hidden)
      mobileReceivedGroup.hidden = false;
      mobileChangeGroup.hidden = false;
      mobileReceivedGroup.style.display = 'flex';
      mobileChangeGroup.style.display = 'flex';
      mobileChangeDisplay.textContent = receivedValue >= total
        ? formatMxCurrency(changeValue)
        : 'Falta dinero';
      mobileChangeDisplay.style.color = receivedValue >= total ? '#059669' : '#b91c1c';
      receivedInput?.classList.toggle('is-invalid', receivedValue > 0 && receivedValue < total);
    } else {
      // En móvil ocultar solo si no hay efectivo
      mobileReceivedGroup.hidden = true;
      mobileChangeGroup.hidden = true;
      mobileReceivedGroup.style.display = 'none';
      mobileChangeGroup.style.display = 'none';
      mobileChangeDisplay.textContent = '$0.00';
      mobileChangeDisplay.style.color = '#171717';
      receivedInput?.classList.remove('is-invalid');
    }
  }
  
  // Actualizar estado del botón de registrar en móvil
  updateRegisterButtonState();
}

// Actualizar estado del botón de registrar en móvil
function updateRegisterButtonState() {
  const items = getTicketItems();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const isCash = paymentMethodSelect.value === 'efectivo';
  const receivedValue = parseFloat(receivedInput?.value || '0') || 0;
  const hasProducts = items.length > 0;
  
  // Actualizar botón móvil
  if (mobileRegisterButton) {
    if (!hasProducts) {
      mobileRegisterButton.disabled = true;
      mobileRegisterButton.title = 'Agrega productos al ticket';
    } else if (isCash && receivedValue < total) {
      mobileRegisterButton.disabled = true;
      mobileRegisterButton.title = 'Monto insuficiente';
    } else {
      mobileRegisterButton.disabled = false;
      mobileRegisterButton.title = 'Registrar venta';
    }
  }
  
  // Actualizar botón desktop si existe
  const desktopRegisterButton = document.querySelector('#cajaForm button[type="submit"]');
  if (desktopRegisterButton) {
    if (!hasProducts) {
      desktopRegisterButton.disabled = true;
    } else if (isCash && receivedValue < total) {
      desktopRegisterButton.disabled = true;
    } else {
      desktopRegisterButton.disabled = false;
    }
  }
}

function toggleMobileDetails() {
  if (!mobileDetails || !mobileToggleLabel || !mobileToggleArrow) return;

  const isExpanded = mobileDetails.hidden;
  mobileDetails.hidden = !isExpanded;
  mobileToggleLabel.textContent = isExpanded ? 'Ocultar ticket' : 'Ver ticket';
  mobileToggleArrow.textContent = isExpanded ? '▲' : '▼';
}

function clearTicket() {
  // Limpiar estado del ticket
  state.ticketItems = {};
  
  // Limpiar producto "Otro" si existe
  const otherProduct = products.find((item) => item.id === 'otro');
  if (otherProduct) {
    otherProduct.descripcion = '';
    otherProduct.customPrice = 0;
  }

  // Limpiar campos del formulario
  if (receivedInput) {
    receivedInput.value = '';
  }
  if (changeGroup) {
    changeGroup.hidden = true;
  }
  if (receivedGroup) {
    receivedGroup.hidden = true;
  }
  if (changeDisplay) {
    changeDisplay.textContent = '-';
  }

  // Limpiar móvil
  if (mobileReceivedGroup) {
    mobileReceivedGroup.hidden = true;
  }
  if (mobileChangeGroup) {
    mobileChangeGroup.hidden = true;
  }
  if (mobileChangeDisplay) {
    mobileChangeDisplay.textContent = '$0.00';
  }
  if (mobileDetails) {
    mobileDetails.hidden = true;
  }
  if (mobileCheckout) {
    mobileCheckout.hidden = true;
  }
  if (mobileToggleLabel) {
    mobileToggleLabel.textContent = 'Ver ticket';
  }
  if (mobileToggleArrow) {
    mobileToggleArrow.textContent = '▼';
  }

  // Re-renderizar
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
  const roundedTotal = parseFloat(total.toFixed(2));

  if (totalUnits === 0 || selectedItems.length === 0) {
    showNotification('Selecciona al menos un producto antes de registrar la venta.', 'error');
    return;
  }

  if (roundedTotal <= 0) {
    showNotification('El total debe ser mayor a $0.00 para registrar la venta.', 'error');
    return;
  }

  if (!paymentMethodSelect.value || !['efectivo', 'transferencia'].includes(paymentMethodSelect.value)) {
    showNotification('Selecciona Efectivo o Transferencia como método de pago.', 'error');
    return;
  }

  const invalidPriceItem = selectedItems.find((item) => item.precio_unitario <= 0 && !item.isCustom);
  if (invalidPriceItem) {
    showNotification(`Configura el precio de ${invalidPriceItem.nombre} antes de registrar la venta.`, 'error');
    return;
  }

  if (!mesaOrigenSelect || !mesaOrigenSelect.value) {
    showNotification('Selecciona Mesa o Mostrador antes de registrar la venta.', 'error');
    return;
  }

  const paymentMethod = paymentMethodSelect.value;
  const receivedAmount = parseFloat(receivedInput?.value || '0') || 0;

  if (paymentMethod === 'efectivo') {
    if (receivedAmount <= 0) {
      showNotification('Captura el monto recibido para calcular el cambio.', 'error');
      return;
    }
    if (receivedAmount < total) {
      showNotification('Monto recibido insuficiente.', 'error');
      return;
    }
  }

  const productSummary = selectedItems
    .map((item) => `${item.cantidad}x ${item.nombre}`)
    .join(', ');

  const averagePrice = totalUnits > 0 ? total / totalUnits : 0;
  const folio = getNextFolioForToday();
  const cambio = paymentMethod === 'efectivo' ? parseFloat((receivedAmount - total).toFixed(2)) : 0;
  const primaryItem = selectedItems[0];

  const movement = {
    id: Date.now().toString(),
    folio,
    fecha_hora: new Date().toISOString(),
    turno: state.currentShift,
    mesa_origen: mesaOrigenSelect.value,
    producto_concepto: productSummary,
    resumen_productos: productSummary,
    productos: selectedItems.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
    })),
    cantidad_total: totalUnits,
    cantidad: totalUnits,
    precio_unitario: parseFloat(averagePrice.toFixed(2)),
    total: roundedTotal,
    metodo_pago: paymentMethod,
    recibido_con: paymentMethod === 'efectivo' ? parseFloat(receivedAmount.toFixed(2)) : null,
    cambio: cambio,
    observaciones: observationsInput.value.trim(),
    usuario_cajera: 'caja',
    estado: 'registrado',
    producto_principal: primaryItem?.nombre || productSummary,
  };

  try {
    setSavingState(true);

    const api = getAPIService();
    await api.createMovement(movement);

    saveMovementLocally(movement);
    showNotification('✓ Venta registrada correctamente', 'success');

    // LIMPIEZA COMPLETA DESPUÉS DE REGISTRAR
    clearTicket();
    
    // Limpiar formulario completamente
    paymentMethodSelect.value = '';
    if (mesaOrigenSelect) mesaOrigenSelect.value = '';
    if (observationsInput) observationsInput.value = '';
    if (receivedInput) receivedInput.value = '';
    if (changeGroup) changeGroup.hidden = true;
    if (receivedGroup) receivedGroup.hidden = true;
    if (mobileReceivedGroup) mobileReceivedGroup.hidden = true;
    if (mobileChangeGroup) mobileChangeGroup.hidden = true;
    if (mobileDetails) mobileDetails.hidden = true;
    if (mobileCheckout) mobileCheckout.hidden = true;
    if (mobileToggleLabel) mobileToggleLabel.textContent = 'Ver ticket';
    if (mobileToggleArrow) mobileToggleArrow.textContent = '▼';

    renderProductCatalog();
    updateTicketSummary();
    refreshMovements();
  } catch (error) {
    console.error('Error al guardar movimiento:', error);
    showNotification(getSaveErrorMessage(error), 'error');
  } finally {
    setSavingState(false);
    updateRegisterButtonState();
  }
}

function setSavingState(isSaving) {
  const submitBtn = cajaForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isSaving;
    submitBtn.textContent = isSaving ? 'Guardando...' : 'Registrar venta';
  }
  if (mobileRegisterButton) {
    mobileRegisterButton.disabled = isSaving;
    mobileRegisterButton.textContent = isSaving ? 'Guardando...' : 'Registrar venta';
  }
}

function getSaveErrorMessage(error) {
  const message = error?.message || 'Error desconocido';
  return `No se pudo guardar la venta. ${message}`;
}

// ============================================================================
// Persistencia Local


// ============================================================================
// Persistencia Local
// ============================================================================
function saveMovementLocally(movement) {
  const cajaMovements = JSON.parse(localStorage.getItem('caja_movements') || '[]');
  const saleRecords = JSON.parse(localStorage.getItem(SALES_STORAGE_KEY) || '[]');
  const storedMovement = {
    id: movement.id || Date.now().toString(),
    ...movement,
  };

  cajaMovements.push(storedMovement);
  saleRecords.push(storedMovement);

  localStorage.setItem('caja_movements', JSON.stringify(cajaMovements));
  localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(saleRecords));

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(SALES_SYNC_CHANNEL);
    channel.postMessage({ type: 'sales:update' });
    channel.close();
  }
}

function loadMovementsLocally() {
  return JSON.parse(localStorage.getItem('caja_movements') || '[]');
}

function getMovementsByShift(shift, date = null) {
  const allMovements = loadMovementsLocally();
  const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  return allMovements.filter((m) => {
    const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
    return m.turno === shift && mDate === targetDate && m.estado !== 'cancelado';
  });
}

function getDailyMovements(date = null) {
  const allMovements = loadMovementsLocally();
  const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

  return allMovements.filter((m) => {
    const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
    return mDate === targetDate && m.estado !== 'cancelado';
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
    const productSummary = movement.resumen_productos || movement.producto_concepto || 'Venta registrada';
    const quantity = Number(movement.cantidad_total || movement.cantidad || 0);
    const unitPrice = Number(movement.precio_unitario || 0);
    item.innerHTML = `
      <div class="recent-product">
        <strong>${productSummary.substring(0, 32)}</strong>
        <div style="font-size: 0.8rem; color: #9ca3af;">x${quantity} @ ${formatMxCurrency(unitPrice)}</div>
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
  }, 4000);
}

// ============================================================================
// Arrancar aplicación
// ============================================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
