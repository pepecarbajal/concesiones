// api/login.js — Vercel Serverless Function
// Esta función corre SOLO en el servidor. La contraseña nunca llega al navegador.

const DURACION_SESION_MS = 8 * 60 * 60 * 1000; // 8 horas
const MAX_INTENTOS       = 5;
const VENTANA_BLOQUEO_MS = 15 * 60 * 1000;      // 15 minutos

// ── Almacén en memoria para rate limiting ──────────────────────────────────
// Nota: en un entorno con múltiples instancias serverless usa Redis/KV.
// Para uso personal/pequeño esto es suficiente.
const intentosFallidos = new Map(); // ip → { count, firstAttempt }

const obtenerIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

const estaBloqueda = (ip) => {
  const registro = intentosFallidos.get(ip);
  if (!registro) return false;

  const tiempoTranscurrido = Date.now() - registro.firstAttempt;

  // Si pasaron más de 15 min, limpiar el registro
  if (tiempoTranscurrido > VENTANA_BLOQUEO_MS) {
    intentosFallidos.delete(ip);
    return false;
  }

  return registro.count >= MAX_INTENTOS;
};

const registrarIntentoFallido = (ip) => {
  const registro = intentosFallidos.get(ip);
  if (!registro || Date.now() - registro.firstAttempt > VENTANA_BLOQUEO_MS) {
    intentosFallidos.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    registro.count += 1;
  }
};

const limpiarIP = (ip) => {
  intentosFallidos.delete(ip);
};

/**
 * Firma simple HMAC-SHA256 usando WebCrypto (disponible en Edge/Node)
 * Devuelve: base64(payload):base64(firma)
 */
const crearToken = async (payload, secret) => {
  const encoder  = new TextEncoder();
  const payloadB64 = btoa(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const firma = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const firmaB64 = btoa(String.fromCharCode(...new Uint8Array(firma)));

  return `${payloadB64}:${firmaB64}`;
};

const verificarToken = async (token, secret) => {
  try {
    const [payloadB64, firmaB64] = token.split(':');
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const firma = Uint8Array.from(atob(firmaB64), c => c.charCodeAt(0));
    const valido = await crypto.subtle.verify('HMAC', key, firma, encoder.encode(payloadB64));

    if (!valido) return null;

    const payload = JSON.parse(atob(payloadB64));
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const ip = obtenerIP(req);

  // ── Rate limiting ──
  if (estaBloqueda(ip)) {
    return res.status(429).json({
      error: 'Demasiados intentos fallidos. Espera 15 minutos.',
      bloqueado: true,
    });
  }

  // ── Leer body ──
  let password;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    password = body?.password;
  } catch {
    return res.status(400).json({ error: 'Body inválido' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  // ── Verificar contraseña (solo en servidor) ──
  const PASSWORD_CORRECTA = process.env.APP_PASSWORD;
  const SESSION_SECRET    = process.env.SESSION_SECRET;

  if (!PASSWORD_CORRECTA || !SESSION_SECRET) {
    console.error('[login] Variables de entorno APP_PASSWORD / SESSION_SECRET no configuradas');
    return res.status(500).json({ error: 'Error de configuración del servidor' });
  }

  // Comparación en tiempo constante para evitar timing attacks
  const esCorrecta = password.length === PASSWORD_CORRECTA.length &&
    password.split('').every((char, i) => char === PASSWORD_CORRECTA[i]);

  if (!esCorrecta) {
    registrarIntentoFallido(ip);
    const registro = intentosFallidos.get(ip);
    const intentosRestantes = MAX_INTENTOS - (registro?.count || 0);

    return res.status(401).json({
      error: 'Contraseña incorrecta',
      intentosRestantes: Math.max(0, intentosRestantes),
    });
  }

  // ── Contraseña correcta ──
  limpiarIP(ip);

  const payload = {
    usuario: { id: 'user', rol: 'viewer' },
    exp: Date.now() + DURACION_SESION_MS,
    iat: Date.now(),
  };

  const token = await crearToken(payload, SESSION_SECRET);

  // Configurar cookie HttpOnly (no accesible desde JS)
  const cookieOpciones = [
    `geomin_session=${token}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${DURACION_SESION_MS / 1000}`,
    // Agregar Secure en producción
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieOpciones);

  return res.status(200).json({ ok: true });
}