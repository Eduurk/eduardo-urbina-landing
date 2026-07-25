"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "in" | "out"; text: string };

// Conversación real de PyME: cliente pregunta, el "empleado digital" responde solo.
const SCRIPT: Msg[] = [
  { role: "in", text: "Hola, alquilan departamentos?" },
  { role: "out", text: "¡Hola! 👋 Sí. ¿Buscás de 1, 2 o 3 ambientes?" },
  { role: "in", text: "2 ambientes, hasta $350.000" },
  { role: "out", text: "Tengo 3 en esa zona 🏠 Te paso fotos y coordino la visita 📅" },
];

export default function HeroChatAnimation() {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      // Accesibilidad: sin animación, mostramos la conversación completa.
      setCount(SCRIPT.length);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timers.current.push(t);
      });

    async function loop() {
      while (!cancelled) {
        setCount(0);
        setTyping(false);
        await wait(700);

        for (let i = 0; i < SCRIPT.length; i++) {
          if (cancelled) return;
          if (SCRIPT[i].role === "out") {
            setTyping(true);
            await wait(1100);
            if (cancelled) return;
            setTyping(false);
          } else {
            await wait(450);
          }
          setCount(i + 1);
          await wait(750);
        }

        await wait(2600); // Pausa antes de reiniciar el loop.
      }
    }

    loop();

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <div className="relative w-[300px] max-w-full mx-auto">
      {/* Glow detrás del teléfono */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(0,255,178,0.35), transparent 70%)",
        }}
      />

      {/* Teléfono */}
      <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#141414] to-[#0b0b0b] p-2.5 shadow-2xl">
        <div className="rounded-[2rem] bg-[#0a0a0a] overflow-hidden">
          {/* Header estilo WhatsApp */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="w-9 h-9 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center text-base shrink-0">
              🤖
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">
                Tu negocio
              </p>
              <p className="text-neon text-[11px] leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
                en línea · IA
              </p>
            </div>
          </div>

          {/* Área de chat */}
          <div className="h-[300px] flex flex-col justify-end gap-2.5 px-3.5 py-4">
            {SCRIPT.slice(0, count).map((m, i) => (
              <div
                key={i}
                className={`msg-in flex ${
                  m.role === "out" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[13px] leading-snug ${
                    m.role === "out"
                      ? "bg-neon text-black font-medium rounded-br-sm"
                      : "bg-white/[0.07] text-gray-100 border border-white/10 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="msg-in flex justify-end">
                <div className="bg-neon/80 rounded-2xl rounded-br-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/70 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-black/70 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-black/70 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra inferior */}
          <div className="px-3.5 pb-4">
            <div className="flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/10 px-4 py-2.5">
              <span className="text-gray-600 text-xs flex-1">
                Respondido solo, sin vos
              </span>
              <span className="text-neon text-sm">✓✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badge flotante */}
      <div className="absolute -top-3 -right-3 bg-neon text-black text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg rotate-3">
        Responde 24/7
      </div>
    </div>
  );
}
