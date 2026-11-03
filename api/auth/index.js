/**
 * Azure Function: Validar PIN de caja
 * POST /api/auth/validate-pin
 * Body: { pin: string, type: 'caja' }. Admin usa identidad SWA.
 * Response: { valid: boolean, message: string }
 */

import {
  checkAndRecordLoginAttempt,
  issueAuthSession,
  resetLoginAttempts,
  getSessionCookieName,
  getSessionCookie,
  verifySessionToken,
} from '../lib/auth.js';

const CAJA_PIN = process.env.CAJA_PIN || '';
// La administración utiliza exclusivamente la identidad y el rol de SWA.

export default async function (context, req) {
  try {
    const action = (context.bindingData && context.bindingData.action) || 'validate-pin';

    if (req.method === 'GET' && action === 'session') {
      const token = getSessionCookie(req);
      const session = token ? verifySessionToken(token) : null;

      if (!session || !session.role) {
        return unauthorized(context, 'Sesión no válida');
      }

      return success(context, {
        valid: true,
        role: session.role,
        message: 'Sesión válida',
      });
    }

    const { pin, type = 'caja' } = req.body || {};
    const roleType = String(type || '').toLowerCase();

    if (roleType !== 'caja') {
      return invalidRequest(context, 'Tipo de acceso inválido');
    }

    const loginAttempt = checkAndRecordLoginAttempt(req);
    if (!loginAttempt.allowed) {
      return tooManyAttempts(context, 'Demasiados intentos. Intenta más tarde.');
    }

    if (!pin || typeof pin !== 'string') {
      return invalidRequest(context, 'PIN inválido');
    }

    if (!CAJA_PIN) {
      return serverError(context, 'El PIN de caja no está configurado en el servidor.');
    }

    const isValid = pin === CAJA_PIN;

    if (!isValid) {
      return unauthorized(context, 'PIN incorrecto');
    }

    resetLoginAttempts(req);
    const session = issueAuthSession({ role: roleType, user: roleType });

    const response = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': session.cookie,
      },
      body: {
        valid: true,
        role: roleType,
        message: `Autenticación de ${roleType} exitosa`,
        timestamp: new Date().toISOString(),
        session: {
          name: getSessionCookieName(),
          valid: true,
        },
      },
    };

    context.res = response;
    return response;
  } catch (error) {
    context.log.error('Error en validación de PIN:', error);
    return serverError(context, 'Error al procesar solicitud');
  }
}

function invalidRequest(context, message) {
  const response = {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  context.res = response;
  return response;
}

function success(context, body) {
  const response = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body,
  };
  context.res = response;
  return response;
}

function unauthorized(context, message) {
  const response = {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  context.res = response;
  return response;
}

function tooManyAttempts(context, message) {
  const response = {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  context.res = response;
  return response;
}

function serverError(context, message) {
  const response = {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
  context.res = response;
  return response;
}
