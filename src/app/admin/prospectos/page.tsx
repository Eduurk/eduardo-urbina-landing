"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Prospecto {
  id: number;
  from_number: string | null;
  nombre: string | null;
  rubro: string | null;
  necesidad: string | null;
  temperatura: string | null;
  estado: string | null;
  notas: string | null;
  created_at: string | null;
  updated_at: string | null;
}

type Filter = "all" | "caliente" | "nuevo" | "cerrado";

const TEMP: Record<string, { label: string; emoji: string; cls: string }> = {
  caliente: { label: "Caliente", emoji: "🔥", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
  tibio: { label: "Tibio", emoji: "🟡", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  frio: { label: "Frío", emoji: "❄️", cls: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
};
const EST: Record<string, string> = { nuevo: "Nuevo", contactado: "Contactado", cerrado: "Cerrado", descartado: "Descartado" };

export default function ProspectosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Prospecto[]>([]);
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
      const res = await fetch("/api/admin/prospectos", { headers: { "x-admin-secret": secret } });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      setItems(data.prospectos ?? []);
    } catch {
      setError("Error cargando prospectos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  async function patch(id: number, body: Record<string, string>) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...body } : p)));
    await fetch("/api/admin/prospectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
      body: JSON.stringify({ id, ...body }),
    });
  }

  const tempRank = (t: string | null) => (t === "caliente" ? 3 : t === "tibio" ? 2 : 1);
  const activos = items.filter((p) => p.estado !== "cerrado" && p.estado !== "descartado");
  const stats = {
    total: items.length,
    calientes: activos.filter((p) => p.temperatura === "caliente").length,
    nuevos: items.filter((p) => p.estado === "nuevo").length,
    cerrados: items.filter((p) => p.estado === "cerrado").length,
  };

  const visible = items
    .filter((p) =>
      filter === "caliente" ? p.temperatura === "caliente" && p.estado !== "cerrado" && p.estado !== "descartado"
      : filter === "nuevo" ? p.estado === "nuevo"
      : filter === "cerrado" ? p.estado === "cerrado"
      : true
    )
    .sort((a, b) => tempRank(b.temperatura) - tempRank(a.temperatura));

  const TABS: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: "Todos", n: stats.total },
    { key: "caliente", label: "🔥 Calientes", n: stats.calientes },
    { key: "nuevo", label: "🆕 Nuevos", n: stats.nuevos },
    { key: "cerrado", label: "✓ Cerrados", n: stats.cerrados },
  ];

  function fmt(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">Prospectos · CRM</h1>
          <p className="text-gray-500 text-xs">{stats.total} prospectos · en vivo</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/admin/inbox" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">💬 Inbox</Link>
          <Link href="/admin/empleados" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">🤖 Empleados</Link>
          <Link href="/admin/pagos" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">💳 Pagos</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { l: "Prospectos", v: stats.total, c: "text-white", r: "border-white/10" },
            { l: "Calientes", v: stats.calientes, c: "text-red-400", r: "border-red-500/30" },
            { l: "Nuevos", v: stats.nuevos, c: "text-orange-400", r: "border-orange-500/25" },
            { l: "Cerrados", v: stats.cerrados, c: "text-neon", r: "border-neon/25" },
          ].map((s) => (
            <div key={s.l} className={`bg-white/[0.03] border ${s.r} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

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

        {loading && <p className="text-gray-500 text-center py-16">Cargando prospectos...</p>}
        {error && <p className="text-red-400 text-center py-16">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-gray-400 text-lg mb-2">Todavía no hay prospectos</p>
            <p className="text-gray-600 text-sm">Cuando alguien charle con tu vendedor, el bot lo registra acá.</p>
          </div>
        )}

        <div className="space-y-3">
          {visible.map((p) => {
            const temp = TEMP[p.temperatura ?? "tibio"] ?? TEMP.tibio;
            const stripe = p.temperatura === "caliente" ? "border-l-red-500" : p.temperatura === "frio" ? "border-l-sky-500" : "border-l-yellow-500";
            const cerrado = p.estado === "cerrado" || p.estado === "descartado";
            return (
              <div key={p.id} className={`bg-white/[0.03] border border-white/10 border-l-4 ${stripe} rounded-xl px-5 py-4 ${cerrado ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold text-sm">{p.nombre || p.rubro || "Prospecto"}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${temp.cls}`}>{temp.emoji} {temp.label}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full border bg-white/5 text-gray-400 border-white/10">{EST[p.estado ?? "nuevo"]}</span>
                    </div>
                    {p.rubro && <p className="text-gray-300 text-sm"><span className="text-gray-500">Rubro:</span> {p.rubro}</p>}
                    {p.necesidad && <p className="text-gray-300 text-sm"><span className="text-gray-500">Necesita:</span> {p.necesidad}</p>}
                    <p className="text-gray-600 text-xs mt-1">+{p.from_number} · {fmt(p.updated_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 flex-wrap">
                  <Link
                    href={`/admin/inbox/${encodeURIComponent(p.from_number ?? "")}`}
                    className="text-xs text-neon border border-neon/30 px-2.5 py-1 rounded-lg hover:bg-neon/10 transition-colors"
                  >
                    Ver chat →
                  </Link>
                  <span className="ml-auto flex gap-2">
                    {p.estado !== "contactado" && p.estado !== "cerrado" && (
                      <button onClick={() => patch(p.id, { estado: "contactado" })} className="text-xs text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-lg hover:bg-sky-500/10 transition-colors">Contactado</button>
                    )}
                    {p.estado !== "cerrado" && (
                      <button onClick={() => patch(p.id, { estado: "cerrado" })} className="text-xs text-neon border border-neon/30 px-2.5 py-1 rounded-lg hover:bg-neon/10 transition-colors">Cerrado ✓</button>
                    )}
                    {p.estado !== "descartado" && p.estado !== "cerrado" && (
                      <button onClick={() => patch(p.id, { estado: "descartado" })} className="text-xs text-gray-500 border border-white/10 px-2.5 py-1 rounded-lg hover:text-gray-300 transition-colors">Descartar</button>
                    )}
                    {cerrado && (
                      <button onClick={() => patch(p.id, { estado: "nuevo" })} className="text-xs text-gray-400 border border-white/10 px-2.5 py-1 rounded-lg hover:text-white transition-colors">Reabrir</button>
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
