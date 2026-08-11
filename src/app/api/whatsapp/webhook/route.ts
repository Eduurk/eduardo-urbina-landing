import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  return createClient(url, key);
}

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// Descarga un audio de WhatsApp y lo transcribe con Whisper (OpenAI).
async function transcribeAudio(mediaId: string, waToken: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY || process.env.groqapikey || process.env.groq;
  if (!groqKey) {
    console.error("Falta GROQ_API_KEY para transcribir audios");
    return null;
  }
  try {
    // 1. Obtener la URL del media
    const metaRes = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${waToken}` },
    });
    const meta = await metaRes.json();
    if (!meta?.url) {
      console.error("No se obtuvo URL del audio:", meta);
      return null;
    }
    // 2. Descargar el binario del audio
    const audioRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${waToken}` } });
    if (!audioRes.ok) {
      console.error("No se pudo descargar el audio:", audioRes.status);
      return null;
    }
    const audioBuf = await audioRes.arrayBuffer();
    const mime = meta.mime_type?.split(";")[0] || "audio/ogg";
    // 3. Transcribir con Whisper
    const form = new FormData();
    form.append("file", new Blob([audioBuf], { type: mime }), "audio.ogg");
    form.append("model", "whisper-large-v3-turbo");
    const wRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
    });
    const w = await wRes.json();
    if (!w?.text) {
      console.error("Whisper no devolvió texto:", w);
      return null;
    }
    return String(w.text).trim();
  } catch (err) {
    console.error("Error transcribiendo audio:", err);
    return null;
  }
}

// ─── Herramientas ────────────────────────────────────────────────────────────
const ESCALATE_TOOL: Anthropic.Tool = {
  name: "escalate_to_human",
  description:
    "Usá esta herramienta cuando la persona muestre intención clara de contratar, pida hablar con un humano, solicite algo que requiera decisión humana, o sea un caso delicado. Esto apaga el bot y pasa la conversación a una persona del equipo.",
  input_schema: {
    type: "object" as const,
    properties: {
      reason: {
        type: "string",
        enum: ["ready_to_buy", "requested_human", "complex_question", "urgent"],
        description: "Motivo del escalamiento",
      },
      summary: {
        type: "string",
        description: "Resumen breve de la conversación: quién es y qué necesita",
      },
    },
    required: ["reason", "summary"],
  },
};

const CREAR_RECLAMO_TOOL: Anthropic.Tool = {
  name: "crear_reclamo",
  description:
    "Registrá un reclamo cuando un vecino reporta un problema del edificio (agua, ascensor, electricidad, ruidos, limpieza, portón, etc.). Usala solo cuando ya tengas claro qué pasa. Devuelve el número de reclamo para dárselo al vecino.",
  input_schema: {
    type: "object" as const,
    properties: {
      unidad: {
        type: "string",
        description: "Unidad o ubicación del reclamo (ej: 4°B, PB, Cochera, Palier)",
      },
      categoria: {
        type: "string",
        enum: ["Plomería", "Ascensor", "Electricidad", "Ruidos", "Limpieza", "Portón", "Expensas", "Otro"],
        description: "Categoría del reclamo",
      },
      descripcion: {
        type: "string",
        description: "Descripción breve y clara del problema",
      },
      urgencia: {
        type: "string",
        enum: ["urgente", "normal", "baja"],
        description: "Urgente para agua, gas, ascensor con personas o riesgo de seguridad. Normal para el resto. Baja para consultas menores.",
      },
    },
    required: ["categoria", "descripcion"],
  },
};

function buildTools(employeeType?: string | null): Anthropic.Tool[] {
  const tools: Anthropic.Tool[] = [ESCALATE_TOOL];
  if (employeeType === "portero") tools.push(CREAR_RECLAMO_TOOL);
  return tools;
}

