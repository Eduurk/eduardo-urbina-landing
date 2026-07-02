import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

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

    // Guardar el mensaje entrante
    await supabase.from("whatsapp_messages").insert({
      phone_number_id: phoneNumberId,
      from_number: fromNumber,
      message_body: messageBody,
      direction: "inbound",
    });

    // Buscar el access token guardado para este numero
    const { data: connection } = await supabase
      .from("whatsapp_connections")
      .select("access_token")
      .eq("phone_number_id", phoneNumberId)
      .single();

    if (!connection) {
      console.error("No se encontro conexion para phone_number_id:", phoneNumberId);
      return NextResponse.json({ received: true });
    }

    // Generar respuesta con Claude
    const claudeResponse = await anthropic.messages.create({
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
    await supabase.from("whatsapp_messages").insert({
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