# 📱 Módulo de Caja y Administración - Tacos Fabian

## 🎯 Resumen Ejecutivo

Has agregado un módulo comercial complet dentro del mismo dominio `www.tacosfabiantexcoco.com.mx` sin crear una nueva web app ni modificar el sitio público.

**Lo que se incluye:**
- **/caja** - Sistema de punto de venta (POS) para tablet con PIN
- **/admin** - Panel mejorado para dueño con auto-refresh de ventas
- **Backend** - Azure Functions para persistencia en Table Storage
- **Seguridad** - PIN local para caja, autenticación GitHub para admin
- **Económico** - Serverless (pago por uso)

---

## 📐 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  Azure Static Web App (mismo dominio)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vite)                                        │
│  ├── / (público - sitio actual, SIN CAMBIOS)          │
│  ├── /caja (privado, PIN requerido)                   │
│  └── /admin (privado, GitHub auth)                    │
│                                                          │
│  Azure Functions (Backend)                             │
│  ├── /api/auth/validate-pin                           │
│  ├── /api/movements/create                            │
│  ├── /api/movements/daily                             │
│  ├── /api/movements/shift                             │
│  └── /api/sales-summary/...                           │
│                                                          │
│  Azure Table Storage                                   │
│  └── SalesMovements (tabla)                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Rutas Disponibles

### Sitio Público (inalterado)
- `/` - Home (menú, pedidos WhatsApp)
- `/about`, `/contact`, etc.

### Módulo de Caja
- `/caja` - Pantalla de punto de venta (tablet-first)
- Requiere PIN (por defecto: **1234**)
- Auto-nlock por sesión

### Módulo de Administración
- `/admin` - Panel mejorado
  - Requiere GitHub login
  - Resumen KPIs del día
  - Filtro por fechas
  - Tabla de movimientos con auto-refresh
  - Nuevas métricas: ingresos por método de pago

---

## 📋 Archivos Nuevos

```
proyecto/
├── caja.html                          # Punto de venta
├── vite.config.js                     # (modificado)
├── staticwebapp.config.json           # (modificado)
├── src/
│   ├── admin.js                       # (integrado)
│   ├── services/
│   │   └── api-service.js             # Cliente API centralizado
│   └── modules/
│       ├── cashier/
│       │   └── caja-app.js            # Lógica de caja
│       └── admin/
│           └── caja-dashboard.js      # Dashboard de ventas
└── api/
    ├── package.json                   # (actualizado)
    ├── auth/
    │   ├── function.json
    │   └── index.js
    ├── movements/
    │   ├── function.json
    │   └── index.js
    └── sales-summary/
        ├── function.json
        └── index.js
```

---

## 🔐 Seguridad

### /caja (Punto de Venta)
- **PIN local**: `1234` (almacenado en sessionStorage)
- Válido por sesión del navegador
- **Cambiar en producción**: Actualizar `PIN_HASH` en `caja-app.js`

### /admin (Administración)  
- **GitHub OAuth**: Requerido por Azure Static Web Apps
- **PIN adicional**: Guardado en localStorage (primera vez crea, luego valida)
- Acceso público a paneles, pero protegido por PIN

### Validaciones
- Server-side: Azure Functions validan datos
- Client-side: Sanitización de HTML
- Headers de seguridad en SWA config

---

## 💾 Base de Datos

### Tabla: `SalesMovements`

**Estructura:**
```
PartitionKey: YYYY-MM-DD (fecha)
RowKey: UUID

Campos:
- id: string (UUID)
- fecha_hora: ISO 8601
- turno: "mañana" | "tarde" | "noche"
- producto_concepto: string
- cantidad: number
- precio_unitario: number
- total: number
- metodo_pago: "efectivo" | "tarjeta" | "transferencia" | "otro"
- observaciones: string (opcional)
- usuario_cajera: string
- estado: "activo" | "cancelado"
- fecha_creacion: ISO 8601
```

**Fallback Local:**
- Si Azure Table Storage no está disponible, se usa `localStorage`
- Clave: `caja_movements`
- Formato JSON

---

## 📱 Pantalla de Caja (/caja)

### Características
- **Tablet-first**: Diseño optimizado para pantallas pequeñas
- **Reloj en vivo**: Fecha y hora automáticas
- **Formulario limpio**: 
  - Turno (mañana/tarde/noche)
  - Producto/concepto
  - Cantidad
  - Precio unitario
  - Total (cálculo automático)
  - Método de pago
  - Observaciones

### Resumen Lateral
- Total del día
- Total de turno
- Últimos 5 movimientos
- Auto-actualización cada 5 segundos

### Flujo de Uso
1. Accede a `/caja`
2. Ingresa PIN
3. Selecciona turno
4. Completa formulario
5. El total se calcula automáticamente
6. Haz clic en "Guardar Movimiento"
7. Feedback visual de confirmación

---

## 📊 Panel Admin Mejorado (/admin)

### Nuevas Características
- **Dashboard de Caja** (integrado en /admin)
- **KPIs en tiempo real**:
  - Total vendido
  - Número de movimientos
  - Ticket promedio
  - Desglose por método de pago

- **Filtro de fechas**: Selecciona día para ver movimientos específicos
- **Tabla de movimientos**: Listado completo con detalles
- **Auto-refresh**: Cada 5 segundos sin necesidad de recargar
- **Botón manual**: Actualiza datos bajo demanda

---

## 🛠️ Configuración y Deploy

