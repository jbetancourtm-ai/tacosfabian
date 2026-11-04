/**
 * Dia comercial por fecha calendario en Texcoco (America/Mexico_City).
 * Azure Table Storage conserva PartitionKey UTC para compatibilidad con ventas
 * existentes; las consultas unen la fecha UTC solicitada y la siguiente.
 */
export const BUSINESS_TIME_ZONE = 'America/Mexico_City';

const businessFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function businessDateFromTimestamp(timestamp) {
  const instant = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(instant.getTime())) return null;
  const parts = Object.fromEntries(
    businessFormatter.formatToParts(instant)
      .filter((part) => ['year', 'month', 'day'].includes(part.type))
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function utcPartitionsForBusinessDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    throw new Error('La fecha debe tener formato YYYY-MM-DD.');
  }
  const first = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(first.getTime()) || first.toISOString().slice(0, 10) !== date) {
    throw new Error('Fecha invalida.');
  }
  // Mexico City esta detras de UTC: un dia local abarca partes de dos dias UTC.
  return [date, new Date(first.getTime() + 86400000).toISOString().slice(0, 10)];
}

export async function listBusinessDayMovements(client, date, { shift = null } = {}) {
  const movements = [];
  for (const partitionKey of utcPartitionsForBusinessDate(date)) {
    const iterator = client.listEntities({
      queryOptions: { filter: `PartitionKey eq '${partitionKey}'` },
    });
    for await (const entity of iterator) {
      if (String(entity.estado || '').toLowerCase() === 'cancelado') continue;
      if (shift && String(entity.turno || '') !== String(shift)) continue;
      if (businessDateFromTimestamp(entity.fecha_hora) === date) {
        movements.push(entity);
      }
    }
  }
  return movements;
}
