# 🔧 Instalación y Deploy - Sistema de Caja y Admin

## Checklist Pre-Instalación

- [ ] Tienes acceso a Azure Portal
- [ ] Tienes GitHub conectado con tu Account de Azure
- [ ] Tienes Node.js 18+ instalado localmente
- [ ] Tienes Azure CLI instalado
- [ ] Tienes permisos en el repo de GitHub

---

## PASO 1: Configuración Local

### 1.1 Clonar/Actualizar Código

```bash
# Si es la primera vez
git clone https://github.com/jbetancourtm-ai/tacosfabian.git
cd tacosfabian

# Si ya lo tienes
git pull origin main
```

### 1.2 Instalar Dependencias

```bash
# Frontend
npm install

# Backend (Azure Functions)
cd api
npm install
cd ..
```

### 1.3 Verificar Archivos Nuevos

```bash
# Verifica que estos existan:
ls caja.html
ls src/modules/cashier/caja-app.js
ls src/modules/admin/caja-dashboard.js
ls src/services/api-service.js
ls api/auth/index.js
ls api/movements/index.js
ls api/sales-summary/index.js
```

---

## PASO 2: Pruebas Locales

### 2.1 Ejecutar en Desarrollo

```bash
# En la raíz del proyecto
npm run start:swa
```

Esto abre:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:7071/api

### 2.2 Probar /caja

```
1. Ve a http://localhost:5173/caja
2. PIN: 1234
3. Completa un movimiento
4. Verifica que se guarde en localStorage
```

### 2.3 Probar /admin

```
1. Ve a http://localhost:5173/admin
2. GitHub login (local simula, en Azure real requiere)
3. Crea/ingresa PIN
4. Verifica que ves el dashboard de caja
5. Filtra por fecha
```

### 2.4 Probar API (opcional)

```bash
# Terminal nueva
curl http://localhost:7071/api/movements/daily

# Debería retornar JSON vacío o con datos de mock
```

---

## PASO 3: Preparar para Azure

### 3.1 Actualizar PIN (IMPORTANTE)

Cambia el PIN por defecto ANTES de deployar:

**Archivo: `src/modules/cashier/caja-app.js`**
```javascript
// Línea ~17
const PIN_HASH = hashPin('TU_NUEVO_PIN_AQUI'); // Cambiar de '1234'
```

O mejor aún, passalo como variable de entorno (ver abajo).

### 3.2 Crear Storage Account en Azure

Si no tienes ya:

```bash
# Login
az login

# Ver subscripciones
az account list --output table

# Crear resource group (si no existe)
az group create \
  --name tacos-fabian-rg \
  --location eastus # o tu región

# Crear storage account
az storage account create \
  --name tacosfabianstg \
  --resource-group tacos-fabian-rg \
  --location eastus \
  --sku Standard_LRS

# Obtener credenciales
az storage account show-connection-string \
  --name tacosfabianstg \
  --resource-group tacos-fabian-rg
# Copia la salida para más adelante
```

### 3.3 Crear Tabla en Storage

```bash
az storage table create \
  --name SalesMovements \
  --account-name tacosfabianstg \
  --account-key <TU_ACCOUNT_KEY>
```

---

## PASO 4: Configurar Azure Static Web App

### 4.1 Crear SWA (si no existe)

En Azure Portal:
1. Create resource → Static Web App
2. Name: `tacos-fabian` (o similar)
3. Region: East US (o tu región)
4. Source: GitHub
   - Repository: jbetancourtm-ai/tacosfabian
   - Branch: main
5. Build preset: Custom
6. App location: `/` (raíz)
7. Output location: `dist`
8. Edit workflow → Agregar:
   ```yaml
   api_location: 'api'
   api_build_command: 'npm install && npm install uuid'
   ```

### 4.2 Configurar App Settings

En Azure Portal → tu SWA → Settings → Configuration:

Agregar estas variables de entorno:

```
Nombre                              Valor
─────────────────────────────────────────────────────────────
CAJA_PIN                           1234 (o tu PIN)
ADMIN_PIN                          9999 (o tu PIN)
MOVEMENTS_TABLE_NAME               SalesMovements
AZURE_STORAGE_ACCOUNT_NAME         tacosfabianstg
AZURE_STORAGE_ACCOUNT_KEY          <clave-de-storage>
```

Para obtener AZURE_STORAGE_ACCOUNT_KEY:

```bash
az storage account keys list \
  --account-name tacosfabianstg \
  --resource-group tacos-fabian-rg \
  --query "[0].value" -o tsv
```

