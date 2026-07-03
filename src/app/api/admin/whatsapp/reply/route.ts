import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  return createClient(url, key);
}

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { from_number, message } = await req.json();
  if (!from_number || !message?.trim()) {
    return NextResponse.json({ error: "from_number y message requeridos" }, { status: 400 });
  }

  const { data: convRows } = await getSupabase()
    .from("whatsapp_conversations")
    .select("phone_number_id")
    .eq("from_number", from_number)
    .limit(1);

  const conv = convRows?.[0];
  if (!conv) return NextResponse.json({ error: "Conversacion no encontrada" }, { status: 404 });

  const { data: connRows } = await getSupabase()
    .from("whatsapp_connections")
    .select("access_token")
    .eq("phone_number_id", conv.phone_number_id)
    .limit(1);

  const connection = connRows?.[0];
  if (!connection) return NextResponse.json({ error: "Conexion WhatsApp no encontrada" }, { status: 404 });

  const sendRes = await fetch(
    `https://graph.facebook.com/v22.0/${conv.phone_number_id}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${connection.access_token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: from_number,
        text: { body: message },
      }),
    }
  );

  if (!sendRes.ok) {
    const err = await sendRes.json();
    console.error("Error Meta API:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const now = new Date().toISOString();

  await getSupabase().from("whatsapp_messages").insert({
    phone_number_id: conv.phone_number_id,
    from_number,
    message_body: message,
    direction: "outbound",
  });

  await getSupabase()
    .from("whatsapp_conversations")
    .update({ last_message: message, last_direction: "outbound", last_message_at: now })
    .eq("from_number", from_number);

  return NextResponse.json({ success: true });
}