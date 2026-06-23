"use client";

import { useState } from "react";

interface Lead {
  id: string;
  created_at: string;
  nombre: string;
  whatsapp: string;
  rubro: string;
  diagnostico: {
    prioridad: string;
    resumen_negocio: string;
    problemas_detectados: string[];
    procesos_automatizables: string[];
    empleados_digitales_recomendados: {
      nombre: string;
      precio_estimado: string;
      descripcion: string;
    }[];
    ahorro_estimado: { horas_semanales: number; descripcion: string };
    notas_comerciales: string;
  };
}

const PRIORIDAD_COLORS: Record<string, string> = {
  alta: "bg-red-500/15 text-red-400 border-red-500/30",
  media: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  baja: "bg-green-500/15 text-green-400 border-green-500/30",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/leads", {
      headers: { "x-admin-secret": password },
    });

    if (res.status === 401) {
      setError("Contraseña incorrecta");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setLeads(data.leads ?? []);
    setAuthed(true);
    sessionStorage.setItem("admin_secret", password);
    setLoading(false);
  }

  async function refresh() {
    const secret = sessionStorage.getItem("admin_secret") ?? password;
    setLoading(true);
    const res = await fetch("/api/admin/leads", {
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.nombre?.toLowerCase().includes(q) ||
      l.rubro?.toLowerCase().includes(q) ||
      l.whatsapp?.includes(q)
    );
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-white mb-1">Panel Admin</p>
            <p className="text-gray-500 text-sm">Eduardo Urbina · DiagnostiBot</p>
          </div>
          <form onSubmit={login} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-neon text-black font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all disabled:opacity-40"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const stats = {
    total: leads.length,
    alta: leads.filter((l) => l.diagnostico?.prioridad === "alta").length,
    hoy: leads.filter(
      (l) => new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">DiagnostiBot · Panel Admin</h1>
          <p className="text-gray-500 text-xs">Leads y diagnosticos</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors disabled:opacity-40"
          >
            {loading ? "..." : "↻ Actualizar"}
          </button>
          <a
            href="/"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Volver al sitio
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total leads", value: stats.total, color: "text-white" },
            { label: "Prioridad alta", value: stats.alta, color: "text-red-400" },
            { label: "Hoy", value: stats.hoy, color: "text-neon" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center"
            >
              <p className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, rubro o WhatsApp..."
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors mb-4"
        />

        {/* Leads list */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            {leads.length === 0 ? "Todavia no hay leads" : "Sin resultados para esa busqueda"}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => {
              const isOpen = expanded === lead.id;
              const prioridad = lead.diagnostico?.prioridad ?? "media";
              const totalUSD = (lead.diagnostico?.empleados_digitales_recomendados ?? [])
                .reduce((acc, e) => {
                  const n = parseInt(e.precio_estimado?.replace(/\D/g, "") ?? "0", 10);
                  return acc + (isNaN(n) ? 0 : n);
                }, 0);

              return (
                <div
                  key={lead.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
                >
                  {/* Row summary */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : lead.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-white font-medium text-sm">{lead.nombre || "—"}</p>
                        <p className="text-gray-600 text-xs">{formatDate(lead.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">{lead.rubro || "—"}</p>
                        <a
                          href={`https://wa.me/${(lead.whatsapp ?? "").replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-neon text-xs hover:underline"
                        >
                          {lead.whatsapp || "Sin WhatsApp"}
                        </a>
                      </div>
                      <div className="hidden sm:block">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            PRIORIDAD_COLORS[prioridad] ?? PRIORIDAD_COLORS.media
                          }`}
                        >
                          {prioridad.toUpperCase()}
                        </span>
                      </div>
                      <div className="hidden sm:block text-right">
                        {totalUSD > 0 && (
                          <span className="text-neon text-sm font-semibold">
                            USD {totalUSD.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-600 text-lg">{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && lead.diagnostico && (
                    <div className="border-t border-white/10 px-5 py-5 space-y-5">
                      {/* Resumen */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Resumen</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {lead.diagnostico.resumen_negocio}
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        {/* Problemas */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            Problemas detectados
                          </p>
                          <ul className="space-y-1.5">
                            {(lead.diagnostico.problemas_detectados ?? []).map((p, i) => (
                              <li key={i} className="flex gap-2 text-sm text-gray-400">
                                <span className="text-red-400 shrink-0">•</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Procesos */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                            Procesos automatizables
                          </p>
                          <ul className="space-y-1.5">
                            {(lead.diagnostico.procesos_automatizables ?? []).map((p, i) => (
                              <li key={i} className="flex gap-2 text-sm text-gray-400">
                                <span className="text-neon shrink-0">•</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Empleados recomendados */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                          Empleados digitales recomendados
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(lead.diagnostico.empleados_digitales_recomendados ?? []).map((e, i) => (
                            <div
                              key={i}
                              className="border border-white/10 rounded-lg px-3 py-2 text-sm"
                            >
                              <span className="text-white font-medium">{e.nombre}</span>
                              <span className="text-neon ml-2 text-xs">{e.precio_estimado}</span>
                              <p className="text-gray-500 text-xs mt-0.5">{e.descripcion}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ahorro */}
                      {lead.diagnostico.ahorro_estimado && (
                        <div className="rounded-lg bg-neon/5 border border-neon/20 px-4 py-3">
                          <p className="text-neon text-sm font-medium mb-1">
                            Ahorro: {lead.diagnostico.ahorro_estimado.horas_semanales}hs/semana
                          </p>
                          <p className="text-gray-400 text-xs">
                            {lead.diagnostico.ahorro_estimado.descripcion}
                          </p>
                        </div>
                      )}

                      {/* Notas comerciales */}
                      {lead.diagnostico.notas_comerciales && (
                        <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-3">
                          <p className="text-yellow-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                            Notas para la propuesta
                          </p>
                          <p className="text-gray-300 text-sm">
                            {lead.diagnostico.notas_comerciales}
                          </p>
                        </div>
                      )}

                      {/* WhatsApp CTA */}
                      <a
                        href={`https://wa.me/${(lead.whatsapp ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${lead.nombre}! Soy Eduardo Urbina. Vi tu diagnostico de DiagnostiBot y quiero mandarte una propuesta personalizada para tu negocio de ${lead.rubro}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-neon text-black font-bold px-5 py-2.5 rounded-full text-sm hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contactar por WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}