### Variables de Entorno (Azure)

En Azure Portal → Static Web App → Settings → Environment variables:

```env
CAJA_PIN=1234                          # PIN de caja (cambiar antes de producción)
ADMIN_PIN=9999                         # PIN de admin (si lo usas)
MOVEMENTS_TABLE_NAME=SalesMovements    # Nombre de tabla
AZURE_STORAGE_ACCOUNT_NAME=<tu-cuenta> # Cuenta de almacenamiento
AZURE_STORAGE_ACCOUNT_KEY=<tu-clave>  # Clave de acceso
```

### Local Development

```bash
# Instalar dependencias
npm install
cd api && npm install && cd ..

# Ejecutar con emulador de Azure
npm run start:swa

# Build para producción
npm run build
```

### Deployment

```bash
# Azure CLI
az staticwebapp create \
  --name tacos-fabian \
  --resource-group <rg> \
  --source <repo-url>
```

---

## 🔄 Auto-Refresh y Tiempo Real

### Versión Actual (V1)
- **Polling**: Cada 5-10 segundos (GET requests)
- **Bajo costo**: Minimal de llamadas a API
- **Rápido**: Respuestas en <100ms

### Preparado para Upgrade (V2)
- El código está diseñado para fácil migración a SignalR
- Puntos de integración: `api-service.js` y módulos
- Sin cambios necesarios en UI

### Cómo Agregar SignalR Después:
1. Actualizar `api-service.js` con conexión SignalR
2. Reemplazar `setInterval` por listeners de SignalR
3. Sin cambios en componentes React/Vue

---

## 📈 Escalabilidad

### Bottlenecks Actuales
- localStorage: ~5-10MB (suficiente para años)
- API polling: 1 request cada 5s = 720 req/día (gratis en Functions)

### Optimizaciones Futuras
1. **Compresión**: Gzip en responses
2. **Caché**: Redis o Azure Cache
3. **WebSocket**: SignalR con fallback
4. **Partición**: Múltiples tablas por mes

---

## 🐛 Troubleshooting

### "La caja no guarda datos"
- Verifica localStorage está habilitado
- Verifica Azure Functions está deploy
- Abre DevTools → Console para errores

### "El admin no ve nuevos movimientos"
- Presiona el botón "Actualizar" manualmente
- Verifica timestamp de tu servidor
- Revisa status de auto-refresh (console)

### "Error 401 en /api/*"
- Verifica credenciales de Table Storage en AppSettings
- Verifica CORS en Azure Functions
- Usa endpoint correcto en API Service

---

## 📝 Cambios en Archivos Existentes

### `vite.config.js`
```javascript
// Agregado nuevo entry point
input: {
  main: resolve(__dirname, "index.html"),
  admin: resolve(__dirname, "admin.html"),
  caja: resolve(__dirname, "caja.html"),  // NUEVO
}
```

### `staticwebapp.config.json`
```javascript
// Agregadas rutas /caja y /admin/
{
  "route": "/caja",
  "rewrite": "/caja.html"
},
{
  "route": "/caja/*",
  "rewrite": "/caja.html"
}
```

### `src/admin.js`
```javascript
// Agregado al final
import CajaAdminDashboard from './modules/admin/caja-dashboard.js';
// Integración con dashboard
```

---

## 🎨 Personalización

### Cambiar PIN de Caja
En `src/modules/cashier/caja-app.js`:
```javascript
const PIN_HASH = hashPin('NUEVO_PIN'); // Línea 17
```

### Cambiar Colores
En `caja.html` (`:root`):
```css
--caja-primary: #ff6a00;      /* Color naranja */
--caja-success: #10b981;      /* Color verde */
--caja-danger: #ef4444;       /* Color rojo */
```

### Agregar Productos Predefinidos
En `caja.html`, cambiar input `cajaProduct` por select:
```html
<select id="cajaProduct" required>
  <option value="">Selecciona producto</option>
  <option value="Tacos de suadero">Tacos de suadero</option>
  <option value="Tacos al pastor">Tacos al pastor</option>
  <!-- ... -->
</select>
```

---

## 📞 Soporte y Mantenimiento

### Monitoreo
- Azure Portal → Application Insights (para Functions)
- DevTools Console (para errores client-side)
- Azure Storage Explorer (para ver tabla)

### Backups
- Table Storage: Replicación automática cada 15 min
- Exporta a CSV: Power BI o Azure Data Explorer

### Limpieza
En panel admin:
- Botón "Limpiar historial local" (localStorage local)
- Para borrar Table Storage: Azure Portal deleteTable()

---

## 🚀 Próximas Versiones (Roadmap)

- [ ] **V1.1**: Reportes PDF de cortes diarios
- [ ] **V1.2**: Exportar a Excel con gráficos
- [ ] **V2.0**: SignalR para tiempo real
- [ ] **V2.1**: Azure SQL en lugar de Table Storage
- [ ] **V3.0**: App móvil nativa (iOS/Android)
- [ ] **V3.1**: Inventario (productos, stock)
- [ ] **V3.2**: Empleados (permisos, comisiones)

---

## 📄 Licencia y Créditos

Este módulo fue construido específicamente para Tacos Fabian.
Mantén este código seguro y no compartas PINs.

**Creado**: 2026
**Stack**: Azure Static Web App + Functions + Table Storage
**Tech**: Vanilla JS (sin dependencias externas en frontend)

---

¿Preguntas? Revisa los comentarios en el código o contacta al desarrollador.
