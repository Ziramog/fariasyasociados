import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const PROMPT_TEMPLATE = `Actuá como un asesor inmobiliario profesional especializado en textos breves de alta conversión.

Tu tarea es generar una propuesta comercial para una propiedad inmobiliaria, adaptando el tono según el selector indicado.

IMPORTANTE:
- No inventes datos.
- No exageres.
- No uses frases genéricas vacías como “excelente oportunidad única” si no están justificadas.
- Escribí en español argentino neutro.
- El texto debe ser breve, claro y persuasivo.
- Máximo 2 párrafos cortos.
- Terminá siempre con una llamada a la acción.
- Si falta algún dato, simplemente omitilo sin aclarar que falta.
- NUNCA menciones el precio, costos ni financiación. El precio ya se muestra detallado en otra sección.

Selector de versión:
{{selector_version}}

Opciones posibles:

1. "formal"
Generá una propuesta profesional, sobria y confiable. Ideal para email o contacto más institucional.

2. "whatsapp"
Generá una propuesta cercana, natural y directa. Ideal para enviar por WhatsApp.

3. "comercial"
Generá una propuesta más orientada a conversión, destacando valor, ubicación y motivo para avanzar. Sin sonar agresivo.

Datos de la propiedad:
- Nombre del cliente: {{nombre_cliente}}
- Tipo de propiedad: {{tipo_propiedad}}
- Operación: {{operacion}}
- Ciudad/Zona: {{ubicacion}}
- Barrio: {{barrio}}
- Dormitorios: {{dormitorios}}
- Baños: {{banos}}
- Superficie: {{superficie}}
- Puntos destacados: {{puntos_destacados}}
- Referencias de ubicación: {{referencias_ubicacion}}
- Uso ideal: {{uso_ideal}}

Reglas de salida:
- Devolvé solo el texto final de la propuesta.
- No expliques qué versión elegiste.
- No agregues títulos.
- No uses markdown.`;

export async function generateAIDescription(input) {
  if (!OPENAI_API_KEY) {
    console.error('[AI] No OPENAI_API_KEY found.');
    return null;
  }

  const prompt = PROMPT_TEMPLATE
    .replace('{{selector_version}}', input.selector_version || 'whatsapp')
    .replace('{{nombre_cliente}}', input.nombre_cliente || '')
    .replace('{{tipo_propiedad}}', input.tipo_propiedad || '')
    .replace('{{operacion}}', input.operacion || '')
    .replace('{{ubicacion}}', input.ubicacion || '')
    .replace('{{barrio}}', input.barrio || '')
    .replace('{{dormitorios}}', input.dormitorios || '')
    .replace('{{banos}}', input.banos || '')
    .replace('{{superficie}}', input.superficie || '')
    .replace('{{puntos_destacados}}', input.puntos_destacados || '')
    .replace('{{referencias_ubicacion}}', input.referencias_ubicacion || '')
    .replace('{{uso_ideal}}', input.uso_ideal || '');

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[AI] Error generating with OpenAI:', err.message);
    return null;
  }
}
