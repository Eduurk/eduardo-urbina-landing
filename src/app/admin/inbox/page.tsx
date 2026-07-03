"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Conversation {
  id: string;
  phone_number_id: string;
  from_number: string;
  bot_active: boolean;
  last_message: string | null;
  last_direction: string | null;
  last_message_at: string | null;
}

export default function InboxPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getSecret() {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") ?? "" : "";
  }

  async function load() {
    const secret = getSecret();
    if (!secret) { router.replace("/admin"); return; }

    try {
      const res = await fetch("/api/admin/whatsapp/conversations", {
        headers: { "x-admin-secret": secret },
      });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      setConvs(data.conversations ?? []);
    } catch {
      setError("Error cargando conversaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function formatTime(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">WhatsApp Inbox</h1>
          <p className="text-gray-500 text-xs">{convs.length} conversaciones</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={load}
            className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors"
          >
            ↻ Actualizar
          </button>
          <Link
            href="/admin"
            className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-white/20 hover:text-white transition-colors"
          >
            DiagnostiBot
          </Link>
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Sitio
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading && (
          <p className="text-gray-500 text-center py-20">Cargando conversaciones...</p>
        )}
        {error && <p className="text-red-400 text-center py-20">{error}</p>}
        {!loading && !error && convs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-400 text-lg mb-2">Todavía no hay conversaciones</p>
            <p className="text-gray-600 text-sm">
              Cuando alguien le escriba al bot de WhatsApp, aparecerá acá.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {convs.map((c) => (
            <Link
              key={c.id}
              href={`/admin/inbox/${encodeURIComponent(c.from_number)}`}
              className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 hover:border-neon/20 hover:bg-white/[0.05] transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center shrink-0 text-base">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white text-sm font-medium">+{c.from_number}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      c.bot_active
                        ? "bg-neon/10 text-neon border-neon/30"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    }`}
                  >
                    {c.bot_active ? "Bot activo" : "Manual"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs truncate">
                  {c.last_direction === "outbound" ? "Vos: " : ""}
                  {c.last_message ?? "Sin mensajes aún"}
                </p>
              </div>
              <p className="text-gray-600 text-xs shrink-0">{formatTime(c.last_message_at)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}