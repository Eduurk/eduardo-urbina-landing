import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado — agregá las variables de entorno en Vercel");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: "missing code" }, { status: 400 });
    }

    // 1. Intercambiar el code por un access token de larga duracion
    const tokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Error obteniendo token:", tokenData);
      return NextResponse.json({ success: false, error: tokenData }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Con ese token, pedir las cuentas de WhatsApp Business a las que tiene acceso
    const debugUrl = `https://graph.facebook.com/v22.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();

    // Los granular_scopes te dan el WABA ID que el usuario compartio
    const wabaScope = debugData?.data?.granular_scopes?.find(
      (s: any) => s.scope === "whatsapp_business_management"
    );
    const wabaId = wabaScope?.target_ids?.[0];

    if (!wabaId) {
      return NextResponse.json(
        { success: false, error: "No se encontro WABA en el token" },
        { status: 400 }
      );
    }

    // 3. Obtener los numeros de telefono de esa WABA
    const numbersRes = await fetch(
      `https://graph.facebook.com/v22.0/${wabaId}/phone_numbers?access_token=${accessToken}`
    );
    const numbersData = await numbersRes.json();
    const phoneNumberId = numbersData?.data?.[0]?.id;
    const displayPhoneNumber = numbersData?.data?.[0]?.display_phone_number;

    if (!phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "No se encontro numero de telefono en la WABA" },
        { status: 400 }
      );
    }

    // 4. Registrar el numero para uso con Cloud API
    await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ messaging_product: "whatsapp", pin: "000000" }),
    });

    // 5. Suscribir la app a los webhooks de esta WABA
    await fetch(`https://graph.facebook.com/v22.0/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 6. Guardar todo en Supabase
    const { error } = await getSupabase().from("whatsapp_connections").upsert({
      owner_label: "eduardo-urbina-landing",
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      access_token: accessToken,
      display_phone_number: displayPhoneNumber,
      status: "active",
    });

    if (error) {
      console.error("Error guardando en Supabase:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, wabaId, phoneNumberId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}