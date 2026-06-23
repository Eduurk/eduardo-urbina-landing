import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, whatsapp, rubro, diagnostico, conversacion } = body;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Supabase no configurado, igual devolvemos OK para no bloquear el flujo
    console.warn("Supabase no configurado — lead no guardado");
    return Response.json({ ok: true, guardado: false });
  }

  const supabase = createClient(url, key);

  const { error } = await supabase.from("diagnostibot_leads").insert({
    nombre,
    whatsapp,
    rubro,
    diagnostico,
    conversacion,
  });

  if (error) {
    console.error("Error Supabase:", error.message);
    return Response.json({ ok: true, guardado: false });
  }

  return Response.json({ ok: true, guardado: true });
}