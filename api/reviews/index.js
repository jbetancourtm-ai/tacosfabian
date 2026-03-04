import { TableClient } from "@azure/data-tables";

const TABLE_NAME = process.env.REVIEWS_TABLE_NAME || "TacosFabianReviews";
const PARTITION_KEY = "reviews";
const MAX_NAME_LENGTH = 60;
const MAX_COMMENT_LENGTH = 300;
const MAX_ITEMS = 500;

function reply(context, status, body) {
  context.res = {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body,
  };
}

function sanitizeText(value, maxLength) {
  const clean = String(value || "").trim();
  return clean.slice(0, maxLength);
}

function parseStars(value) {
  const stars = Number(value);
  if (!Number.isInteger(stars)) return null;
  if (stars < 1 || stars > 5) return null;
  return stars;
}

function getClient() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING setting.");
  }

  return TableClient.fromConnectionString(connectionString, TABLE_NAME);
}

async function ensureTableExists(client) {
  try {
    await client.createTable();
  } catch {
    // Table may already exist.
  }
}

function buildRowKey() {
  return `${new Date().toISOString()}_${crypto.randomUUID()}`;
}

async function listReviews(client) {
  const entities = [];
  const iterator = client.listEntities({
    queryOptions: {
      filter: `PartitionKey eq '${PARTITION_KEY}'`,
    },
  });

  for await (const entity of iterator) {
    entities.push({
      id: entity.rowKey,
      name: entity.name,
      stars: entity.stars,
      comment: entity.comment,
      date: entity.date,
    });

    if (entities.length >= MAX_ITEMS) break;
  }

  entities.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  return entities;
}

async function createReview(client, payload) {
  const name = sanitizeText(payload.name, MAX_NAME_LENGTH);
  const comment = sanitizeText(payload.comment, MAX_COMMENT_LENGTH);
  const stars = parseStars(payload.stars);

  if (!name) {
    return { ok: false, status: 400, error: "El nombre es obligatorio." };
  }

  if (stars === null) {
    return { ok: false, status: 400, error: "Las estrellas deben ser un número entero entre 1 y 5." };
  }

  if (!comment) {
    return { ok: false, status: 400, error: "El comentario es obligatorio." };
  }

  if (String(payload.comment || "").trim().length > MAX_COMMENT_LENGTH) {
    return { ok: false, status: 400, error: "El comentario no puede exceder 300 caracteres." };
  }

  const item = {
    partitionKey: PARTITION_KEY,
    rowKey: buildRowKey(),
    name,
    stars,
    comment,
    date: new Date().toISOString(),
  };

  await client.createEntity(item);

  return {
    ok: true,
    status: 201,
    item: {
      id: item.rowKey,
      name: item.name,
      stars: item.stars,
      comment: item.comment,
      date: item.date,
    },
  };
}

export default async function reviews(context, req) {
  const method = String(req.method || "GET").toUpperCase();

  let client;
  try {
    client = getClient();
    await ensureTableExists(client);
  } catch (error) {
    context.log("Storage setup error:", error.message);
    reply(context, 500, { error: "Error de configuración de almacenamiento." });
    return;
  }

  if (method === "GET") {
    try {
      const items = await listReviews(client);
      reply(context, 200, { items });
      return;
    } catch (error) {
      context.log("GET /api/reviews failed:", error.message);
      reply(context, 500, { error: "No se pudieron obtener las reseñas." });
      return;
    }
  }

  if (method === "POST") {
    try {
      const result = await createReview(client, req.body || {});

      if (!result.ok) {
        reply(context, result.status, { error: result.error });
        return;
      }

      reply(context, result.status, { item: result.item });
      return;
    } catch (error) {
      context.log("POST /api/reviews failed:", error.message);
      reply(context, 500, { error: "No se pudo guardar la reseña." });
      return;
    }
  }

  reply(context, 405, { error: "Método no permitido." });
}