// ─── Webhook verification ─────────────────────────────────────────────────────
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
    const supabase = getSupabase();

    // Conexion primero: necesitamos el token para bajar audios y para responder
    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("access_token, business_name, system_prompt, employee_type")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!connection) {
      console.error("No se encontro conexion para phone_number_id:", phoneNumberId);
      return NextResponse.json({ received: true });
    }

    async function sendWhatsApp(text: string) {
      const res = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
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
      if (!res.ok) {
        console.error("Error enviando a WhatsApp:", res.status, await res.text().catch(() => ""));
      }
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

    // Determinar el texto del mensaje: texto directo o transcripción de un audio
    let messageBody = "";
    let voiceFailed = false;
    if (message.type === "audio" && message.audio?.id) {
      const text = await transcribeAudio(message.audio.id, connection.access_token);
      if (text) messageBody = text;
      else voiceFailed = true;
    } else {
      messageBody = message.text?.body ?? "";
    }

    const now = new Date().toISOString();
    const storedInbound = voiceFailed ? "🎤 (nota de voz)" : messageBody;

    // Guardar mensaje entrante
    await supabase.from("whatsapp_messages").insert({
      phone_number_id: phoneNumberId,
      from_number: fromNumber,
      message_body: storedInbound,
      direction: "inbound",
    });

    // Upsert conversacion
    await supabase.from("whatsapp_conversations").upsert(
      {
        phone_number_id: phoneNumberId,
        from_number: fromNumber,
        last_message: storedInbound,
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

    // Si era un audio y no se pudo transcribir, pedir texto amablemente
    if (voiceFailed) {
      await sendWhatsApp("Perdón, no pude escuchar bien el audio 🙉 ¿Me lo escribís en un mensajito?");
      return NextResponse.json({ received: true });
    }

    // Si no hay texto (imagen, sticker, etc.), por ahora no procesamos
    if (!messageBody.trim()) {
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

    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      messages.push({ role: "user", content: messageBody });
    }

    // Cerebro del empleado (por numero), con fallback generico
    const FALLBACK_PROMPT = `Sos el asistente virtual de Eduardo Urbina, especialista en IA y automatización para negocios. Ayudás a potenciales clientes a entender cómo la IA puede transformar su negocio.

Respondé de forma breve, cálida y profesional en español rioplatense. Máximo 3 oraciones por respuesta.

Cuando el cliente muestre interés claro en contratar, pida hablar con Eduardo, o necesite información específica de precios/plazos, usá la herramienta escalate_to_human.

Nunca des precios concretos. Si preguntan costos, decí que depende del proyecto y que Eduardo les hace un diagnóstico gratuito sin compromiso.`;

    const systemPrompt =
      connection.system_prompt && connection.system_prompt.trim().length > 0
        ? connection.system_prompt
        : FALLBACK_PROMPT;

    const tools = buildTools(connection.employee_type);

    async function crearReclamo(input: {
      unidad?: string;
      categoria: string;
      descripcion: string;
      urgencia?: string;
    }): Promise<number | null> {
      const { data, error } = await supabase
        .from("reclamos")
        .insert({
          phone_number_id: phoneNumberId,
          from_number: fromNumber,
          unidad: input.unidad ?? null,
          categoria: input.categoria,
          descripcion: input.descripcion,
          urgencia: input.urgencia ?? "normal",
          estado: "pendiente",
        })
        .select("id")
        .single();
      if (error) {
        console.error("Error creando reclamo:", error);
        return null;
      }
      return (data?.id as number) ?? null;
    }

    // ─── Loop de herramientas ─────────────────────────────────────────────────
    let finalText = "";
    let disableBot = false;
    let escalateSummary = "";

    for (let i = 0; i < 4; i++) {
      const resp = await getAnthropic().messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 700,
        system: systemPrompt,
        messages,
        tools,
      });

      messages.push({ role: "assistant", content: resp.content });

      const toolUses = resp.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUses.length === 0) {
        const textBlock = resp.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text"
        );
        finalText = textBlock?.text ?? "";
        break;
      }

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        if (tu.name === "escalate_to_human") {
          const input = tu.input as { reason: string; summary: string };
          disableBot = true;
          escalateSummary = `[ESCALADO — ${input.reason}] ${input.summary}`;
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content:
              "Listo, la conversación quedó derivada a una persona del equipo. Despedite del cliente de forma amable y breve, avisándole que alguien lo va a contactar.",
          });
        } else if (tu.name === "crear_reclamo") {
          const input = tu.input as {
            unidad?: string;
            categoria: string;
            descripcion: string;
            urgencia?: string;
          };
          const ticket = await crearReclamo(input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: ticket
              ? `Reclamo registrado con el número #${ticket}. Confirmáselo al vecino y avisale que le van a dar seguimiento.`
              : "No se pudo registrar el reclamo. Pedile disculpas al vecino y decile que lo intente de nuevo en un rato.",
          });
        } else {
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: "Herramienta no disponible.",
            is_error: true,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
    }

    if (finalText) {
      await sendWhatsApp(finalText);
    }

    if (disableBot) {
      await supabase
        .from("whatsapp_conversations")
        .update({
          bot_active: false,
          last_message: escalateSummary,
          last_message_at: new Date().toISOString(),
        })
        .eq("from_number", fromNumber);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ received: true });
  }
}
