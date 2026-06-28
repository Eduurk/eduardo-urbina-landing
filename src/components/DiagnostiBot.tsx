"use client";

import { useState, useRef, useEffect } from "react";
import { WA_NUMBER } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "intro" | "chat" | "generating" | "result" | "done";
type Message = { role: "user" | "assistant"; content: string };

interface EmpleadoRecomendado {
  nombre: string;
  descripcion: string;
  impacto: string;
  precio_estimado: string;
}

interface Diagnostico {
  rubro: string;
  resumen_negocio: string;
  problemas_detectados: string[];
  procesos_automatizables: string[];
  empleados_digitales_recomendados: EmpleadoRecomendado[];
  ahorro_estimado: { horas_semanales: number; descripcion: string };
  prioridad: "alta" | "media" | "baja";
  notas_comerciales: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DiagnostiBot() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const INITIAL_BOT_MSG =
    "Hola! Soy DiagnostiBot, el asistente de Eduardo Urbina. Voy a hacerte algunas preguntas para entender tu negocio y recomendarte exactamente que empleados digitales te convienen.\n\nEmpecemos: a que se dedica tu negocio?";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function startChat() {
    setMessages([{ role: "assistant", content: INITIAL_BOT_MSG }]);
    setPhase("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/diagnostico/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || "Sin respuesta");
      const botMsg: Message = { role: "assistant", content: data.reply };
      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);

      if (data.done) {
        setTimeout(() => generateDiagnostico(finalMessages), 800);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Hubo un error. Intentá de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function generateDiagnostico(msgs: Message[]) {
    setPhase("generating");
    try {
      const res = await fetch("/api/diagnostico/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversacion: msgs }),
      });
      const data = await res.json();
      if (data.diagnostico) {
        setDiagnostico(data.diagnostico);
        setPhase("result");
      }
    } catch {
      setPhase("chat");
    }
  }

  async function handleSubmitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !whatsapp.trim()) return;
    setSaving(true);

    await fetch("/api/diagnostico/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombre.trim(),
        whatsapp: whatsapp.trim(),
        rubro: diagnostico?.rubro ?? "",
        diagnostico,
        conversacion: messages,
      }),
    }).catch(() => {});

    const waMsg = encodeURIComponent(
      `Hola Eduardo! Soy ${nombre.trim()} y hice el diagnostico de DiagnostiBot. Tengo un negocio de ${diagnostico?.rubro ?? "mi rubro"} y me gustaria recibir la propuesta personalizada.`
    );
    window.open(`https://wa.me/${WA_NUMBER.replace(/\D/g, "")}?text=${waMsg}`, "_blank");
    setSaving(false);
    setPhase("done");
  }

  // ─── Render Phases ────────────────────────────────────────────────────────

  if (phase === "intro") return <IntroScreen onStart={startChat} />;
  if (phase === "generating") return <GeneratingScreen />;
  if (phase === "done") return <DoneScreen nombre={nombre} rubro={diagnostico?.rubro ?? ""} />;

  if (phase === "result" && diagnostico) {
    return (
      <ResultScreen
        diagnostico={diagnostico}
        nombre={nombre}
        whatsapp={whatsapp}
        setNombre={setNombre}
        setWhatsapp={setWhatsapp}
        saving={saving}
        onSubmit={handleSubmitLead}
      />
    );
  }

  // Chat phase
  const questionCount = Math.ceil(messages.filter((m) => m.role === "assistant").length);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <a href="/" className="text-gray-500 hover:text-white text-sm transition-colors mr-2">
          ← Volver
        </a>
        <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
        <span className="text-white font-semibold text-sm">DiagnostiBot — En línea</span>
        <span className="ml-auto text-xs text-gray-600">
          Pregunta {Math.min(questionCount, 7)} de ~7
        </span>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-neon/20 border border-neon/30 flex items-center justify-center text-sm mr-2 mt-0.5 shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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
            <div className="w-8 h-8 rounded-full bg-neon/20 border border-neon/30 flex items-center justify-center text-sm mr-2 mt-0.5 shrink-0">
              🤖
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3.5">
              <div className="flex gap-1.5 items-center">
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
      <div className="border-t border-white/10 px-4 py-4 max-w-2xl mx-auto w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu respuesta..."
            disabled={loading}
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-neon text-black font-semibold px-5 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        <p className="text-xs text-gray-700 text-center mt-2">
          Diagnostico gratuito · Powered by Claude AI
        </p>
      </div>
    </div>
  );
}

// ─── Sub-screens ─────────────────────────────────────────────────────────────

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,178,0.06) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          Diagnostico gratuito con IA
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
          Descubri que procesos de tu negocio{" "}
          <span className="text-neon">se pueden automatizar</span>
        </h1>

        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          Responde 5-7 preguntas y nuestro asistente con IA detectara exactamente
          que empleados digitales pueden transformar tu operacion.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mb-10">
          {["100% gratuito", "5 minutos", "Diagnostico personalizado", "Sin registro"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="text-neon">✓</span> {item}
            </span>
          ))}
        </div>

        <button
          onClick={onStart}
          className="bg-neon text-black font-bold px-10 py-4 rounded-full text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,178,0.35)] transition-all duration-300"
        >
          Iniciar diagnostico gratuito →
        </button>

        <p className="text-xs text-gray-700 mt-6">
          Al finalizar vas a recibir un informe con recomendaciones especificas para tu negocio
        </p>
      </div>
    </div>
  );
}

