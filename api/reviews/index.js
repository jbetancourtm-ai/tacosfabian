import { TableClient } from "@azure/data-tables";

const TABLE_NAME = process.env.REVIEWS_TABLE_NAME || "TacosFabianReviews";
const PARTITION_KEY = "reviews";

function json(res, status, body) {
  res.status = status;
  res.headers = { "Content-Type": "application/json; charset=utf-8" };
  res.body = body;
  return res;
}

function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}

function clampStars(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  if (v < 1 || v > 5) return null;
  return Math.round(v);
}

function safeTrim(s, max) {
  const t = String(s ?? "").trim();
  return t.length > max ? t.slice(0, max) : t;
}

function makeRowKey() {
  const iso = new Date().toISOString();
  const rand = Math.random().toString(16).slice(2);
  return `${iso}_${rand}`;
}

function getClient() {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!conn) throw new Error("Falta AZURE_STORAGE_CONNECTION_STRING.");
  return TableClient.fromConnectionString(conn, TABLE_NAME);
}

async function ensureTable(client) {
  try { await client.createTable(); } catch {}
}

export default async function (context, req) {
  const method = (req.method || "GET").toUpperCase();

  let client;
  try {
    client = getClient();
    await ensureTable(client);
  } catch (e) {
    context.log("Storage error:", e?.message || e);
    return json(context.res, 500, { error: "Error de configuración de almacenamiento." });
  }

  if (method === "GET") {
    try {
      const items = [];
      const iter = client.listEntities({
        queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` }
      });

      for await (const entity of iter) {
        items.push({
          id: entity.rowKey,
          name: entity.name,
          stars: entity.stars,
          comment: entity.comment,
          date: entity.date
        });
        if (items.length >= 200) break;
      }

      items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      return json(context.res, 200, { items });
    } catch (e) {
      context.log("GET error:", e?.message || e);
      return json(context.res, 500, { error: "No se pudieron obtener las reseñas." });
    }
  }

  if (method === "POST") {
    const body = req.body || {};
    const name = safeTrim(body.name, 60);
    const comment = safeTrim(body.comment, 300);
    const stars = clampStars(body.stars);

    if (!isNonEmptyString(name)) return json(context.res, 400, { error: "El nombre es obligatorio." });
    if (stars === null) return json(context.res, 400, { error: "Las estrellas deben ser del 1 al 5." });
    if (!isNonEmptyString(comment)) return json(context.res, 400, { error: "El comentario es obligatorio." });
    if (comment.length > 300) return json(context.res, 400, { error: "El comentario excede 300 caracteres." });

    const date = new Date().toISOString();
    const rowKey = makeRowKey();

    try {
      await client.createEntity({
        partitionKey: PARTITION_KEY,
        rowKey,
        name,
        stars,
        comment,
        date
      });

      return json(context.res, 201, { ok: true, item: { id: rowKey, name, stars, comment, date } });
    } catch (e) {
      context.log("POST error:", e?.message || e);
      return json(context.res, 500, { error: "No se pudo guardar la reseña." });
    }
  }

  return json(context.res, 405, { error: "Método no permitido." });
}
