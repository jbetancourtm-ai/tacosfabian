import assert from 'node:assert/strict';
import {
  businessDateFromTimestamp,
  utcPartitionsForBusinessDate,
  listBusinessDayMovements,
} from '../api/lib/business-day.js';

assert.equal(businessDateFromTimestamp('2026-11-04T00:30:00.000Z'), '2026-11-03');
assert.equal(businessDateFromTimestamp('2026-11-04T05:59:59.000Z'), '2026-11-03');
assert.equal(businessDateFromTimestamp('2026-11-04T06:00:00.000Z'), '2026-11-04');
assert.equal(businessDateFromTimestamp('2026-11-03T05:59:59.000Z'), '2026-11-02');
assert.deepEqual(utcPartitionsForBusinessDate('2026-11-03'), ['2026-11-03', '2026-11-04']);
assert.throws(() => utcPartitionsForBusinessDate('2026-02-30'), /invalida/);

const rows = {
  '2026-11-03': [
    { fecha_hora: '2026-11-03T06:20:00Z', estado: 'registrado', turno: 'Horario unico', total: 96 },
    { fecha_hora: '2026-11-03T05:55:00Z', estado: 'registrado', turno: 'Horario unico', total: 20 },
  ],
  '2026-11-04': [
    { fecha_hora: '2026-11-04T00:20:00Z', estado: 'registrado', turno: 'Horario unico', total: 16 },
    { fecha_hora: '2026-11-04T06:20:00Z', estado: 'registrado', turno: 'Horario unico', total: 80 },
    { fecha_hora: '2026-11-04T00:21:00Z', estado: 'cancelado', turno: 'Horario unico', total: 3 },
  ],
};
const queries=[];
const client={
  listEntities({queryOptions}) {
    const key = /^PartitionKey eq '([^']+)'$/.exec(queryOptions.filter)?.[1];
    queries.push(key);
    return { async *[Symbol.asyncIterator]() { for (const row of rows[key] || []) yield row; } };
  },
};
const results=await listBusinessDayMovements(client, '2026-11-03');
assert.deepEqual(queries,['2026-11-03','2026-11-04']);
assert.equal(results.length,2);
assert.equal(results.reduce((sum, row) => sum + row.total,0),112);
assert.equal((await listBusinessDayMovements(client,'2026-11-03',{shift:'otro'})).length,0);
console.log('Business day tests passed');