function GeneratingScreen() {
  const steps = [
    "Analizando tu negocio...",
    "Identificando procesos automatizables...",
    "Calculando ahorro potencial...",
    "Seleccionando empleados digitales...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-neon/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-neon animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
        </div>
        <h2 className="text-white font-bold text-xl mb-3">Generando tu diagnostico</h2>
        <p className="text-neon text-sm min-h-[20px] transition-all duration-500">{steps[step]}</p>
        <div className="flex justify-center gap-1.5 mt-6">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= step ? "bg-neon" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({
  diagnostico,
  nombre,
  whatsapp,
  setNombre,
  setWhatsapp,
  saving,
  onSubmit,
}: {
  diagnostico: Diagnostico;
  nombre: string;
  whatsapp: string;
  setNombre: (v: string) => void;
  setWhatsapp: (v: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const prioridadColor = {
    alta: "bg-red-500/15 text-red-400 border-red-500/30",
    media: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    baja: "bg-green-500/15 text-green-400 border-green-500/30",
  }[diagnostico.prioridad];

  const totalPrecio = diagnostico.empleados_digitales_recomendados.reduce((acc, e) => {
    const num = parseInt(e.precio_estimado.replace(/\D/g, ""), 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header del diagnostico */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-neon text-xs font-semibold border border-neon/30 px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-neon" />
            Diagnostico completado
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Tu diagnostico para{" "}
            <span className="text-neon">{diagnostico.rubro}</span>
          </h1>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${prioridadColor}`}>
            Prioridad de automatizacion: {diagnostico.prioridad.toUpperCase()}
          </span>
        </div>

        {/* Resumen */}
        <Card className="mb-4">
          <SectionTitle icon="🏢" title="Tu negocio" />
          <p className="text-gray-300 text-sm leading-relaxed">{diagnostico.resumen_negocio}</p>
        </Card>

        {/* Problemas + Procesos */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Card>
            <SectionTitle icon="⚠️" title="Problemas detectados" />
            <ul className="space-y-2">
              {diagnostico.problemas_detectados.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-0.5 shrink-0">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionTitle icon="⚙️" title="Procesos automatizables" />
            <ul className="space-y-2">
              {diagnostico.procesos_automatizables.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-neon mt-0.5 shrink-0">•</span>
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Empleados recomendados */}
        <Card className="mb-4">
          <SectionTitle icon="🤖" title="Empleados digitales recomendados" />
          <div className="space-y-4">
            {diagnostico.empleados_digitales_recomendados.map((emp, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{emp.nombre}</span>
                    <span className="text-xs bg-neon/10 text-neon border border-neon/20 px-2 py-0.5 rounded-full">
                      {emp.precio_estimado}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mb-1">{emp.descripcion}</p>
                  <p className="text-gray-500 text-xs">
                    <span className="text-neon/70">Impacto:</span> {emp.impacto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ahorro estimado */}
        <div className="rounded-xl border border-neon/25 bg-neon/5 p-5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-neon font-semibold text-sm mb-1">
                💰 Ahorro estimado: {diagnostico.ahorro_estimado.horas_semanales}hs/semana
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {diagnostico.ahorro_estimado.descripcion}
              </p>
            </div>
            {totalPrecio > 0 && (
              <div className="text-center shrink-0">
                <p className="text-xs text-gray-500 mb-0.5">Inversion desde</p>
                <p className="text-2xl font-bold text-white">USD {totalPrecio.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead capture */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-white font-bold text-lg mb-1">
            Recibir propuesta personalizada
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Eduardo revisa el diagnostico y te manda una propuesta detallada con precios y tiempos.
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors"
            />
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Tu WhatsApp (ej: 1155554444)"
              required
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-neon/50 transition-colors"
            />
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-neon text-black font-bold py-4 rounded-xl text-base hover:shadow-[0_0_30px_rgba(0,255,178,0.35)] hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                "Enviando..."
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Recibir propuesta personalizada
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function DoneScreen({ nombre, rubro }: { nombre: string; rubro: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-6xl mb-6">🚀</div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Propuesta en camino, {nombre || "listo"}!
        </h2>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Eduardo ya tiene tu diagnostico de{" "}
          <span className="text-neon">{rubro}</span> y te va a contactar en las
          proximas horas con una propuesta detallada.
        </p>
        <div className="rounded-xl border border-neon/20 bg-neon/5 p-4 text-sm text-gray-400 mb-8">
          Mientras tanto, te abrimos WhatsApp para que puedas consultarle cualquier duda directamente.
        </div>
        <a
          href="/"
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          Volver al inicio →
        </a>
      </div>
    </div>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <span className="text-white font-semibold text-sm">{title}</span>
    </div>
  );
}