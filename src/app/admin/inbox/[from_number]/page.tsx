"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  message_body: string;
  direction: "inbound" | "outbound";
  created_at: string;
}

interface Conversation {
  from_number: string;
  bot_active: boolean;
}

export default function ThreadPage() {
  const router = useRouter();
  const params = useParams();
  const fromNumber = decodeURIComponent(params.from_number as string);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [toggling, setToggling] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function getSecret() {
    return typeof window !== "undefined" ? sessionStorage.getItem("admin_secret") ?? "" : "";
  }

  async function load() {
    const secret = getSecret();
    if (!secret) { router.replace("/admin"); return; }

    const [msgRes, convRes] = await Promise.all([
      fetch(`/api/admin/whatsapp/messages?from_number=${encodeURIComponent(fromNumber)}`, {
        headers: { "x-admin-secret": secret },
      }),
      fetch("/api/admin/whatsapp/conversations", {
        headers: { "x-admin-secret": secret },
      }),
    ]);

    if (msgRes.status === 401) { router.replace("/admin"); return; }

    const msgData = await msgRes.json();
    const convData = await convRes.json();

    setMessages(msgData.messages ?? []);
    const thisConv = (convData.conversations ?? []).find(
      (c: Conversation) => c.from_number === fromNumber
    );
    setConv(thisConv ?? { from_number: fromNumber, bot_active: true });
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 8000);
    return () => clearInterval(interval);
  }, [fromNumber]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    const secret = getSecret();

    const res = await fetch("/api/admin/whatsapp/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ from_number: fromNumber, message: reply }),
    });

    if (res.ok) {
      setReply("");
      await load();
    } else {
      const err = await res.json();
      alert("Error enviando: " + JSON.stringify(err.error));
    }
    setSending(false);
  }

  async function toggleBot() {
    if (!conv || toggling) return;
    setToggling(true);
    const newVal = !conv.bot_active;
    const secret = getSecret();

    const res = await fetch("/api/admin/whatsapp/toggle-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ from_number: fromNumber, bot_active: newVal }),
    });

    if (res.ok) setConv({ ...conv, bot_active: newVal });
    setToggling(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4 shrink-0">
        <Link href="/admin/inbox" className="text-gray-400 hover:text-white transition-colors text-xl leading-none">
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">+{fromNumber}</p>
          {conv && (
            <p className={`text-xs ${conv.bot_active ? "text-neon" : "text-orange-400"}`}>
              {conv.bot_active ? "Bot activo — respondiendo automáticamente" : "Modo manual — vos respondés"}
            </p>
          )}
        </div>
        {conv && (
          <button
            onClick={toggleBot}
            disabled={toggling}
            className={`text-xs px-4 py-2 rounded-full border transition-all disabled:opacity-50 shrink-0 ${
              conv.bot_active
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                : "bg-neon/10 border-neon/30 text-neon hover:bg-neon/20"
            }`}
          >
            {toggling ? "..." : conv.bot_active ? "Tomar control" : "Activar bot"}
          </button>
        )}
      </div>

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
        {loading && (
          <p className="text-gray-500 text-center py-10">Cargando mensajes...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-gray-600 text-center py-10">Sin mensajes todavía</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.direction === "outbound"
                  ? "bg-neon text-black rounded-br-sm"
                  : "bg-white/[0.07] text-white border border-white/10 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.message_body}</p>
              <p
                className={`text-xs mt-1 ${
                  m.direction === "outbound" ? "text-black/40" : "text-gray-600"
                }`}
              >
                {formatTime(m.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <form
        onSubmit={sendReply}
        className="border-t border-white/10 px-6 py-4 flex gap-3 items-end shrink-0"
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendReply(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Escribí tu respuesta... (Enter para enviar, Shift+Enter para nueva línea)"
          rows={2}
          className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors resize-none"
        />
        <button
          type="submit"
          disabled={sending || !reply.trim()}
          className="bg-neon text-black font-bold px-5 py-3 rounded-xl text-sm hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all disabled:opacity-40 shrink-0"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}