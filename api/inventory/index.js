import { TableClient } from '@azure/data-tables';
import { randomUUID } from 'node:crypto';
import { requireRole } from '../lib/auth.js';
import { INVENTORY_CATALOG } from './catalog.js';

// Solo lectura: ninguna venta ni consulta descuenta existencias.
// Nunca convertir un artículo sin conteo en stock 0.
const TABLE_NAME = process.env.INVENTORY_TABLE_NAME || 'InventoryItems';

function respond(context, status, body) {
  context.res = { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body };
  return context.res;
}

export default async function inventory(context, req) {
  if (!requireRole(req, ['admin'])) return respond(context, 403, { error: 'Acceso administrativo requerido.' });
  const operation = context.bindingData.operation;
  if (req.method === 'POST' && operation === 'count') return createInitialCount(context, req);
  if (req.method !== 'GET' || operation !== 'catalog') {
    return respond(context, 405, { error: 'Operación no disponible.' });
  }

  // Consultar nunca crea registros. Solo el conteo explícito del dueño puede inicializar stock.
  let saved = new Map();
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
  if (connectionString) {
    try {
      const client = TableClient.fromConnectionString(connectionString, TABLE_NAME);
      for await (const entity of client.listEntities({ queryOptions: { filter: "PartitionKey eq 'inventory'" } })) {
        if (INVENTORY_CATALOG.some(item => item.sku === entity.rowKey)) saved.set(entity.rowKey, entity);
      }
    } catch (error) {
      if (error?.statusCode !== 404 && error?.code !== 'ResourceNotFound') {
        context.log.error('Fallo al leer inventario', error);
        return respond(context, 503, { error: 'El inventario no está disponible.' });
      }
      // Tabla ausente: catálogo en estado pendiente, sin crear datos.
    }
  }

  const items = INVENTORY_CATALOG.map(item => {
    const record = saved.get(item.sku);
    const initialized = record?.initialized === true && Number.isSafeInteger(Number(record?.quantity)) && Number(record.quantity) >= 0;
    return {
      ...item,
      initialized,
      quantity: initialized ? Number(record.quantity) : null,
      minimum: record?.minimum == null ? null : Number(record.minimum),
      cost: record?.cost == null ? null : Number(record.cost),
      updatedAt: record?.updatedAt || null,
      status: !initialized ? 'pending' : Number(record.quantity) === 0 ? 'out' : record.minimum != null && Number(record.quantity) <= Number(record.minimum) ? 'low' : 'available',
    };
  });
  return respond(context, 200, {
    phase: 'catalog_only',
    autoDeductionEnabled: false,
    stockEntryEnabled: true,
    items,
  });
}


// Primer conteo: operación administrativa explícita, no realiza descuentos.
// Registra el saldo inicial y la evidencia en un batch atómico de Azure Tables.
// Si el producto ya está inicializado, la operación no lo sobrescribe.
async function createInitialCount(context, req) {
  const input = req.body && typeof req.body === 'object' ? req.body : {};
  const sku = String(input.sku || '').trim();
  const quantity = Number(input.quantity);
  const product = INVENTORY_CATALOG.find(item => item.sku === sku);
  if (!product || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000) {
    return respond(context, 400, { error: 'Código o cantidad inválida. Solo se permiten unidades enteras no negativas.' });
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
  if (!connectionString) return respond(context, 503, { error: 'Almacenamiento no configurado.' });
  const client = TableClient.fromConnectionString(connectionString, TABLE_NAME);

  try {
    try {
      await client.createTable();
    } catch (error) {
      if (error?.statusCode !== 409 && error?.code !== 'TableAlreadyExists' && error?.code !== 'ResourceAlreadyExists') throw error;
    }

    const now = new Date().toISOString();
    const eventId = randomUUID();
    const record = {
      partitionKey: 'inventory',
      rowKey: product.sku,
      quantity,
      initialized: true,
      updatedAt: now,
      lastEventId: eventId,
    };
    const audit = {
      partitionKey: 'inventory',
      rowKey: 'event-' + eventId,
      eventType: 'INITIAL_COUNT',
      sku,
      quantityDelta: quantity,
      previousQuantity: -1, // -1 es marcador interno: no había conteo anterior.
      resultingQuantity: quantity,
      createdAt: now,
      actorRole: 'admin',
    };
    await client.submitTransaction([['create', record], ['create', audit]]);
    return respond(context, 201, { sku, quantity, initialized: true, message: 'Conteo inicial guardado y auditado.' });
  } catch (error) {
    if (error?.statusCode === 409 || error?.code === 'EntityAlreadyExists' || error?.code === 'ResourceExists') {
      return respond(context, 409, { error: 'Este artículo ya tiene un conteo inicial. No se modificó.' });
    }
    context.log.error('Fallo al guardar inventario inicial', error);
    return respond(context, 503, { error: 'No fue posible guardar el conteo inicial.' });
  }
}
