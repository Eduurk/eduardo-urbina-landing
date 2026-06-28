import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Sos DiagnostiBot, un asistente de Eduardo Urbina especializado en diagnosticar negocios para automatización con IA.

Tu misión: hacer preguntas para entender el negocio del visitante y determinar qué empleados digitales puede Eduardo construirle.

REGLAS IMPORTANTES:
- Hacé UNA sola pregunta por mensaje, nunca dos
- Respondés en español argentino, tono amigable y conversacional
- Máximo 3 líneas por respuesta
- Escuchá la respuesta anterior antes de formular la siguiente pregunta
- Profundizá si la respuesta es vaga o interesante

INFORMACIÓN A RECOPILAR (de forma natural, no como cuestionario):
1. Rubro y tipo de negocio
2. Cómo llegan los clientes (WhatsApp, redes, web, llamadas, en persona)
3. Qué tareas repetitivas hacen todos los días
4. Cuántas personas hacen tareas administrativas
5. Qué herramientas usan (Excel, CRM, WhatsApp, etc.)
6. Cuáles son sus principales cuellos de botella o problemas

ADAPTACIÓN POR RUBRO (cuando lo detectés, hacé preguntas específicas):
- Hotel: ¿cómo gestionan las reservas?, ¿tienen muchas consultas por WhatsApp?, ¿hacen check-in manual?
- Inmobiliaria: ¿cómo siguen los leads?, ¿coordinan visitas por WhatsApp?, ¿cargan propiedades manualmente?
- Restaurante: ¿reciben pedidos por WhatsApp?, ¿gestionan reservas?, ¿tienen delivery?
- Concesionaria: ¿cómo gestionan el stock?, ¿hacen seguimiento de interesados en financiación?
- Gym/Clínica/SPA: ¿cómo gestionan los turnos?, ¿mandan recordatorios?, ¿tienen lista de espera?
- E-commerce: ¿cuántas consultas por día?, ¿hacen seguimiento post-venta?

CUÁNDO FINALIZAR:
Cuando tengas información sólida sobre al menos 4 de los 6 puntos (normalmente tras 5-7 intercambios), terminá tu último mensaje con exactamente: DIAGNÓSTICO_LISTO

Nunca pongas DIAGNÓSTICO_LISTO en medio de un mensaje, siempre al final.`;

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string" || message.length > 1000) {
      return Response.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const messages = [
      ...(Array.isArray(history) ? history.slice(-14) : []),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    });

    const full = response.content[0].type === "text" ? response.content[0].text : "";
    const done = full.includes("DIAGNÓSTICO_LISTO");
    const reply = full.replace("DIAGNÓSTICO_LISTO", "").trim();

    return Response.json({ reply, done });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[diagnostico/chat]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}