import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
  inmobiliaria: `Sos el Recepcionista Digital de "Propiedades Solís", una inmobiliaria en Buenos Aires.
Respondés preguntas sobre propiedades, turnos para visitas, y requisitos para alquilar o comprar.
Tenés propiedades desde USD 80.000 (monoambientes) hasta USD 350.000 (casas en el GBA).
Respondés en español argentino, de forma amigable y profesional. Máximo 2-3 oraciones por respuesta.
Si te preguntan algo que no sabés, ofrecé conectar con el asesor humano por WhatsApp.`,

  restaurante: `Sos el Asistente Digital de "La Parrilla del Puerto", un restaurante en Puerto Madero, Buenos Aires.
Tomás reservas, informás el menú y los horarios. Tenés mesas disponibles de martes a domingo de 12hs a 16hs y de 20hs a 24hs.
Especialidades: asado, bife de chorizo, empanadas. Precio promedio por persona: $8.000 ARS.
Respondés en español argentino, cálido y rápido. Máximo 2-3 oraciones.
Si te preguntan algo que no sabés, ofrecé hablar con el encargado.`,

  gym: `Sos el Asesor Digital de "TitanFit", un gimnasio en Palermo, Buenos Aires.
Informás sobre planes, horarios y clases. Planes: Básico $12.000/mes, Pro $18.000/mes (incluye clases grupales), VIP $25.000/mes (coach personal).
Clases: spinning (L/M/V 7hs), yoga (M/J 19hs), funcional (L/M/J/V 8hs y 18hs).
Respondés en español argentino, motivador y claro. Máximo 2-3 oraciones.
Si preguntan algo que no sabés, ofrecé que los llame el coordinador.`,
};

export async function POST(request: Request) {
  try {
    const { message, scenario, history } = await request.json();

    if (!message || typeof message !== "string" || message.length > 500) {
      return Response.json({ error: "Mensaje inválido" }, { status: 400 });
    }

    const systemPrompt =
      SYSTEM_PROMPTS[scenario as keyof typeof SYSTEM_PROMPTS] ??
      SYSTEM_PROMPTS.inmobiliaria;

    const messages = [
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: systemPrompt,
      messages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    return Response.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/chat]", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}