import Link from "next/link";
import { WA_LINK_GENERAL } from "@/lib/constants";

const WhatsAppIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,178,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,178,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,255,178,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <span className="inline-block text-neon text-xs font-semibold tracking-[0.2em] uppercase mb-8 border border-neon/30 px-4 py-2 rounded-full">
          Eduardo Urbina · IA &amp; Automatización
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-white mb-6">
          Tu próximo empleado{" "}
          <span className="text-neon">no duerme</span>,{" "}
          no falta y trabaja{" "}
          <span className="text-neon">24/7</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Desarrollo asistentes virtuales y sistemas con inteligencia artificial
          para que tu negocio opere solo, responda clientes y genere resultados
          sin depender de un equipo grande.
        </p>

        <Link
          href={WA_LINK_GENERAL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-neon text-black font-semibold px-8 py-4 rounded-full text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,178,0.35)]"
        >
          <WhatsAppIcon />
          Hablemos por WhatsApp
        </Link>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}