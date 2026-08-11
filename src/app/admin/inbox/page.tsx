"use client";

import { useEffect, useRef, useState } from "react";
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

type Filter = "all" | "human" | "bot";

export default function InboxPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasNew, setHasNew] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const prevLatestRef = useRef<string>("");

  function getSecret() {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") ?? "" : "";
  }

  async function load(isAuto = false) {
    const secret = getSecret();
    if (!secret) { router.replace("/admin"); return; }

    try {
      const res = await fetch("/api/admin/whatsapp/conversations", {
        headers: { "x-admin-secret": secret },
      });
      if (res.status === 401) { router.replace("/admin"); return; }
      const data = await res.json();
      const incoming: Conversation[] = data.conversations ?? [];

      const newLatest = incoming[0]?.last_message_at ?? "";
      if (isAuto && prevLatestRef.current && newLatest > prevLatestRef.current) {
        setHasNew(true);
      }
      if (!isAuto) {
        prevLatestRef.current = newLatest;
        setHasNew(false);
      }

      setConvs(incoming);
    } catch {
      setError("Error cargando conversaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 15000);
    return () => clearInterval(interval);
  }, []);

  function handleRefresh() {
    prevLatestRef.current = convs[0]?.last_message_at ?? "";
    setHasNew(false);
    load();
  }

  function formatTime(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  function isRecent(iso: string | null) {
    if (!iso) return false;
    return Date.now() - new Date(iso).getTime() < 60 * 1000;
  }

  // Una conversación "necesita vos" cuando el bot está apagado (fue escalada o
  // la tomaste manual). Es "urgente" si además el cliente escribió último y espera respuesta.
  const needsHuman = (c: Conversation) => !c.bot_active;
  const isWaiting = (c: Conversation) => !c.bot_active && c.last_direction === "inbound";

  const stats = {
    total: convs.length,
    human: convs.filter(needsHuman).length,
    bot: convs.filter((c) => c.bot_active).length,
    waiting: convs.filter(isWaiting).length,
  };

  const filtered = convs.filter((c) =>
    filter === "human" ? needsHuman(c) : filter === "bot" ? c.bot_active : true
  );

  // Orden: primero las que esperan tu respuesta, luego el resto por fecha desc.
  const visible = [...filtered].sort((a, b) => {
    const wa = isWaiting(a) ? 1 : 0;
    const wb = isWaiting(b) ? 1 : 0;
    if (wa !== wb) return wb - wa;
    return (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "");
  });

  const TABS: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: stats.total },
    { key: "human", label: "🟠 Necesitan vos", count: stats.human },
    { key: "bot", label: "🤖 Bot activo", count: stats.bot },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div>
          <h1 className="text-white font-bold text-lg">WhatsApp Inbox</h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-500 text-xs">{stats.total} conversaciones</p>
            <span className="flex items-center gap-1 text-xs text-neon/70">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse inline-block" />
              en vivo · cada 15s
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`relative text-xs border px-3 py-2 rounded-lg transition-colors ${
              hasNew
                ? "border-neon/50 text-neon bg-neon/10"
                : "border-white/10 text-gray-400 hover:border-neon/30 hover:text-neon"
            }`}
          >
            {hasNew && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-neon rounded-full animate-ping" />
            )}
            ↻ {hasNew ? "¡Nuevo mensaje!" : "Actualizar"}
          </button>
          <Link
            href="/admin/empleados"
            className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors"
          >
            🤖 Empleados
          </Link>
          <Link
            href="/admin/reclamos"
            className="text-xs text-gray-400 border border-white/10 px-3 py-2 rounded-lg hover:border-neon/30 hover:text-neon transition-colors"
          >
            📋 Reclamos
          </Link>
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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Conversaciones", value: stats.total, color: "text-white", ring: "border-white/10" },
            { label: "Necesitan vos", value: stats.human, color: "text-orange-400", ring: "border-orange-500/30" },
            { label: "Bot atendiendo", value: stats.bot, color: "text-neon", ring: "border-neon/25" },
          ].map((s) => (
            <div key={s.label} className={`bg-white/[0.03] border ${s.ring} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Aviso: clientes esperando tu respuesta */}
        {stats.waiting > 0 && (
          <div className="mb-4 rounded-xl bg-orange-500/10 border border-orange-500/30 px-4 py-3 text-sm text-orange-300">
            ⚠️ Tenés <strong>{stats.waiting}</strong>{" "}
            {stats.waiting === 1 ? "cliente esperando" : "clientes esperando"} tu respuesta.
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                filter === t.key
                  ? "border-neon/50 text-neon bg-neon/10"
                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {t.label} <span className="opacity-60">({t.count})</span>
            </button>
          ))}
        </div>

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
        {!loading && !error && convs.length > 0 && visible.length === 0 && (
          <p className="text-gray-600 text-center py-16 text-sm">
            No hay conversaciones en este filtro.
          </p>
        )}

        <div className="space-y-2">
          {visible.map((c) => {
            const waiting = isWaiting(c);
            return (
              <Link
                key={c.id}
                href={`/admin/inbox/${encodeURIComponent(c.from_number)}`}
                className={`flex items-center gap-4 border rounded-xl px-5 py-4 hover:bg-white/[0.05] transition-all ${
                  waiting
                    ? "bg-orange-500/10 border-orange-500/40"
                    : isRecent(c.last_message_at) && c.last_direction === "inbound"
                    ? "bg-neon/5 border-neon/30"
                    : "bg-white/[0.03] border-white/10 hover:border-neon/20"
                }`}
              >
                <div className="relative w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center shrink-0 text-base">
                  👤
                  {isRecent(c.last_message_at) && c.last_direction === "inbound" && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-neon rounded-full border-2 border-[#0a0a0a]" />
                  )}
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
                    {waiting && (
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-500/20 text-orange-300 border-orange-500/40">
                        ⚠ Espera tu respuesta
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs truncate">
                    {c.last_direction === "outbound" ? "Vos: " : ""}
                    {c.last_message ?? "Sin mensajes aún"}
                  </p>
                </div>
                <p className="text-gray-600 text-xs shrink-0">{formatTime(c.last_message_at)}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
