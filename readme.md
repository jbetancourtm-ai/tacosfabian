# Tacos Fabián - Azure Static Web Apps

Sitio informativo de la taquería **Tacos Fabián** con API de reseñas en Azure Functions y almacenamiento persistente en Azure Table Storage.

## Estructura del proyecto

```text
.
|- .github/
|  |- workflows/
|     |- azure-static-web-apps.yml
|- api/
|  |- host.json
|  |- local.settings.sample.json
|  |- package.json
|  |- reviews/
|     |- function.json
|     |- index.js
|- public/
|  |- favicon.ico
|- src/
|  |- admin.js
|  |- main.js
|  |- styles.css
|- admin.html
|- index.html
|- package.json
|- staticwebapp.config.json
|- vite.config.js
```

## Requisitos

- Node.js 20 o 22 (recomendado)
- npm
- Azure Functions Core Tools v4
- Azure Static Web Apps CLI (`swa`) opcional pero recomendado
- Azurite para pruebas locales persistentes (opcional pero recomendado)

## 1) Abrir en VS Code

1. Clona el repositorio.
2. Abre VS Code.
3. Ve a **File > Open Folder**.
4. Selecciona la carpeta del proyecto (`fabian`).

## 2) Ejecutar local (frontend + Functions)

1. Instala dependencias del frontend:
   ```bash
   npm install
   ```
2. Instala dependencias del API:
   ```bash
   cd api
   npm install
   cd ..
   ```
3. Crea tu configuración local de Functions:
   ```bash
   copy api\local.settings.sample.json api\local.settings.json
   ```
4. Si usarás Azurite local:
   - Arranca Azurite (por VS Code extension o `azurite` en terminal).
   - Deja en `api/local.settings.json`:
     - `AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true`
5. Levanta todo con SWA CLI:
   ```bash
   npm run start:swa
   ```
6. Abre `http://localhost:4280`.

Notas:
- `http://localhost:4280/api/reviews` responde GET/POST.
- `/admin` en local no siempre simula login GitHub real; la restricción se valida en Azure Static Web Apps desplegado.

## 3) Commit y push

1. Revisa cambios:
   ```bash
   git status
   ```
2. Agrega archivos:
   ```bash
   git add .
   ```
3. Commit:
   ```bash
   git commit -m "feat: sitio completo Tacos Fabian con reseñas y admin"
   ```
4. Push a `main`:
   ```bash
   git push origin main
   ```

## 4) Conectar repo en Azure Static Web Apps

1. En Azure Portal, crea recurso **Static Web App** (Free).
2. Selecciona tu suscripción, grupo de recursos y nombre (ej: `tacos-fabian-swa`).
3. En **Deployment details**, conecta GitHub y selecciona repo/branch `main`.
4. Configura build:
   - **App location**: `/`
   - **Api location**: `api`
   - **Output location**: `dist`
5. Finaliza creación.
6. Azure creará o usará el workflow `.github/workflows/azure-static-web-apps.yml`.

## 5) Variables de entorno (storage)

En el recurso de Static Web App:

1. Ve a **Settings > Environment variables**.
2. Agrega:
   - `AZURE_STORAGE_CONNECTION_STRING` = cadena de conexión del Storage Account.
   - `REVIEWS_TABLE_NAME` = `TacosFabianReviews` (o el nombre que desees).
3. Guarda cambios.
4. Vuelve a desplegar (push nuevo commit o re-run del workflow).

### Cómo obtener `AZURE_STORAGE_CONNECTION_STRING`

1. Crea un **Storage Account** estándar (LRS, hot, plan que aplique en Free/prueba).
2. En el Storage Account, ve a **Access keys**.
3. Copia `Connection string` de key1.
4. Pégala como variable en Static Web App.

## 6) Probar POST/GET de reseñas

### GET

```bash
curl https://<tu-sitio>.azurestaticapps.net/api/reviews
```

### POST

