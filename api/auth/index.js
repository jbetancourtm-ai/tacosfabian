/**
 * Azure Function: Validar PIN de caja
 * POST /api/auth/validate-pin
 * Body: { pin: string, type: 'caja' | 'admin' }
 * Response: { valid: boolean, message: string }
 */

const CAJA_PIN = process.env.CAJA_PIN || '1234'; // Cambiar en AppSettings
const ADMIN_PIN = process.env.ADMIN_PIN || '9999'; // Cambiar en AppSettings

export default async function (context, req) {
  try {
    const { pin, type = 'caja' } = req.body;

    // Validaciones básicas
    if (!pin || typeof pin !== 'string') {
      return invalidRequest(context, 'PIN inválido');
    }

    // Validar PIN según tipo
    let isValid = false;
    let message = 'PIN incorrecto';

    if (type === 'caja' && pin === CAJA_PIN) {
      isValid = true;
      message = 'Autenticación de caja exitosa';
    } else if (type === 'admin' && pin === ADMIN_PIN) {
      isValid = true;
      message = 'Autenticación de admin exitosa';
    }

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        valid: isValid,
        message,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    context.log.error('Error en validación de PIN:', error);
    return serverError(context, 'Error al procesar solicitud');
  }
}

function invalidRequest(context, message) {
  context.res = {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
}

function serverError(context, message) {
  context.res = {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
    body: { error: message },
  };
}
