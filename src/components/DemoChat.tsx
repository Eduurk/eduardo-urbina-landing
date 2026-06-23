"use client";

import { useState, useRef, useEffect } from "react";
import { WA_LINK_DEMO } from "@/lib/constants";

type Scenario = "inmobiliaria" | "restaurante" | "gym";
type Message = { role: "user" | "assistant"; content: string };

const SCENARIOS: { id: Scenario; label: string; emoji: string; hint: string }[] =
  [
    {
      id: "inmobiliaria",
      label: "Inmobiliaria",
      emoji: "🏠",
      hint: "Probá: ¿Qué propiedades tienen disponibles?",
    },
    {
      id: "restaurante",
      label: "Restaurante",
      emoji: "🍽️",
      hint: "Probá: ¿Puedo reservar para esta noche?",
    },
    {
      id: "gym",
      label: "Gym",
      emoji: "💪",
      hint: "Probá: ¿Cuánto sale el plan mensual?",
    },
  ];

const MAX_MESSAGES = 10;

export default function DemoChat() {
  const [scenario, setScenario] = useState<Scenario>("inmobiliaria");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentScenario = SCENARIOS.find((s) => s.id === scenario)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function switchScenario(s: Scenario) {
    setScenario(s);
    setMessages([]);
    setMsgCount(0);
    setInput("");
  }

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading || msgCount >= MAX_MESSAGES) return;

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setMsgCount((c) => c + 1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          scenario,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reply ?? "No pude responder." },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Hubo un error. Intentá de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const limitReached = msgCount >= MAX_MESSAGES;

  return (
    <div className="flex flex-col h-full max-h-[540px] min-h-[420px]">
      {/* Scenario tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => switchScenario(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              scenario === s.id
                ? "bg-neon text-black border-neon"
                : "bg-transparent text-gray-400 border-white/10 hover:border-neon/40 hover:text-white"
            }`}
          >
            <span>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3 mb-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-8">
            <div className="text-4xl">{currentScenario.emoji}</div>
            <div>
              <p className="text-white font-medium text-sm">
                Demo: Recepcionista Digital para {currentScenario.label}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {currentScenario.hint}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {getQuickReplies(scenario).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs border border-neon/30 text-neon px-3 py-1.5 rounded-full hover:bg-neon/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-neon/20 border border-neon/40 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-neon text-black rounded-br-sm font-medium"
                  : "bg-white/[0.06] text-gray-100 rounded-bl-sm border border-white/10"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-neon/20 border border-neon/40 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
              🤖
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neon/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neon/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {limitReached ? (
        <div className="text-center text-sm text-gray-500 border border-white/10 rounded-xl px-4 py-3">
          Demo completada · 10 mensajes máximo ·{" "}
          <a
            href={WA_LINK_DEMO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon hover:underline"
          >
            Hablemos por WhatsApp
          </a>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu mensaje..."
            disabled={loading}
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-neon text-black font-semibold px-4 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
      )}

      <p className="text-center text-xs text-gray-600 mt-2">
        {MAX_MESSAGES - msgCount} mensajes restantes · Demo powered by Claude AI
      </p>
    </div>
  );
}

function getQuickReplies(scenario: Scenario): string[] {
  if (scenario === "inmobiliaria")
    return ["¿Qué propiedades tienen?", "¿Cuánto sale un 2 ambientes?", "¿Dan turnos para visitas?"];
  if (scenario === "restaurante")
    return ["¿Tienen mesa para esta noche?", "¿Cuál es el menú?", "¿Cuánto sale por persona?"];
  return ["¿Cuánto sale el plan?", "¿Qué clases tienen?", "¿Tienen coach personal?"];
}