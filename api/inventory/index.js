import { TableClient } from '@azure/data-tables';
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
  if (req.method !== 'GET' || context.bindingData.operation !== 'catalog') {
    return respond(context, 405, { error: 'Operación no disponible.' });
  }

  // En fase 1 no se crean tablas ni registros automáticamente.
  // Un conteo debe activarse expresamente por el propietario.
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
    stockEntryEnabled: false,
    items,
  });
}
