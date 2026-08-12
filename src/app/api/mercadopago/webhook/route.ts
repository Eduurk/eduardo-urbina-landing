import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  return createClient(url, key);
}

// MercadoPago llama a este endpoint cuando cambia un pago.
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    const type =
      (body?.type as string) ||
      url.searchParams.get("type") ||
      url.searchParams.get("topic");
    const paymentId =
      (body?.data as { id?: string } | undefined)?.id ||
      url.searchParams.get("id") ||
      url.searchParams.get("data.id");

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ ok: true });
    }

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    });
    const pay = await payRes.json();
    if (!payRes.ok) {
      console.error("Error consultando pago MP:", pay);
      return NextResponse.json({ ok: true });
    }

    const extRef: string | undefined = pay.external_reference;
    const status: string = pay.status; // approved | pending | rejected | ...
    if (!extRef) return NextResponse.json({ ok: true });

    const supabase = getSupabase();

    if (status !== "approved") {
      await supabase.from("pagos").update({ estado: status }).eq("external_reference", extRef);
      return NextResponse.json({ ok: true });
    }

    // Marcar pagado y traer los datos para confirmar por WhatsApp
    const { data: rows } = await supabase
      .from("pagos")
      .update({ estado: "pagado", paid_at: new Date().toISOString() })
      .eq("external_reference", extRef)
      .select("phone_number_id, from_number, concepto, monto")
      .limit(1);

    const row = rows?.[0];
    if (row) {
      const { data: conn } = await supabase
        .from("whatsapp_connections")
        .select("access_token")
        .eq("phone_number_id", row.phone_number_id)
        .single();

      if (conn?.access_token) {
        const texto = `¡Pago recibido! ✅ Registramos tu pago de $${row.monto} (${row.concepto}). ¡Gracias!`;
        await fetch(`https://graph.facebook.com/v22.0/${row.phone_number_id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${conn.access_token}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: row.from_number,
            text: { body: texto },
          }),
        });
        await supabase.from("whatsapp_messages").insert({
          phone_number_id: row.phone_number_id,
          from_number: row.from_number,
          message_body: texto,
          direction: "outbound",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: true });
  }
}

// MercadoPago a veces valida el endpoint con un GET
export async function GET() {
  return NextResponse.json({ ok: true });
}
