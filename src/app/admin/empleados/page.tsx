"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Connection {
  id: string;
  owner_label: string | null;
  business_name: string | null;
  phone_number_id: string;
  display_phone_number: string | null;
  status: string | null;
  system_prompt: string | null;
  created_at: string | null;
}

const PROMPT_PLACEHOLDER = `Ejemplo — reemplazá con los datos del cliente:

Sos la asistente virtual de [NOMBRE DEL NEGOCIO], en [CIUDAD]. Atendés por WhatsApp 24/7.

TU OBJETIVO: [qué tiene que lograr — agendar turnos, informar, filtrar leads].

CÓMO HABLÁS: español rioplatense, cálido y profesional. Mensajes cortos (2-3 oraciones). Una pregunta por vez.

INFORMACIÓN DEL NEGOCIO:
- Horarios: ...
- Servicios y precios de referencia: ...
- Ubicación / zona: ...
- Medios de pago / obras sociales: ...

REGLAS: no inventes precios; ante [urgencias/casos delicados] derivá a un humano.`;

export default function EmpleadosPage() {
  const router = useRouter();
  const [conns, setConns] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bizName, setBizName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  function getSecret() {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") ?? "" : "";
  }

  async function load() {
    const secret = getSecret();
    if (!secret) { router.replace("/admin"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp/connections", {
        headers: { "x-admin-secret": secret },
      });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      setConns(data.connections ?? []);
    } catch {
      setError("Error cargando empleados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const selected = conns.find((c) => c.phone_number_id === selectedId) ?? null;

  function selectConn(c: Connection) {
    setSelectedId(c.phone_number_id);
    setBizName(c.business_name ?? "");
    setPrompt(c.system_prompt ?? "");
    setSavedAt(0);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/whatsapp/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-secret": getSecret() },
        body: JSON.stringify({
          phone_number_id: selected.phone_number_id,
          business_name: bizName,
          system_prompt: prompt,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error ?? "No se pudo guardar");
      } else {
        setSavedAt(Date.now());
        setConns((prev) =>
          prev.map((c) =>
            c.phone_number_id === selected.phone_number_id
              ? { ...c, business_name: bizName, system_prompt: prompt }
              : c
          )
        );
      }
    } catch {
      setError("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    selected != null &&
    (bizName !== (selected.business_name ?? "") || prompt !== (selected.system_prompt ?? ""));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">Empleados Digitales</h1>
          <p className="text-gray-500 text-xs">{conns.length} conectados · editá el cerebro de cada uno</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors disabled:opacity-40"
          >
            {loading ? "..." : "↻ Actualizar"}
          </button>
          <Link href="/admin/inbox" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">
            💬 Inbox
          </Link>
          <Link href="/admin/reclamos" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors">
            📋 Reclamos
          </Link>
          <Link href="/admin" className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-white/20 hover:text-white transition-colors">
            DiagnostiBot
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Lista de empleados */}
        <div className="space-y-2">
          {loading && <p className="text-gray-500 text-sm py-10 text-center">Cargando...</p>}
          {!loading && conns.length === 0 && (
            <div className="text-center py-16 border border-white/10 rounded-xl">
              <div className="text-4xl mb-3">🤖</div>
              <p className="text-gray-400 text-sm mb-1">No hay empleados todavía</p>
              <p className="text-gray-600 text-xs px-6">
                Registrá un número en Meta (Cloud API) y aparecerá acá para cargarle el cerebro.
              </p>
            </div>
          )}
          {conns.map((c) => {
            const active = c.phone_number_id === selectedId;
            const hasBrain = !!(c.system_prompt && c.system_prompt.trim());
            return (
              <button
                key={c.id}
                onClick={() => selectConn(c)}
                className={`w-full text-left border rounded-xl px-4 py-3.5 transition-all ${
                  active
                    ? "bg-neon/10 border-neon/40"
                    : "bg-white/[0.03] border-white/10 hover:border-neon/20 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white truncate">
                    {c.business_name || "Sin nombre"}
                  </span>
                  <span
                    className={`ml-auto shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${
                      hasBrain
                        ? "bg-neon/10 text-neon border-neon/30"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                    }`}
                  >
                    {hasBrain ? "Con cerebro" : "Sin cerebro"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  {c.display_phone_number || `ID ${c.phone_number_id}`}
                </p>
              </button>
            );
          })}
        </div>

        {/* Editor */}
        <div>
          {!selected ? (
            <div className="border border-white/10 border-dashed rounded-2xl h-full min-h-[300px] flex items-center justify-center text-center px-8">
              <div>
                <div className="text-4xl mb-3">🧠</div>
                <p className="text-gray-400 text-sm">Elegí un empleado de la izquierda</p>
                <p className="text-gray-600 text-xs mt-1">para escribir o editar su cerebro.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div>
                  <p className="text-white font-semibold">{selected.business_name || "Sin nombre"}</p>
                  <p className="text-gray-500 text-xs font-mono">
                    {selected.display_phone_number || "—"} · ID {selected.phone_number_id}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${(selected.display_phone_number ?? "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-neon border border-neon/30 px-3 py-1.5 rounded-lg hover:bg-neon/10 transition-colors"
                >
                  Probar por WhatsApp ↗
                </a>
              </div>

              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Nombre del negocio
              </label>
              <input
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="Ej: Inmobiliaria Costa Azul"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors mb-5"
              />

              <div className="flex items-baseline justify-between mb-1.5">
                <label className="block text-xs text-gray-500 uppercase tracking-wider">
                  Cerebro (system prompt)
                </label>
                <span className="text-[11px] text-gray-600">{prompt.length} caracteres</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={PROMPT_PLACEHOLDER}
                rows={16}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-700 outline-none focus:border-neon/50 transition-colors font-mono leading-relaxed resize-y"
              />

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={save}
                  disabled={saving || !dirty}
                  className="bg-neon text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : "Guardar cerebro"}
                </button>
                {savedAt > 0 && !dirty && (
                  <span className="text-neon text-xs">✓ Guardado</span>
                )}
                {dirty && !saving && (
                  <span className="text-gray-500 text-xs">Cambios sin guardar</span>
                )}
                {error && <span className="text-red-400 text-xs">{error}</span>}
              </div>

              <p className="text-gray-600 text-xs mt-4 leading-relaxed">
                Al guardar, el empleado empieza a responder con este cerebro en la próxima consulta.
                Si lo dejás vacío, usa un guion genérico por defecto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
