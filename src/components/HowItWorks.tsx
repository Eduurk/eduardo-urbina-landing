import FadeIn, { StaggerContainer, StaggerItem } from "@/components/FadeIn";

const steps = [
  {
    number: "01",
    icon: "💬",
    title: "Conversamos",
    description:
      "Me contás tu negocio, qué procesos te consumen tiempo y qué querés automatizar. Sin tecnicismos, en una charla de 20 minutos.",
  },
  {
    number: "02",
    icon: "⚙️",
    title: "Configuro tu empleado",
    description:
      "Desarrollo tu asistente digital a medida. En días —no meses— tenés algo funcionando real, probado con casos de tu negocio.",
  },
  {
    number: "03",
    icon: "🚀",
    title: "Tu negocio trabaja solo",
    description:
      "Lo integramos a WhatsApp, tu web o donde necesités. Desde el día uno responde, agenda y opera las 24 hs sin que muevas un dedo.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            El proceso
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            Cómo funciona
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
            De cero a tu empleado digital activo en menos de una semana.
          </p>
        </FadeIn>

        {/* Desktop: horizontal stepper */}
        <StaggerContainer className="hidden md:grid grid-cols-3 gap-0 relative" staggerDelay={0.2}>
          {/* Connecting line */}
          <div className="absolute top-10 left-[calc(16.67%+1px)] right-[calc(16.67%+1px)] h-px bg-gradient-to-r from-neon/40 via-neon/20 to-neon/40" />

          {steps.map((step, i) => (
            <StaggerItem key={step.number}>
              <div className="flex flex-col items-center text-center px-8">
                <div className="relative z-10 mb-8">
                  <div className="w-20 h-20 rounded-full border-2 border-neon/40 bg-[#0d0d0d] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0,255,178,0.08)]">
                    {step.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neon text-black text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Mobile: vertical stepper */}
        <StaggerContainer className="md:hidden flex flex-col gap-0" staggerDelay={0.2}>
          {steps.map((step, i) => (
            <StaggerItem key={step.number}>
              <div className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-neon/40 bg-[#0d0d0d] flex items-center justify-center text-2xl">
                      {step.icon}
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon text-black text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-neon/30 to-transparent my-3" />
                  )}
                </div>
                <div className="pb-10 pt-1">
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}