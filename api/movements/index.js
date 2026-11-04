/**
 * Azure Function: Gestionar movimientos de ventas
 * POST /api/movements/create - Crear nuevo movimiento
 * GET /api/movements/daily - Obtener movimientos del día
 * GET /api/movements/shift - Obtener movimientos del turno
 */

import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { createHash } from 'node:crypto';
import { getCallerRole, requireRole } from '../lib/auth.js';
import { businessDateFromTimestamp, listBusinessDayMovements } from '../lib/business-day.js';

const TABLE_NAME = process.env.MOVEMENTS_TABLE_NAME || 'SalesMovements';
const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'tacosfabianstg';
const STORAGE_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';

let tableClient = null;

function normalizeRoleName(value) {
  return String(value || '').trim().toLowerCase();
}

function requireAuthorizedRole(req, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return requireRole(req, allowedRoles.map(normalizeRoleName));
}

function getSessionRole(req) {
  const roles = getCallerRole(req);
  return roles[0] || null;
}

function idempotencyKeyFromRequest(req, movement) {
  const requestKey = req.headers['x-idempotency-key'] || req.headers['X-Idempotency-Key'];
  if (requestKey) {
    return String(requestKey).trim();
  }

  if (movement?.operationId) {
    return String(movement.operationId).trim();
  }

  if (movement?.folio) {
    return String(movement.folio).trim();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hashPayload(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function getTableClient() {
  if (tableClient) {
    return tableClient;
  }

  try {
    if (STORAGE_CONNECTION_STRING) {
      tableClient = TableClient.fromConnectionString(STORAGE_CONNECTION_STRING, TABLE_NAME);
      return tableClient;
    }

    if (STORAGE_ACCOUNT && STORAGE_KEY) {
      const credential = new AzureNamedKeyCredential(STORAGE_ACCOUNT, STORAGE_KEY);
      tableClient = new TableClient(
        `https://${STORAGE_ACCOUNT}.table.core.windows.net`,
        TABLE_NAME,
        credential
      );
      return tableClient;
    }

    throw new Error('No hay configuración de Azure Storage disponible para movimientos.');
  } catch (error) {
    console.warn('No se pudo inicializar Table Storage para movimientos:', error?.message || error);
    throw error;
  }
}

export default async function (context, req) {
  try {
    const { operation } = context.bindingData;

    if (req.method === 'POST' && operation === 'create') {
      if (!requireAuthorizedRole(req, ['caja', 'admin'])) {
        return unauthorized(context, 'No autorizado para registrar ventas.');
      }
      return await handleCreateMovement(context, req);
    } else if (req.method === 'GET' && operation === 'daily') {
      if (!requireAuthorizedRole(req, ['admin', 'caja'])) {
        return unauthorized(context, 'No autorizado para consultar ventas del día.');
      }
      return await handleGetDaily(context, req);
    } else if (req.method === 'GET' && operation === 'shift') {
      if (!requireAuthorizedRole(req, ['admin', 'caja'])) {
        return unauthorized(context, 'No autorizado para consultar movimientos por turno.');
      }
      return await handleGetShift(context, req);
    } else {
      return notFound(context);
    }
  } catch (error) {
    context.log.error('Error en movimientos:', error);
    return serverError(context, 'Error al procesar solicitud');
  }
}

async function handleCreateMovement(context, req) {
  try {
    const movement = normalizeMovement(req.body || {});

    // Validar datos requeridos
    const required = ['folio', 'fecha_hora', 'mesa_origen', 'producto_concepto', 'cantidad', 'precio_unitario', 'total', 'metodo_pago'];
    for (const field of required) {
      if (!movement[field]) {
        return badRequest(context, `Campo faltante: ${field}`);
      }
    }

    if (!Array.isArray(movement.productos) || movement.productos.length === 0) {
      return badRequest(context, 'Campo faltante: productos');
    }

    if (Number(movement.total) <= 0) {
      return badRequest(context, 'El total debe ser mayor a 0');
    }

    if (movement.metodo_pago === 'efectivo') {
      if (!Number.isFinite(Number(movement.recibido_con)) || Number(movement.recibido_con) < Number(movement.total)) {
        return badRequest(context, 'Monto recibido insuficiente');
      }
    }

    try {
      const client = getTableClient();
      const idempotencyKey = idempotencyKeyFromRequest(req, movement);
      const partitionKey = sanitizePartitionKey(new Date(movement.fecha_hora).toISOString().split('T')[0]);
      const payloadHash = hashPayload({
        folio: movement.folio,
        fecha_hora: movement.fecha_hora,
        mesa_origen: movement.mesa_origen,
        total: Number(movement.total),
        metodo_pago: movement.metodo_pago,
        productos: movement.productos,
      });

      const entity = {
        partitionKey,
        rowKey: idempotencyKey,
        idempotency_key: idempotencyKey,
        payload_hash: payloadHash,
        ...toTableEntity(movement),
        fecha_creacion: new Date().toISOString(),
        fecha_operacion: businessDateFromTimestamp(movement.fecha_hora),
      };

      try {
        await client.createEntity(entity);
        return success(context, {
          id: entity.rowKey,
          message: 'Movimiento guardado',
          data: entity,
          duplicate: false,
        });
      } catch (createError) {
        const existsCode = createError?.statusCode || createError?.code;
        if (existsCode !== 409 && existsCode !== 'ResourceExists' && existsCode !== 'EntityAlreadyExists') {
          throw createError;
        }

        const existing = await client.getEntity(partitionKey, idempotencyKey).catch(() => null);
        if (!existing) {
          throw createError;
        }

        const existingHash = existing.payload_hash || existing.payloadHash || '';
        if (existingHash === payloadHash) {
          return success(context, {
            id: idempotencyKey,
            message: 'Movimiento ya existente',
            data: existing,
            duplicate: true,
          });
        }

        return conflict(context, 'La clave de idempotencia ya está asociada a otro contenido.');
      }
    } catch (dbError) {
      context.log.error('Error con Table Storage al crear movimiento:', dbError);
      return serverError(context, `Error de persistencia en Table Storage: ${dbError?.message || 'desconocido'}`);
    }
  } catch (error) {
    context.log.error('Error creando movimiento:', error);
    return serverError(context, 'Error al crear movimiento');
  }
}

function normalizeMovement(input) {
  const productos = Array.isArray(input.productos) ? input.productos : [];
  const cantidadTotal = Number(input.cantidad_total ?? input.cantidad ?? productos.reduce((sum, item) => sum + (Number(item.cantidad) || 0), 0));
  const resumenProductos = input.resumen_productos
    || input.producto_concepto
    || productos.map((item) => `${Number(item.cantidad) || 0}x ${item.nombre || 'Producto'}`).join(', ');
  const total = Number(input.total) || 0;
  const metodoPago = String(input.metodo_pago || '').toLowerCase();
  const rawReceived = Number(input.recibido_con);
  const recibidoCon = metodoPago === 'efectivo' && Number.isFinite(rawReceived) ? rawReceived : null;
  const cambio = metodoPago === 'efectivo'
    ? Number(input.cambio ?? ((recibidoCon || 0) - total).toFixed(2))
    : 0;
  const precioUnitario = Number(input.precio_unitario) || (cantidadTotal > 0 ? total / cantidadTotal : total);

  return {
    ...input,
    folio: input.folio || `TF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()}`,
    fecha_hora: input.fecha_hora || new Date().toISOString(),
    turno: input.turno || 'Horario unico',
    mesa_origen: input.mesa_origen || '',
    producto_concepto: resumenProductos,
    resumen_productos: resumenProductos,
    productos,
    cantidad: cantidadTotal,
    cantidad_total: cantidadTotal,
    precio_unitario: Number(precioUnitario.toFixed(2)),
    total: Number(total.toFixed(2)),
    metodo_pago: metodoPago,
    recibido_con: metodoPago === 'efectivo' && recibidoCon != null ? Number(recibidoCon.toFixed(2)) : null,
    cambio: Number(cambio.toFixed(2)),
    observaciones: input.observaciones || '',
    usuario_cajera: input.usuario_cajera || 'caja',
    estado: input.estado || 'registrado',
  };
}

function toTableEntity(movement) {
  const entity = {
    ...movement,
    productos: JSON.stringify(movement.productos),
  };
  Object.keys(entity).forEach((key) => {
    if (entity[key] == null) {
      delete entity[key];
    }
  });
  return entity;
}

async function handleGetDaily(context, req) {
  try {
    const date = req.query.date || businessDateFromTimestamp(new Date());
    const entities = await listBusinessDayMovements(getTableClient(), date);
    return success(context, { date, count: entities.length, movements: entities });
  } catch (error) {
    context.log.error('Error consultando ventas del dia comercial:', error);
    return serverError(context, 'No se pudieron consultar las ventas.');
  }
}

async function handleGetShift(context, req) {
  try {
    const shift = req.query.shift;
    if (!shift) return badRequest(context, 'Falta parametro shift');
    const date = req.query.date || businessDateFromTimestamp(new Date());
    const entities = await listBusinessDayMovements(getTableClient(), date, { shift });
    return success(context, { shift, date, count: entities.length, movements: entities });
  } catch (error) {
    context.log.error('Error consultando ventas por turno:', error);
    return serverError(context, 'No se pudieron consultar las ventas por turno.');
  }
}

// ============================================================================
// Utilidades
// ============================================================================
function sanitizePartitionKey(key) {
  // Eliminar caracteres no permitidos en partition key
  return String(key).replace(/[\\#?/]/g, '');
}

function success(context, data) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: data,
  };
  return context.res;
}

function badRequest(context, message) {
  context.res = {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  return context.res;
}

function unauthorized(context, message) {
  context.res = {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  return context.res;
}

function conflict(context, message) {
  context.res = {
    status: 409,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  return context.res;
}

function notFound(context) {
  context.res = {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
    body: { error: 'Endpoint no encontrado' },
  };
  return context.res;
}

function serverError(context, message) {
  context.res = {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  return context.res;
}
