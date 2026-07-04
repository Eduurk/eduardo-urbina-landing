import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return Response.json(
      { error: `Variables faltantes: URL=${!!supabaseUrl} KEY=${!!supabaseKey}` },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("diagnostibot_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message, details: error }, { status: 500 });
    }

    return Response.json({ leads: data ?? [] });
  } catch (err: any) {
    console.error("Admin leads catch:", err);
    return Response.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}