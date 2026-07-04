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

// Meta llama a este GET una sola vez, al configurar la URL del webhook, para verificar que es tuyo
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

// Meta llama a este POST cada vez que llega un mensaje nuevo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // puede ser un evento de status (entregado, leido), lo ignoramos por ahora
      return NextResponse.json({ received: true });
    }

    const phoneNumberId = value.metadata.phone_number_id;
    const fromNumber = message.from;
    const messageBody = message.text?.body ?? "";

    const now = new Date().toISOString();

    // Guardar el mensaje entrante
    await getSupabase().from("whatsapp_messages").insert({
      phone_number_id: phoneNumberId,
      from_number: fromNumber,
      message_body: messageBody,
      direction: "inbound",
    });

    // Upsert conversacion (crea si no existe, actualiza last_message)
    await getSupabase().from("whatsapp_conversations").upsert(
      {
        phone_number_id: phoneNumberId,
        from_number: fromNumber,
        last_message: messageBody,
        last_direction: "inbound",
        last_message_at: now,
      },
      { onConflict: "from_number" }
    );

    // Chequear si el bot esta activo para esta conversacion
    const { data: convRow } = await getSupabase()
      .from("whatsapp_conversations")
      .select("bot_active")
      .eq("from_number", fromNumber)
      .limit(1)
      .single();

    if (convRow?.bot_active === false) {
      // Modo manual: no responder con IA
      return NextResponse.json({ received: true });
    }

    // Buscar el access token guardado para este numero
    const { data: connection } = await getSupabase()
      .from("whatsapp_connections")
      .select("access_token")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!connection) {
      console.error("No se encontro conexion para phone_number_id:", phoneNumberId);
      return NextResponse.json({ received: true });
    }

    // Generar respuesta con Claude
    const claudeResponse = await getAnthropic().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      system:
        "Sos el asistente virtual de Eduardo Urbina, especialista en IA y automatizacion. Respondes consultas de potenciales clientes por WhatsApp de forma breve, calida y profesional, en espanol rioplatense.",
      messages: [{ role: "user", content: messageBody }],
    });

    const replyText =
      claudeResponse.content[0].type === "text" ? claudeResponse.content[0].text : "";

    // Enviar la respuesta por WhatsApp Cloud API
    await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${connection.access_token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: fromNumber,
        text: { body: replyText },
      }),
    });

    // Guardar el mensaje saliente
    await getSupabase().from("whatsapp_messages").insert({
      phone_number_id: phoneNumberId,
      from_number: fromNumber,
      message_body: replyText,
      direction: "outbound",
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(err);
    // Meta reintenta si no devuelve 200, siempre responder 200
    return NextResponse.json({ received: true });
  }
}