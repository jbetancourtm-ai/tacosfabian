import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE_NAME = 'fabian_session';
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET || '';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = Number(process.env.AUTH_LOGIN_ATTEMPT_LIMIT || 5);
const LOGIN_ATTEMPT_WINDOW_MS = Number(process.env.AUTH_LOGIN_ATTEMPT_WINDOW_MS || 15 * 60 * 1000);
const SESSION_STORE = new Map();
const LOGIN_ATTEMPTS = new Map();

function safeBase64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function safeBase64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getLoginKey(req) {
  const forwarded = req.headers?.['x-forwarded-for'] || req.headers?.['X-Forwarded-For'];
  const clientIp = req.headers?.['x-client-ip'] || req.headers?.['X-Client-IP'];
  const remoteAddress = req.socket?.remoteAddress || req.headers?.['host'] || 'unknown';

  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  if (typeof clientIp === 'string' && clientIp.trim()) {
    return clientIp.trim();
  }

  return String(remoteAddress).trim() || 'unknown';
}

function normalizeRole(value) {
  return String(value || '').trim().toLowerCase();
}

function createSignature(payloadString) {
  if (SESSION_SECRET.length < 32) {
    throw new Error('AUTH_SESSION_SECRET debe tener al menos 32 caracteres.');
  }
  const hmac = createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadString);
  return hmac.digest('base64url');
}

export function signSession(payload) {
  const safeJson = JSON.stringify(payload);
  const encodedPayload = safeBase64UrlEncode(safeJson);
  const signature = createSignature(safeJson);
  const token = `${encodedPayload}.${signature}`;
  SESSION_STORE.set(token, { payload, expiresAt: payload.expiresAt || Date.now() + SESSION_TTL_MS });
  return token;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  if (SESSION_SECRET.length < 32) return null;
  const payloadJson = safeBase64UrlDecode(encodedPayload);
  const expectedSignature = createSignature(payloadJson);

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(payloadJson);
  } catch {
    return null;
  }

  if (!payload || !payload.role || !payload.user || !payload.expiresAt) {
    return null;
  }

  const sessionEntry = SESSION_STORE.get(token);
  if (!sessionEntry || Number(sessionEntry.expiresAt) < Date.now()) {
    SESSION_STORE.delete(token);
    return null;
  }

  if (Date.now() > Number(payload.expiresAt)) {
    SESSION_STORE.delete(token);
    return null;
  }

  return payload;
}

export function parseCookieHeader(headerValue) {
  const result = {};
  if (!headerValue || typeof headerValue !== 'string') {
    return result;
  }

  headerValue.split(';').forEach((pair) => {
    const trimmed = pair.trim();
    if (!trimmed) {
      return;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      result[trimmed] = true;
      return;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch {
      // Cookies malformadas no deben provocar errores 500.
    }
  });

  return result;
}

export function getSessionCookie(req) {
  const cookieHeader = req.headers?.cookie || req.headers?.Cookie || '';
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function getSessionRole(req) {
  const token = getSessionCookie(req);
  if (!token) {
    return null;
  }

  const session = verifySessionToken(token);
  if (!session) {
    return null;
  }

  // El cookie por PIN nunca otorga privilegios administrativos.
  return normalizeRole(session.role) === 'caja' ? 'caja' : null;
}

export function requireRole(req, allowedRoles) {
  const roles = getCallerRole(req);
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }

  return roles.some((role) => allowedRoles.includes(role));
}

export function getCallerRole(req) {
  const roles = new Set();
  const sessionRole = getSessionRole(req);
  if (sessionRole === 'caja') roles.add('caja');

  // Activar exclusivamente en Functions administradas por Azure Static Web Apps.
  // SWA agrega el principal autenticado al API. Nunca habilitar esta confianza
  // en Functions expuestas directamente ni en pruebas que acepten cabeceras del cliente.
  if (String(process.env.TRUST_SWA_PRINCIPAL || '').toLowerCase() === 'true') {
    const principalHeader = req.headers?.['x-ms-client-principal'] || req.headers?.['X-MS-Client-Principal'];
    if (typeof principalHeader === 'string') {
      try {
        const principal = JSON.parse(Buffer.from(principalHeader, 'base64').toString('utf8'));
        if (principal?.userId && Array.isArray(principal.userRoles)) {
          for (const role of principal.userRoles) {
            const normalized = normalizeRole(role);
            if (normalized) roles.add(normalized);
          }
        }
      } catch {
        // Un principal inválido nunca otorga acceso.
      }
    }
  }

  return [...roles];
}

export function issueAuthSession({ role, user }) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = {
    role: normalizeRole(role),
    user: String(user || 'unknown'),
    iat: Date.now(),
    expiresAt,
  };

  const token = signSession(payload);

  return {
    token,
    expiresAt,
    cookie: `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; Secure`,
  };
}

export function revokeSession(req) {
  const token = getSessionCookie(req);
  if (token) {
    SESSION_STORE.delete(token);
  }

  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0; Secure`;
}

export function checkAndRecordLoginAttempt(req) {
  const key = getLoginKey(req);
  const now = Date.now();
  const attempts = LOGIN_ATTEMPTS.get(key) || [];

  const validAttempts = attempts.filter((ts) => now - ts < LOGIN_ATTEMPT_WINDOW_MS);
  validAttempts.push(now);

  if (validAttempts.length > LOGIN_ATTEMPT_LIMIT) {
    LOGIN_ATTEMPTS.set(key, validAttempts);
    return { allowed: false, remaining: 0 };
  }

  LOGIN_ATTEMPTS.set(key, validAttempts);
  return { allowed: true, remaining: Math.max(LOGIN_ATTEMPT_LIMIT - validAttempts.length, 0) };
}

export function resetLoginAttempts(req) {
  const key = getLoginKey(req);
  LOGIN_ATTEMPTS.delete(key);
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}
