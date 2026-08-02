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

// Listar los empleados digitales (conexiones de WhatsApp)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await getSupabase()
    .from("whatsapp_connections")
    .select("id, owner_label, business_name, phone_number_id, display_phone_number, status, system_prompt, created_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connections: data ?? [] });
}

// Editar el cerebro (nombre del negocio + system_prompt) de un número
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let body: { phone_number_id?: string; business_name?: string; system_prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { phone_number_id, business_name, system_prompt } = body;
  if (!phone_number_id) {
    return NextResponse.json({ error: "Falta phone_number_id" }, { status: 400 });
  }

  const update: Record<string, string> = {};
  if (business_name !== undefined) update.business_name = business_name;
  if (system_prompt !== undefined) update.system_prompt = system_prompt;

  const { error } = await getSupabase()
    .from("whatsapp_connections")
    .update(update)
    .eq("phone_number_id", phone_number_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
