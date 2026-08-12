"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Pago {
  id: number;
  from_number: string | null;
  concepto: string | null;
  monto: number | null;
  estado: string | null;
  negocio: string;
  created_at: string | null;
  paid_at: string | null;
}

type Filter = "all" | "pagado" | "pendiente";

export default function PagosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Pago[]>([]);
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
      const res = await fetch("/api/admin/pagos", { headers: { "x-admin-secret": secret } });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      setItems(data.pagos ?? []);
    } catch {
      setError("Error cargando pagos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const pagados = items.filter((p) => p.estado === "pagado");
  const stats = {
    cobrado: pagados.reduce((acc, p) => acc + (Number(p.monto) || 0), 0),
    pagados: pagados.length,
    pendientes: items.filter((p) => p.estado === "pendiente").length,
  };

  const visible = items.filter((p) =>
    filter === "pagado" ? p.estado === "pagado"
    : filter === "pendiente" ? p.estado === "pendiente"
    : true
  );

  const TABS: { key: Filter; label: string; n: number }[] = [
    { key: "all", label: "Todos", n: items.length },
    { key: "pagado", label: "✅ Pagados", n: stats.pagados },
    { key: "pendiente", label: "⏳ Pendientes", n: stats.pendientes },
  ];

  function money(n: number | null) {
    return "$" + (Number(n) || 0).toLocaleString("es-AR");
  }
  function fmt(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">Pagos · Cobros</h1>
          <p className="text-gray-500 text-xs">{items.length} cobros · en vivo</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/admin/inbox" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">💬 Inbox</Link>
          <Link href="/admin/prospectos" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">🎯 Prospectos</Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { l: "Cobrado", v: money(stats.cobrado), c: "text-neon", r: "border-neon/25" },
            { l: "Pagados", v: stats.pagados, c: "text-white", r: "border-white/10" },
            { l: "Pendientes", v: stats.pendientes, c: "text-orange-400", r: "border-orange-500/25" },
          ].map((s) => (
            <div key={s.l} className={`bg-white/[0.03] border ${s.r} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.c}`} style={{ fontVariantNumeric: "tabular-nums" }}>{s.v}</p>
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

        {loading && <p className="text-gray-500 text-center py-16">Cargando pagos...</p>}
        {error && <p className="text-red-400 text-center py-16">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-gray-400 text-lg mb-2">Todavía no hay cobros</p>
            <p className="text-gray-600 text-sm">Cuando el bot genere un link de pago, aparece acá.</p>
          </div>
        )}

        <div className="space-y-3">
          {visible.map((p) => {
            const pagado = p.estado === "pagado";
            return (
              <div key={p.id} className={`bg-white/[0.03] border rounded-xl px-5 py-4 flex items-center gap-4 ${pagado ? "border-neon/25" : "border-white/10"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${pagado ? "bg-neon/10" : "bg-orange-500/10"}`}>
                  {pagado ? "✅" : "⏳"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-white font-semibold text-sm truncate">{p.concepto || "Cobro"}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      pagado ? "bg-neon/10 text-neon border-neon/30" : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    }`}>{pagado ? "Pagado" : "Pendiente"}</span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    {p.negocio} · +{p.from_number} · {fmt(pagado ? p.paid_at : p.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold ${pagado ? "text-neon" : "text-white"}`} style={{ fontVariantNumeric: "tabular-nums" }}>{money(p.monto)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
