"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Reclamo {
  id: number;
  phone_number_id: string;
  from_number: string | null;
  unidad: string | null;
  categoria: string | null;
  descripcion: string | null;
  urgencia: string | null;
  estado: string | null;
  created_at: string | null;
  edificio: string;
}

type Filter = "all" | "urgente" | "abierto" | "resuelto";

const CAT_ICON: Record<string, string> = {
  Plomería: "🔧", Ascensor: "🛗", Electricidad: "⚡", Ruidos: "🔊",
  Limpieza: "🧹", Portón: "🚪", Expensas: "💰", Otro: "📌",
};
const URG_LABEL: Record<string, string> = { urgente: "Urgente", normal: "Normal", baja: "Baja" };
const EST_LABEL: Record<string, string> = { pendiente: "Pendiente", curso: "En curso", resuelto: "Resuelto" };

export default function ReclamosPage() {
  const router = useRouter();
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  function getSecret() {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") ?? "" : "";
  }

  async function load() {
    const secret = getSecret();
    if (!secret) { router.replace("/admin"); return; }
    try {
      const res = await fetch("/api/admin/reclamos", { headers: { "x-admin-secret": secret } });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      setReclamos(data.reclamos ?? []);
    } catch {
      setError("Error cargando reclamos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  async function setEstado(id: number, estado: string) {
    setReclamos((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)));
    await fetch("/api/admin/reclamos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ id, estado }),
    });
  }

  const isOpen = (r: Reclamo) => r.estado !== "resuelto";
  const stats = {
    total: reclamos.length,
    abiertos: reclamos.filter(isOpen).length,
    urgentes: reclamos.filter((r) => r.urgencia === "urgente" && isOpen(r)).length,
    resueltos: reclamos.filter((r) => r.estado === "resuelto").length,
  };

  const visible = reclamos.filter((r) =>
    filter === "urgente" ? r.urgencia === "urgente" && isOpen(r)
    : filter === "abierto" ? isOpen(r)
    : filter === "resuelto" ? r.estado === "resuelto"
    : true
  );

  const TABS: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: "Todos", n: stats.total },
    { key: "urgente", label: "🔴 Urgentes", n: stats.urgentes },
    { key: "abierto", label: "⏳ Abiertos", n: stats.abiertos },
    { key: "resuelto", label: "✓ Resueltos", n: stats.resueltos },
  ];

  function fmt(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">Reclamos · Portero Digital</h1>
          <p className="text-gray-500 text-xs">{stats.total} reclamos · en vivo cada 15s</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/admin/empleados" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">🤖 Empleados</Link>
          <Link href="/admin/inbox" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">💬 Inbox</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { l: "Reclamos", v: stats.total, c: "text-white", r: "border-white/10" },
            { l: "Urgentes", v: stats.urgentes, c: "text-red-400", r: "border-red-500/30" },
            { l: "Abiertos", v: stats.abiertos, c: "text-orange-400", r: "border-orange-500/25" },
            { l: "Resueltos", v: stats.resueltos, c: "text-neon", r: "border-neon/25" },
          ].map((s) => (
            <div key={s.l} className={`bg-white/[0.03] border ${s.r} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                filter === t.key ? "border-neon/50 text-neon bg-neon/10" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {t.label} <span className="opacity-60">({t.n})</span>
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500 text-center py-16">Cargando reclamos...</p>}
        {error && <p className="text-red-400 text-center py-16">{error}</p>}
        {!loading && !error && reclamos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-400 text-lg mb-2">Todavía no hay reclamos</p>
            <p className="text-gray-600 text-sm">Cuando un vecino le reporte algo al bot, aparece acá.</p>
          </div>
        )}

        <div className="space-y-3">
          {visible.map((r) => {
            const urg = r.urgencia ?? "normal";
            const stripe = urg === "urgente" ? "border-l-red-500" : urg === "baja" ? "border-l-white/10" : "border-l-sky-500";
            return (
              <div key={r.id} className={`bg-white/[0.03] border border-white/10 border-l-4 ${stripe} rounded-xl px-5 py-4`}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl shrink-0">
                    {CAT_ICON[r.categoria ?? "Otro"] ?? "📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-gray-500 text-xs font-mono">#{r.id}</span>
                      <span className="text-white font-semibold text-sm">{r.unidad || "—"}</span>
                      <span className="text-gray-600 text-xs">· {r.edificio}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        urg === "urgente" ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : urg === "baja" ? "bg-white/5 text-gray-400 border-white/10"
                        : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                      }`}>{URG_LABEL[urg]}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{r.descripcion}</p>
                    <p className="text-gray-600 text-xs mt-1">{r.categoria} · {fmt(r.created_at)}</p>
                  </div>
                </div>

                {/* Estado + acciones */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    r.estado === "resuelto" ? "bg-neon/10 text-neon border-neon/30"
                    : r.estado === "curso" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                  }`}>{EST_LABEL[r.estado ?? "pendiente"]}</span>
                  <span className="ml-auto flex gap-2">
                    {r.estado !== "curso" && r.estado !== "resuelto" && (
                      <button onClick={() => setEstado(r.id, "curso")} className="text-xs text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-lg hover:bg-yellow-500/10 transition-colors">Tomar</button>
                    )}
                    {r.estado !== "resuelto" && (
                      <button onClick={() => setEstado(r.id, "resuelto")} className="text-xs text-neon border border-neon/30 px-2.5 py-1 rounded-lg hover:bg-neon/10 transition-colors">Resolver ✓</button>
                    )}
                    {r.estado === "resuelto" && (
                      <button onClick={() => setEstado(r.id, "pendiente")} className="text-xs text-gray-400 border border-white/10 px-2.5 py-1 rounded-lg hover:text-white transition-colors">Reabrir</button>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