```bash
curl -X POST https://<tu-sitio>.azurestaticapps.net/api/reviews \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"José\",\"stars\":5,\"comment\":\"Muy buenos tacos\"}"
```

### Validaciones esperadas

- `name` obligatorio
- `stars` entero entre 1 y 5
- `comment` obligatorio, máximo 300 caracteres

## Seguridad de `/admin`

Se implementó **Opción A**:
- `staticwebapp.config.json` restringe `/admin` y `/admin.html` a rol `authenticated`.
- Si no hay sesión, redirige a `/.auth/login/github`.

## Dominio personalizado

Cuando tengas `favian.com`, en Azure Static Web App:
1. Ve a **Custom domains**.
2. Agrega `favian.com` y `www.favian.com`.
3. Configura los registros DNS solicitados por Azure.

(En este proyecto solo se deja la referencia del dominio, no compra de dominio.)

---

## 🆕 Módulo de Caja y Administración (v1.0)

Se agregó un **módulo comercial completo** para gestionar ventas y administración sin romper el sitio público.

### 📁 Nuevas características

#### `/caja` - Sistema de Punto de Venta (POS)
- **URL**: `www.tacosfabiantexcoco.com.mx/caja`
- **Acceso**: PIN requerido (defecto: `1234`)
- **Características**:
  - Formulario tablet-first para registrar ventas
  - Cálculo automático de totales
  - Registro por turno (mañana/tarde/noche)
  - Métodos de pago (efectivo, tarjeta, transferencia)
  - Resumen en tiempo real del día y turno actual
  - Últimos movimientos visibles
  - Guardado automático local + servidor

#### `/admin` - Panel de Administración Mejorado
- **URL**: `www.tacosfabiantexcoco.com.mx/admin`
- **Acceso**: GitHub OAuth (bloqueado en Azure Security)
- **Nuevas secciones**:
  - Dashboard de movimientos de caja
  - KPIs en tiempo real (total, movimientos, ticket promedio)
  - Desglose de ingresos por método de pago
  - Filtro de fechas para ver histórico
  - Table con todos los movimientos
  - Auto-refresh cada 5 segundos (sin recargar página)

### 📚 Documentación

- **`MODULO_CAJA_ADMIN.md`** - Documentación técnica completa
- **`GUIA_RAPIDA.md`** - Guía rápida para usuarios (cajeras y dueño)
- **`INSTALACION_DEPLOY.md`** - Step-by-step para instalar y deployar en Azure

### 🏗️ Arquitectura

```
Azure Static Web App (mismo dominio)
├── Frontend (Vite)
│   ├── / (sitio público - sin cambios)
│   ├── /caja (punto de venta - PIN)
│   └── /admin (panel mejorado - GitHub auth)
├── Azure Functions (Backend)
│   ├── /api/auth/ - Validar PIN
│   ├── /api/movements/ - CRUD movimientos
│   └── /api/sales-summary/ - KPIs
└── Azure Table Storage
    └── SalesMovements (tabla)
```

### 🚀 Para empezar

1. Lee **`GUIA_RAPIDA.md`** para entender el flujo
2. Sigue **`INSTALACION_DEPLOY.md`** para instalar localmente
3. Prueba en desarrollo: `npm run start:swa`
4. Deploy: `git push origin main` (auto-deploy con GitHub Actions)

### 🔧 Dependencias nuevas

- No se agregaron dependencias externas en frontend (Vanilla JS)
- Backend: Se usa `@azure/data-tables` (ya existía) + `uuid` para IDs

### 📊 Sin cambios en

- ✅ Sitio público (home, menú, pedidos WhatsApp)
- ✅ Panel de reseñas existente
- ✅ Estilos actuales
- ✅ Flujo actual de pedidos
- ✅ Dominio y configuración DNS

### 🔐 Seguridad

- PIN de caja almacenado localmente en navegador
- Admin protegido por GitHub OAuth (Azure Static Web Apps)
- Validación server-side en funciones
- Datos persistentes en Azure Table Storage (encriptado)

---
