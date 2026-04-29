/**
 * Azure Function: Resumen de ventas y KPIs
 * GET /api/sales-summary/daily - KPIs del día
 * GET /api/sales-summary/range - Rango de fechas
 * GET /api/sales-summary/kpi - KPIs en formato para dashboard
 */

import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

const TABLE_NAME = process.env.MOVEMENTS_TABLE_NAME || 'SalesMovements';
const STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'tacosfabianstg';
const STORAGE_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';

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
      console.warn('No se pudo conectar a Table Storage');
    }
  }
  return tableClient;
}

// Mock en memoria
const mockMovements = [];

export default async function (context, req) {
  try {
    const { operation } = context.bindingData;

    if (operation === 'daily') {
      return await handleDailySummary(context, req);
    } else if (operation === 'range') {
      return await handleRangeSummary(context, req);
    } else if (operation === 'kpi') {
      return await handleKPI(context, req);
    } else {
      return notFound(context);
    }
  } catch (error) {
    context.log.error('Error en sales-summary:', error);
    return serverError(context, 'Error al procesar solicitud');
  }
}

async function handleDailySummary(context, req) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const movements = await getMovementsByDate(context, date);

    const summary = calculateSummary(movements);

    return success(context, {
      date,
      summary,
      movements_count: movements.length,
    });
  } catch (error) {
    context.log.error('Error en resumen diario:', error);
    return serverError(context, 'Error al calcular resumen');
  }
}

async function handleRangeSummary(context, req) {
  try {
    const startDate = req.query.start || new Date().toISOString().split('T')[0];
    const endDate = req.query.end || new Date().toISOString().split('T')[0];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const movements = [];

    // Iterar por cada día en el rango
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayMovements = await getMovementsByDate(context, dateStr);
      movements.push(...dayMovements);
    }

    const summary = calculateSummary(movements);

    return success(context, {
      startDate,
      endDate,
      summary,
      movements_count: movements.length,
    });
  } catch (error) {
    context.log.error('Error en resumen por rango:', error);
    return serverError(context, 'Error al calcular resumen');
  }
}

async function handleKPI(context, req) {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const movements = await getMovementsByDate(context, date);

    const summary = calculateSummary(movements);
    const byPaymentMethod = groupByPaymentMethod(movements);
    const byShift = groupByShift(movements);

    return success(context, {
      date,
      kpi: {
        total_vendido: summary.total,
        movimientos_count: movements.length,
        ticket_promedio: movements.length > 0 ? summary.total / movements.length : 0,
        por_metodo_pago: byPaymentMethod,
        por_turno: byShift,
        ultimos_movimientos: movements.slice(-10).reverse(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    context.log.error('Error en KPI:', error);
    return serverError(context, 'Error al calcular KPI');
  }
}

// ============================================================================
// Utilidades de Datos
// ============================================================================
async function getMovementsByDate(context, date) {
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

      return entities;
    }
  } catch (error) {
    context.log.warn('Error con Table Storage, usando mock');
  }

  // Fallback a mock
  return mockMovements.filter((m) => {
    const mDate = new Date(m.fecha_hora).toISOString().split('T')[0];
    return mDate === date && m.estado !== 'cancelado';
  });
}

function calculateSummary(movements) {
  const summary = {
    total: 0,
    count: movements.length,
    average_ticket: 0,
    detalles: {},
  };

  movements.forEach((m) => {
    summary.total += parseFloat(m.total) || 0;
  });

  summary.average_ticket = movements.length > 0 ? summary.total / movements.length : 0;

  return summary;
}

function groupByPaymentMethod(movements) {
  const grouped = {};

  movements.forEach((m) => {
    const method = m.metodo_pago || 'otro';
    if (!grouped[method]) {
      grouped[method] = {
        count: 0,
        total: 0,
      };
    }
    grouped[method].count++;
    grouped[method].total += parseFloat(m.total) || 0;
  });

  return grouped;
}

function groupByShift(movements) {
  const grouped = {};

  movements.forEach((m) => {
    const shift = m.turno || 'otro';
    if (!grouped[shift]) {
      grouped[shift] = {
        count: 0,
        total: 0,
      };
    }
    grouped[shift].count++;
    grouped[shift].total += parseFloat(m.total) || 0;
  });

  return grouped;
}

function sanitizePartitionKey(key) {
  return String(key).replace(/[\\#?/]/g, '');
}

// ============================================================================
// Respuestas
// ============================================================================
function success(context, data) {
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: data,
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