### 4.3 Configurar GitHub OAuth (para admin)

En Azure Portal → Authentication:
- Dirección POST login: `/admin`
- Dirección POST logout: `/`

---

## PASO 5: Deploy

### 5.1 Opción A: Auto-Deploy (Recomendado)

```bash
# Commit y push
git add .
git commit -m "feat: añadir módulo de caja y admin (v1.0)"
git push origin main
```

GitHub Actions hará deploy automáticamente.

Revisa:
- GitHub → Actions → tu workflow
- Espera a que complete (5-10 min)
- Visita: https://www.tacosfabiantexcoco.com.mx/caja

### 5.2 Opción B: Deploy Manual

```bash
# Build
npm run build

# Deploy con SWA CLI
npm install -g @azure/static-web-apps-cli

swa deploy \
  --app-name tacos-fabian \
  --resource-group tacos-fabian-rg
```

---

## PASO 6: Verificaciones Post-Deploy

### 6.1 ✅ Verificar endpoints

```bash
# Debe retornar 200
curl https://www.tacosfabiantexcoco.com.mx/caja

# Debe retornar JSON
curl https://www.tacosfabiantexcoco.com.mx/api/movements/daily

# Debe retornar GitHub login
curl https://www.tacosfabiantexcoco.com.mx/admin
```

### 6.2 ✅ Probar flujo completo

1. **Caja **
   - Ve a `/caja`
   - Ingresa PIN
   - Registra un movimiento
   - Verifica que aparezca en la tabla

2. **Admin**
   - Ve a `/admin`
   - GitHub login
   - Ingresa/crea PIN
   - Verifica que ves el dashboard
   - Verifica auto-refresh cada 5s

3. **Sitio público**
   - Ve a `/` (home)
   - Verifica menú, WhatsApp, todo funcione normal
   - No debe haber cambios visibles

### 6.3 ✅ Revisar Logs

```bash
# Application Insights
az monitor app-insights metrics list \
  --resource-group tacos-fabian-rg \
  --app tacos-fabian-ai # necesitas crear AI primero
```

---

## Troubleshooting en Azure

### Problema: "Cannot find module uuid"

**Solución**: En workflow.yml, asegúrate de:
```yaml
api_build_command: 'npm install && npm install uuid'
```

### Problema: "Table not found"

**Solución**:
```bash
# Verifica que la tabla existe
az storage table list --account-name tacosfabianstg

# Si no, créala
az storage table create \
  --name SalesMovements \
  --account-name tacosfabianstg \
  --account-key <key>
```

### Problema: "AuthorizationPermissionMismatch"

**Solución**: Verifica credenciales en AppSettings
```bash
# Obtén la clave correcta
az storage account show-connection-string \
  --name tacosfabianstg \
  --resource-group tacos-fabian-rg
```

### Problema: 404 en /caja o /admin

**Solución**: Verifica `staticwebapp.config.json`:
```bash
# Verifica que está en dist/
git log --oneline -- staticwebapp.config.json

# Si no está, agrégalo a SWA path
cat staticwebapp.config.json | gzip | wc -c
```

### Problema: "Cors policy: No 'Access-Control-Allow-Origin' header"

**Solución**: Las Function no necesitan CORS, las SWA maneja routing.
Verifica que `/api/*` está excluido de autenticación en config.

---

## Monitoreo Continuo

### Habilitar Application Insights

```bash
# Crear
az monitor app-insights component create \
  --app tacos-fabian-ai \
  --location eastus \
  --resource-group tacos-fabian-rg \
  --application-type web

# Conectar con SWA en Portal UI
```

### Logs en Tiempo Real

```bash
# Function logs
az functionapp log tail \
  --name tacos-fabian-api \
  --resource-group tacos-fabian-rg

# SWA logs
az staticwebapp build-info show \
  --name tacos-fabian \
  --resource-group tacos-fabian-rg
```

---

## Próximo Pasos

1. ✅ Verificar que todo funciona
2. 📢 Comunicar a cajeras: `/caja` con PIN
3. 📊 Monitor primeros días (errores, performance)
4. 🔐 Cambiar PIN si es necesario
5. 📈 Escalar: agregar más usuarios/cajeras

---

## Soporte

- **Docs técnico**: MODULO_CAJA_ADMIN.md
- **Guía usuario**: GUIA_RAPIDA.md
- **Azure docs**: https://docs.microsoft.com/azure/
- **SWA docs**: https://aka.ms/StaticWebApps

---

**Última actualización**: 2026-04-29

¡Listo para deployar! 🚀
