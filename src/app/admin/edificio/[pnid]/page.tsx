"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Reclamo {
  id: number; phone_number_id: string; unidad: string | null; categoria: string | null;
  descripcion: string | null; urgencia: string | null; estado: string | null; created_at: string | null;
}
interface Pago {
  id: number; phone_number_id: string; concepto: string | null; monto: number | null;
  estado: string | null; created_at: string | null; paid_at: string | null;
}

const CAT: Record<string, string> = {
  Plomería: "🔧", Ascensor: "🛗", Electricidad: "⚡", Ruidos: "🔊",
  Limpieza: "🧹", Portón: "🚪", Expensas: "💰", Otro: "📌",
};

export default function EdificioPanel() {
  const router = useRouter();
  const params = useParams();
  const pnid = decodeURIComponent(params.pnid as string);

  const [nombre, setNombre] = useState("Edificio");
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  function getSecret() {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") ?? "" : "";
  }

  async function load() {
    const secret = getSecret();
    if (!secret) { router.replace("/admin"); return; }
    const h = { "x-admin-secret": secret };
    try {
      const [rc, pg, cn] = await Promise.all([
        fetch("/api/admin/reclamos", { headers: h }).then((r) => r.json()),
        fetch("/api/admin/pagos", { headers: h }).then((r) => r.json()),
        fetch("/api/admin/whatsapp/connections", { headers: h }).then((r) => r.json()),
      ]);
      setReclamos((rc.reclamos ?? []).filter((x: Reclamo) => x.phone_number_id === pnid));
      setPagos((pg.pagos ?? []).filter((x: Pago) => x.phone_number_id === pnid));
      const conn = (cn.connections ?? []).find((c: { phone_number_id: string; business_name?: string }) => c.phone_number_id === pnid);
      if (conn?.business_name) setNombre(conn.business_name);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [pnid]);

  const abiertos = reclamos.filter((r) => r.estado !== "resuelto");
  const pagados = pagos.filter((p) => p.estado === "pagado");
  const stats = {
    reclamosAbiertos: abiertos.length,
    urgentes: abiertos.filter((r) => r.urgencia === "urgente").length,
    cobrado: pagados.reduce((a, p) => a + (Number(p.monto) || 0), 0),
    pendientes: pagos.filter((p) => p.estado === "pendiente").length,
  };
  const money = (n: number) => "$" + (Number(n) || 0).toLocaleString("es-AR");
  const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="min-h-screen bg-[#0e1018] text-slate-100">
      {/* Header */}
      <div className="border-b border-indigo-500/15 bg-[#12141f] px-6 py-4 flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 grid place-items-center text-base">🏢</div>
        <div>
          <h1 className="font-bold text-lg leading-tight">{nombre}</h1>
          <p className="text-slate-400 text-xs">Panel del administrador · datos en vivo</p>
        </div>
        <Link href="/admin/empleados" className="ml-auto text-xs text-slate-400 border border-white/10 px-3 py-2 rounded-lg hover:border-indigo-400/40 hover:text-indigo-300 transition-colors">← Empleados</Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Banner IA */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-transparent px-6 py-5 flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 grid place-items-center text-2xl shrink-0">🤖</div>
          <div>
            <p className="font-semibold">La IA atiende el WhatsApp del edificio por vos.</p>
            <p className="text-slate-400 text-sm">Registra reclamos y cobros solo. Vos ves todo acá y decidís.</p>
          </div>
          <span className="ml-auto hidden sm:inline text-[11px] font-mono uppercase tracking-wider text-indigo-300 border border-indigo-400/40 rounded-full px-3 py-1.5">Vos al mando</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { l: "Reclamos abiertos", v: stats.reclamosAbiertos, c: "text-white" },
            { l: "Urgentes", v: stats.urgentes, c: "text-red-400" },
            { l: "Cobrado", v: money(stats.cobrado), c: "text-emerald-400" },
            { l: "Pagos pendientes", v: stats.pendientes, c: "text-amber-400" },
          ].map((s) => (
            <div key={s.l} className="bg-[#161927] border border-white/5 rounded-xl p-4">
              <p className={`text-2xl font-bold ${s.c}`} style={{ fontVariantNumeric: "tabular-nums" }}>{s.v}</p>
              <p className="text-slate-400 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        {loading && <p className="text-slate-500 text-center py-10">Cargando datos del edificio...</p>}

        <div className="grid md:grid-cols-2 gap-5">
          {/* Reclamos */}
          <div className="bg-[#161927] border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">📋 Reclamos <span className="ml-auto text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-400/30 rounded-full px-2 py-0.5">{reclamos.length}</span></h3>
            {reclamos.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">Sin reclamos todavía. Cuando un vecino reporte algo, aparece acá.</p>}
            <div className="divide-y divide-white/5">
              {reclamos.slice(0, 8).map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="text-lg">{CAT[r.categoria ?? "Otro"] ?? "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{r.unidad || "—"} · {r.descripcion}</p>
                    <p className="text-slate-500 text-xs">{r.categoria} · {fmt(r.created_at)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    r.estado === "resuelto" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : r.estado === "curso" ? "bg-indigo-500/10 text-indigo-300 border-indigo-400/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}>
                    {r.estado === "resuelto" ? "Resuelto" : r.estado === "curso" ? "En curso" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Expensas / pagos */}
          <div className="bg-[#161927] border border-white/5 rounded-2xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">💰 Expensas y cobros <span className="ml-auto text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-400/30 rounded-full px-2 py-0.5">{pagos.length}</span></h3>
            {pagos.length === 0 && <p className="text-slate-500 text-sm py-6 text-center">Sin cobros todavía. Cuando el bot genere un link de pago, aparece acá.</p>}
            <div className="divide-y divide-white/5">
              {pagos.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="text-lg">{p.estado === "pagado" ? "✅" : "⏳"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.concepto || "Cobro"}</p>
                    <p className="text-slate-500 text-xs">{fmt(p.estado === "pagado" ? p.paid_at : p.created_at)}</p>
                  </div>
                  <span className={`font-mono font-bold ${p.estado === "pagado" ? "text-emerald-400" : "text-slate-300"}`} style={{ fontVariantNumeric: "tabular-nums" }}>{money(p.monto ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">Vos dirigís · la IA ejecuta · datos reales del edificio</p>
      </div>
    </div>
  );
}
