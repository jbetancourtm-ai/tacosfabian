/**
 * Azure Function: Gestionar movimientos de ventas
 * POST /api/movements/create - Crear nuevo movimiento
 * GET /api/movements/daily - Obtener movimientos del día
 * GET /api/movements/shift - Obtener movimientos del turno
 */

import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.MOVEMENTS_TABLE_NAME || 'SalesMovements';
const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'tacosfabianstg';
const STORAGE_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';

// Para desarrollo local, usar valores por defecto si no están disponibles
let tableClient = null;

function getTableClient() {
  if (!tableClient && STORAGE_ACCOUNT && STORAGE_KEY) {
    try {
      const credential = new AzureNamedKeyCredential(STORAGE_ACCOUNT, STORAGE_KEY);
      tableClient = new TableClient(
        `https://${STORAGE_ACCOUNT}.table.core.windows.net`,
        TABLE_NAME,
        credential
      );
    } catch (error) {
      console.warn('No se pudo conectar a Table Storage, usando mock en memoria');
    }
  }
  return tableClient;
}

// Mock en memoria para desarrollo
const mockMovements = [];

export default async function (context, req) {
  try {
    const { operation } = context.bindingData;

    if (req.method === 'POST' && operation === 'create') {
      return await handleCreateMovement(context, req);
    } else if (req.method === 'GET' && operation === 'daily') {
      return await handleGetDaily(context, req);
    } else if (req.method === 'GET' && operation === 'shift') {
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
    const movement = req.body;

    // Validar datos requeridos
    const required = ['fecha_hora', 'turno', 'producto_concepto', 'cantidad', 'precio_unitario', 'total', 'metodo_pago'];
    for (const field of required) {
      if (!movement[field]) {
        return badRequest(context, `Campo faltante: ${field}`);
      }
    }

    try {
      const client = getTableClient();
      if (client) {
        const entity = {
          partitionKey: sanitizePartitionKey(new Date(movement.fecha_hora).toISOString().split('T')[0]),
          rowKey: uuidv4(),
          ...movement,
          fecha_creacion: new Date().toISOString(),
        };

        await client.createEntity(entity);

        return success(context, {
          id: entity.rowKey,
          message: 'Movimiento guardado',
          data: entity,
        });
      }
    } catch (dbError) {
      context.log.warn('Error con Table Storage, usando mock:', dbError);
    }

    // Fallback a mock
    const mockEntity = {
      id: uuidv4(),
      ...movement,
      fecha_creacion: new Date().toISOString(),
    };
    mockMovements.push(mockEntity);

    return success(context, {
      id: mockEntity.id,
      message: 'Movimiento guardado (local)',
      data: mockEntity,
    });
  } catch (error) {
    context.log.error('Error creando movimiento:', error);
    return serverError(context, 'Error al crear movimiento');
  }
}

async function handleGetDaily(context, req) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const partitionKey = sanitizePartitionKey(date);

    try {
      const client = getTableClient();
      if (client) {
        const entities = [];
        const iterator = client.listEntities({
          queryOptions: {
            filter: `PartitionKey eq '${partitionKey}'`,
          },
        });

        for await (const entity of iterator) {
          if (entity.estado !== 'cancelado') {
            entities.push(entity);
          }
        }

        return success(context, {
          date,
          count: entities.length,
          movements: entities,
        });
      }
    } catch (dbError) {
      context.log.warn('Error con Table Storage:', dbError);
    }

    // Fallback a mock
    const movements = mockMovements.filter((m) => {
      const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
      return mDate === date && m.estado !== 'cancelado';
    });

    return success(context, {
      date,
      count: movements.length,
      movements,
    });
  } catch (error) {
    context.log.error('Error obteniendo movimientos diarios:', error);
    return serverError(context, 'Error al obtener movimientos');
  }
}

async function handleGetShift(context, req) {
  try {
    const shift = req.query.shift;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    if (!shift) {
      return badRequest(context, 'Falta parámetro shift');
    }

    try {
      const client = getTableClient();
      if (client) {
        const entities = [];
        const partitionKey = sanitizePartitionKey(date);
        const iterator = client.listEntities({
          queryOptions: {
            filter: `PartitionKey eq '${partitionKey}' and turno eq '${shift}'`,
          },
        });

        for await (const entity of iterator) {
          if (entity.estado !== 'cancelado') {
            entities.push(entity);
          }
        }

        return success(context, {
          shift,
          date,
          count: entities.length,
          movements: entities,
        });
      }
    } catch (dbError) {
      context.log.warn('Error con Table Storage:', dbError);
    }

    // Fallback a mock
    const movements = mockMovements.filter((m) => {
      const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
      return mDate === date && m.turno === shift && m.estado !== 'cancelado';
    });

    return success(context, {
      shift,
      date,
      count: movements.length,
      movements,
    });
  } catch (error) {
    context.log.error('Error obteniendo movimientos por turno:', error);
    return serverError(context, 'Error al obtener movimientos');
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
}

function badRequest(context, message) {
  context.res = {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
}

function notFound(context) {
  context.res = {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
    body: { error: 'Endpoint no encontrado' },
  };
}

function serverError(context, message) {
  context.res = {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
}
