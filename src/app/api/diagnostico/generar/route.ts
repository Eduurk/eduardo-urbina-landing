import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const { conversacion } = await request.json();

  const texto = (conversacion as { role: string; content: string }[])
    .map((m) => `${m.role === "user" ? "Visitante" : "Bot"}: ${m.content}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Analizá esta conversación de diagnóstico de negocio y generá un JSON estructurado.

CONVERSACIÓN:
${texto}

Respondé ÚNICAMENTE con un JSON válido, sin markdown ni texto adicional. Usá esta estructura exacta:

{
  "rubro": "nombre del rubro",
  "resumen_negocio": "párrafo de 2-3 oraciones describiendo el negocio y su situación operativa actual",
  "problemas_detectados": [
    "Problema operativo 1",
    "Problema operativo 2",
    "Problema operativo 3"
  ],
  "procesos_automatizables": [
    "Proceso que se puede automatizar 1",
    "Proceso que se puede automatizar 2",
    "Proceso que se puede automatizar 3"
  ],
  "empleados_digitales_recomendados": [
    {
      "nombre": "Recepcionista Digital",
      "descripcion": "Descripción específica para este negocio",
      "impacto": "Cómo mejora la operación concretamente",
      "precio_estimado": "USD 490"
    }
  ],
  "ahorro_estimado": {
    "horas_semanales": 15,
    "descripcion": "Explicación del ahorro esperado para este negocio puntual"
  },
  "prioridad": "alta",
  "notas_comerciales": "Notas internas para Eduardo al preparar la propuesta: puntos de dolor clave, oportunidades de upsell, objeciones posibles"
}

Precios de referencia para empleados digitales:
- Recepcionista Digital (atiende consultas, agenda, info): USD 490
- Vendedor Digital (sigue leads, cierra ventas, cotiza): USD 990
- Sistema Completo (múltiples agentes integrados): USD 1.990+

La prioridad es "alta" si tienen muchos procesos manuales y/o mucho volumen. "media" si hay oportunidades claras pero no urgentes. "baja" si ya están digitalizados.

Recomendá entre 1 y 3 empleados digitales según lo detectado. Sé específico en cómo aplica cada uno a este negocio puntual.`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    return Response.json({ diagnostico: JSON.parse(text) });
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return Response.json({ diagnostico: JSON.parse(match[0]) });
      } catch {
        /* fall through */
      }
    }
    return Response.json({ error: "Error al generar diagnóstico" }, { status: 500 });
  }
}