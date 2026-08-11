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

// Listar reclamos (con el nombre del edificio, si la conexión lo tiene)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const supabase = getSupabase();
  const { data: reclamos, error } = await supabase
    .from("reclamos")
    .select("id, phone_number_id, from_number, unidad, categoria, descripcion, urgencia, estado, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mapear phone_number_id -> nombre del negocio/edificio
  const { data: conns } = await supabase
    .from("whatsapp_connections")
    .select("phone_number_id, business_name");
  const names: Record<string, string> = {};
  for (const c of conns ?? []) {
    if (c.phone_number_id) names[c.phone_number_id] = c.business_name ?? "";
  }

  const withNames = (reclamos ?? []).map((r) => ({
    ...r,
    edificio: names[r.phone_number_id] || "Edificio",
  }));

  return NextResponse.json({ reclamos: withNames });
}

// Cambiar el estado de un reclamo (pendiente | curso | resuelto)
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { id?: number; estado?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id, estado } = body;
  if (!id || !estado || !["pendiente", "curso", "resuelto"].includes(estado)) {
    return NextResponse.json({ error: "Faltan id o estado válido" }, { status: 400 });
  }

  const { error } = await getSupabase().from("reclamos").update({ estado }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
