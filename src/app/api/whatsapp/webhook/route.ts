import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  return createClient(url, key);
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: "escalate_to_human",
    description:
      "Usá esta herramienta cuando el cliente muestre intención clara de contratar, pida hablar con Eduardo, solicite precios concretos, o tenga una pregunta que requiera decisión humana. Esto apaga el bot y pasa la conversación a Eduardo.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: {
          type: "string",
          enum: ["ready_to_buy", "requested_human", "complex_question"],
          description: "Motivo del escalamiento",
        },
        summary: {
          type: "string",
          description:
            "Resumen breve de la conversación: quién es el cliente, qué negocio tiene, qué necesita",
        },
      },
      required: ["reason", "summary"],
    },
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ received: true });
    }

    const phoneNumberId = value.metadata.phone_number_id;
    const fromNumber = message.from;
    const messageBody = message.text?.body ?? "";
    const now = new Date().toISOString();

    const supabase = getSupabase();

    // Guardar mensaje entrante
    await supabase.from("whatsapp_messages").insert({
      phone_number_id: phoneNumberId,
      from_number: fromNumber,
      message_body: messageBody,
      direction: "inbound",
    });

    // Upsert conversacion
    await supabase.from("whatsapp_conversations").upsert(
      {
        phone_number_id: phoneNumberId,
        from_number: fromNumber,
        last_message: messageBody,
        last_direction: "inbound",
        last_message_at: now,
      },
      { onConflict: "from_number" }
    );

    // Chequear bot_active
    const { data: convRow } = await supabase
      .from("whatsapp_conversations")
      .select("bot_active")
      .eq("from_number", fromNumber)
      .limit(1)
      .single();

    if (convRow?.bot_active === false) {
      return NextResponse.json({ received: true });
    }

    // Buscar access token
    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("access_token")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!connection) {
      console.error("No se encontro conexion para phone_number_id:", phoneNumberId);
      return NextResponse.json({ received: true });
    }

    // Cargar historial de conversacion (ultimos 15, en orden cronologico)
    const { data: rawHistory } = await supabase
      .from("whatsapp_messages")
      .select("message_body, direction")
      .eq("from_number", fromNumber)
      .order("created_at", { ascending: false })
      .limit(15);

    const history = (rawHistory ?? []).reverse();

    // Construir messages array para Claude (merge de mensajes consecutivos del mismo rol)
    const messages: Anthropic.MessageParam[] = [];
    for (const msg of history) {
      const role = msg.direction === "inbound" ? "user" : "assistant";
      const last = messages[messages.length - 1];
      if (last && last.role === role && typeof last.content === "string") {
        last.content += "\n" + msg.message_body;
      } else {
        messages.push({ role, content: msg.message_body });
      }
    }

    // Garantizar que el array no este vacio y termine en user
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      messages.push({ role: "user", content: messageBody });
    }

    // Llamar a Claude con herramientas
    const claudeResponse = await getAnthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: `Sos el asistente virtual de Eduardo Urbina, especialista en IA y automatización para negocios. Ayudás a potenciales clientes a entender cómo la IA puede transformar su negocio.

Respondé de forma breve, cálida y profesional en español rioplatense. Máximo 3 oraciones por respuesta.

Cuando el cliente muestre interés claro en contratar, pida hablar con Eduardo, o necesite información específica de precios/plazos, usá la herramienta escalate_to_human.

Nunca des precios concretos. Si preguntan costos, decí que depende del proyecto y que Eduardo les hace un diagnóstico gratuito sin compromiso.`,
      messages,
      tools: TOOLS,
    });

    // Función auxiliar para enviar mensaje por WhatsApp
    async function sendWhatsApp(text: string) {
      await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${connection!.access_token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: fromNumber,
          text: { body: text },
        }),
      });
      await supabase.from("whatsapp_messages").insert({
        phone_number_id: phoneNumberId,
        from_number: fromNumber,
        message_body: text,
        direction: "outbound",
      });
      await supabase
        .from("whatsapp_conversations")
        .update({ last_message: text, last_direction: "outbound", last_message_at: new Date().toISOString() })
        .eq("from_number", fromNumber);
    }

    // Manejar tool use
    const toolUseBlock = claudeResponse.content.find((b) => b.type === "tool_use");

    if (toolUseBlock && toolUseBlock.type === "tool_use" && toolUseBlock.name === "escalate_to_human") {
      const input = toolUseBlock.input as { reason: string; summary: string };

      // Apagar bot y guardar resumen
      await supabase
        .from("whatsapp_conversations")
        .update({
          bot_active: false,
          last_message: `[ESCALADO — ${input.reason}] ${input.summary}`,
          last_message_at: new Date().toISOString(),
        })
        .eq("from_number", fromNumber);

      await sendWhatsApp(
        "¡Perfecto! Eduardo se va a comunicar con vos personalmente para darte toda la información. 🤝"
      );

      return NextResponse.json({ received: true });
    }

    // Respuesta de texto normal
    const textBlock = claudeResponse.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text" && textBlock.text) {
      await sendWhatsApp(textBlock.text);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ received: true });
  }
}