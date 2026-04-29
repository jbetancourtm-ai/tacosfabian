# 🚀 Guía Rápida - Sistema de Caja y Admin

## Para la Cajera 💰

### Acceder a Caja
1. Ve a: **www.tacosfabiantexcoco.com.mx/caja**
2. Ingresa PIN: **1234**
3. ¡Listo! Ya puedes registrar ventas

### Registrar una Venta
1. Selecciona el **turno** (Mañana/Tarde/Noche)
2. Escribe el **producto** (ej: Tacos de suadero)
3. Ingresa **cantidad** (ej: 5)
4. Ingresa **precio unitario** (ej: 12.00)
5. El **total** se calcula automáticamente
6. Selecciona **método de pago** (Efectivo/Tarjeta/etc)
7. (Opcional) Agrega observaciones
8. Presiona **"Guardar Movimiento"** 💾

### Ver Resumen del Día
- Arriba a la derecha ves:
  - **Total vendido hoy**
  - **Total de este turno**
  - **Últimos movimientos** (abajo a la derecha)

### Cambiar PIN
- Contacta al dueño o administrador
- El PIN se guarda en el navegador

---

## Para el Dueño 👨‍💼

### Acceder al Panel
1. Ve a: **www.tacosfabiantexcoco.com.mx/admin**
2. Inicia sesión con **GitHub**
3. Crea o ingresa tu **PIN** (primera vez crea, siguiente valida)
4. ¡Listo! Ves el dashboard

### Ver Dashboard Nuevo
- Desplázate hacia abajo en el panel
- Nueva sección: **"Movimientos de Caja"**
- Ves en tiempo real:
  - Total de movimientos
  - Total ingresos
  - Ticket promedio
  - Desglose por método de pago (Efectivo, Tarjeta, etc)

### Filtrar por Fecha
- En la sección de Caja, arriba a la derecha
- Hay un selector de fecha
- Selecciona la fecha que quieres ver
- Los datos se actualizan automáticamente

### Ver Detalles
- Tabla con todos los movimientos:
  - Hora exacta
  - Turno
  - Qué se vendió
  - Cantidad
  - Monto
  - Método de pago

### Auto-Refresh
- Se actualiza **cada 5 segundos** automáticamente
- Presiona **"🔄 Actualizar"** para actualizar manualmente
- **NO necesitas recargar la página**

### Exportar Datos
- (Pronto) Botón para exportar a Excel
- (Pronto) Generar reportes PDF

---

## Preguntas Frecuentes

### ¿Mi PIN es seguro?
- Se guarda **SOLO en tu navegador** (localStorage)
- No se envía a servidores públicos
- Cierra sesión si usas navegador compartido

### ¿Se pierden datos si cierro el navegador?
- **NO**, los datos se guardan automáticamente
- En tu navegador (localStorage)
- También en Azure Table Storage (si está configurado)

### ¿Qué pasa si no hay internet?
- Caja sigue funcionando (offline)
- Se guardan datos localmente
- Se sincronizan cuando hay conexión

### ¿Puedo ver movimientos de días anteriores?
- SÍ, en Admin → elige la fecha en el filtro
- VER disponible en Caja también

### ¿Quién más puede ver mis ventas?
- **Solo tú** con GitHub login
- La cajera ve su resumen local
- Nadie puede acceder sin autenticación

### ¿Cómo borro movimientos?
- En Admin → botón "🗑️ Limpiar historial local"
- Solo borra datos de TU navegador
- Ten cuidado: ¡no se puede recuperar!

---

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| No puedo ver /caja | Verifica URL exacta, intenta en incógnito |
| PIN incorrecto | Por defecto es **1234**, contacta admin |
| Los datos no se guardan | Verifica que localStorage esté habilitado |
| No veo nuevos movimientos | Presiona manualmente "Actualizar" |
| Error en admin | Cierra sesión y vuelve a loguear con GitHub |
| Muy lenta | Limpia localStorage si tiene muchos datos |

---

## Próximamente

- 📊 Reportes diarios en PDF
- 📈 Gráficos de ventas
- 💳 Desglose de comisiones
- 📱 App móvil
- 🔔 Notificaciones en tiempo real

---

**Versión**: 1.0  
**Última actualización**: 2026-04-29  
**Soporte**: Contacta al admin
