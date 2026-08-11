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
  const { data: prospectos, error } = await supabase
    .from("prospectos")
    .select("id, phone_number_id, from_number, nombre, rubro, necesidad, temperatura, estado, notas, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prospectos: prospectos ?? [] });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { id?: number; estado?: string; temperatura?: string; notas?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { id, estado, temperatura, notas } = body;
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const update: Record<string, string> = { updated_at: new Date().toISOString() };
  if (estado && ["nuevo", "contactado", "cerrado", "descartado"].includes(estado)) update.estado = estado;
  if (temperatura && ["caliente", "tibio", "frio"].includes(temperatura)) update.temperatura = temperatura;
  if (notas !== undefined) update.notas = notas;

  const { error } = await getSupabase().from("prospectos").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
