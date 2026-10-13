export const config = { runtime: "edge" };

/**
 * Formulario público de Ukika.
 * Requiere RESEND_API_KEY, CONTACT_FROM_EMAIL y CONTACT_TO_EMAIL en Vercel.
 * No almacena consultas en una base de datos.
 */
const LEVELS = new Set([
  'Aún no lo sé', 'Sala Cuna Menor', 'Sala Cuna Mayor',
  'Medio Menor', 'Medio Mayor', 'Transición'
]);
const MOTIVES = new Set(['Consulta de matrícula', 'Solicitar una visita']);

function json(status, value, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    }
  });
}

function field(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max + 1) : '';
}

export default async function handler(request) {
    if (request.method !== 'POST') {
      return json(405, { error: 'Método no permitido.' }, { Allow: 'POST' });
    }

    // Protección CSRF básica: el formulario solo acepta su propio origen.
    // No sustituye un sistema de limitación de solicitudes ni antispam.
    const expectedOrigin = new URL(request.url).origin;
    if (request.headers.get('origin') !== expectedOrigin) {
      return json(403, { error: 'Origen no autorizado.' });
    }

    if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
      return json(415, { error: 'Se requiere JSON.' });
    }

    if (Number(request.headers.get('content-length') || 0) > 12000) {
      return json(413, { error: 'Solicitud demasiado grande.' });
    }

    let input;
    try {
      const raw = await request.text();
      if (raw.length > 12000) return json(413, { error: 'Solicitud demasiado grande.' });
      input = JSON.parse(raw);
    } catch {
      return json(400, { error: 'Solicitud inválida.' });
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return json(400, { error: 'Solicitud inválida.' });
    }

    // Campo invisible a personas: descartar robots sencillos sin reenviar.
    if (field(input.website, 200)) return json(200, { ok: true });

    const nombre = field(input.nombre, 90);
    const telefono = field(input.telefono, 35);
    const correo = field(input.correo, 254);
    const nivel = field(input.nivel, 40);
    const motivo = field(input.motivo, 40);
    const mensaje = field(input.mensaje, 2000);
    const emailValid = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(correo);

    if (
      nombre.length < 2 || nombre.length > 90 ||
      telefono.length > 35 ||
      !emailValid || correo.length > 254 ||
      !LEVELS.has(nivel) || !MOTIVES.has(motivo) ||
      mensaje.length < 10 || mensaje.length > 2000 ||
      input.consent !== true
    ) {
      return json(400, { error: 'Revisa los datos y acepta el aviso de privacidad.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    const to = process.env.CONTACT_TO_EMAIL;
    if (!apiKey || !from || !to) {
      return json(503, { error: 'El formulario aún no está configurado. Escríbenos directamente por correo.' });
    }

    const text = [
      'Nueva solicitud desde la página web de Ukika',
      '',
      `Motivo: ${motivo}`,
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      `Teléfono: ${telefono || 'No indicado'}`,
      `Nivel: ${nivel}`,
      '',
      'Mensaje:',
      mensaje
    ].join('\n');

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: correo,
          subject: `Ukika — ${motivo}`,
          text
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        console.error('Servicio de correo: respuesta HTTP', response.status);
        return json(502, { error: 'No se pudo enviar la consulta. Inténtalo nuevamente o utiliza nuestro correo.' });
      }
      return json(200, { ok: true });
    } catch {
      console.error('Servicio de correo: error de conexión');
      return json(502, { error: 'No se pudo conectar con el servicio de correo. Inténtalo nuevamente.' });
    }
}
