import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no configurado");
  return createClient(url, key);
}

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-secret") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = getSupabase();
  const { data: pagos, error } = await supabase
    .from("pagos")
    .select("id, phone_number_id, from_number, concepto, monto, estado, external_reference, created_at, paid_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: conns } = await supabase
    .from("whatsapp_connections")
    .select("phone_number_id, business_name");
  const names: Record<string, string> = {};
  for (const c of conns ?? []) {
    if (c.phone_number_id) names[c.phone_number_id] = c.business_name ?? "";
  }

  const withNames = (pagos ?? []).map((p) => ({
    ...p,
    negocio: names[p.phone_number_id] || "—",
  }));

  return NextResponse.json({ pagos: withNames });
}
