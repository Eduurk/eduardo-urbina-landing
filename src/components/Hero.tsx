import AIOrb3D from "@/components/AIOrb3D";
import ConnectWhatsAppButton from "@/components/ConnectWhatsAppButton";


export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden pt-16">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        src="/hero-bg.mp4"
      />
      {/* Overlay oscuro para que el texto sea legible */}
      <div className="absolute inset-0 bg-[#0a0a0a]/60 pointer-events-none" />
      {/* Radial center glow encima del video */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,255,178,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        {/* Text side */}
        <div className="flex-1 text-center lg:text-left">
          <span className="inline-block text-neon text-xs font-semibold tracking-[0.2em] uppercase mb-8 border border-neon/30 px-4 py-2 rounded-full">
            Eduardo Urbina · IA &amp; Automatización
          </span>

          <h1 className="text-4xl sm:text-6xl lg:text-6xl font-bold leading-[1.1] text-white mb-6">
            Tu próximo empleado{" "}
            <span className="text-neon">no duerme</span>,{" "}
            no falta y trabaja{" "}
            <span className="text-neon">24/7</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
            Desarrollo asistentes virtuales y sistemas con inteligencia artificial
            para que tu negocio opere solo, responda clientes y genere resultados
            sin depender de un equipo grande.
          </p>

          <ConnectWhatsAppButton />
        </div>

        {/* Orb side */}
        <div className="flex-1 flex items-center justify-center">
          <AIOrb3D />
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}