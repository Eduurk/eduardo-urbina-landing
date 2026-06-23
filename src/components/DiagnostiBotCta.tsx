import Link from "next/link";

const MOCK_CHAT = [
  { role: "bot", text: "A que se dedica tu negocio?" },
  { role: "user", text: "Tengo una inmobiliaria, recibo consultas todo el dia por WhatsApp" },
  { role: "bot", text: "Cuantos mensajes recibis por dia y cuanto tiempo le dedicas a responderlos?" },
];

export default function DiagnostiBotCta() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Fondo degradado neon */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,255,178,0.06) 0%, transparent 50%, rgba(0,255,178,0.03) 100%)",
        }}
      />
      <div className="absolute inset-0 border-y border-neon/10 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            Nuevo · Gratis
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
            Descubri en 5 minutos que procesos de tu negocio{" "}
            <span className="text-neon">pueden funcionar solos</span>
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            DiagnostiBot te hace preguntas sobre tu operacion y genera un informe
            personalizado con exactamente que automatizar y cuanto ahorrarias.
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-10">
            {[
              "Sin registro",
              "5 minutos",
              "Informe con IA",
              "100% gratis",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="text-neon font-bold">✓</span> {item}
              </span>
            ))}
          </div>

          <Link
            href="/diagnostico"
            className="inline-flex items-center gap-3 bg-neon text-black font-bold px-8 py-4 rounded-full text-base hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,178,0.4)] transition-all duration-300"
          >
            <span className="text-xl">🤖</span>
            Hacer diagnostico gratis
          </Link>
        </div>

        {/* Right: mock chat preview */}
        <div className="lg:pl-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Chat header */}
            <div className="border-b border-white/10 px-5 py-4 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse" />
              <span className="text-white font-semibold text-sm">DiagnostiBot</span>
              <span className="ml-auto text-xs text-gray-600 border border-white/10 px-2 py-0.5 rounded-full">
                En linea
              </span>
            </div>

            {/* Mock messages */}
            <div className="p-5 space-y-4">
              {MOCK_CHAT.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-neon/20 border border-neon/30 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-neon text-black rounded-br-sm font-medium"
                        : "bg-white/[0.06] text-gray-200 rounded-bl-sm border border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-neon/20 border border-neon/30 flex items-center justify-center text-xs mr-2 mt-0.5 shrink-0">
                  🤖
                </div>
                <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon/60 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neon/60 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neon/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado preview */}
            <div className="border-t border-white/10 mx-5 mb-5 mt-2 rounded-xl bg-neon/5 border-neon/20 border p-4">
              <p className="text-xs text-neon font-semibold mb-2">
                Diagnostico listo para tu negocio
              </p>
              <div className="space-y-1">
                {["Recepcionista Digital WhatsApp · USD 490", "Seguimiento de leads automatico · USD 990"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-neon">✓</span>
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-700 text-center mt-4">
            El diagnostico real es personalizado segun tu negocio
          </p>
        </div>
      </div>
    </section>
  );
}