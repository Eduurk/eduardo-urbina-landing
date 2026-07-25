import FadeIn, { StaggerContainer, StaggerItem } from "@/components/FadeIn";

const reasons = [
  {
    icon: "📍",
    title: "Base local en Necochea",
    subtitle: "Hablás siempre conmigo",
    description:
      "No es un call center ni una agencia con soporte por ticket. Estoy acá, entiendo cómo trabaja la PyME de la zona y respondo yo. Nos podemos juntar a tomar un café si hace falta.",
  },
  {
    icon: "🟢",
    title: "Sistemas ya en producción",
    subtitle: "Respondiendo clientes hoy",
    description:
      "No te vendo una promesa: ya tengo empleados digitales funcionando en inmobiliarias, gimnasios y talleres, contestando mensajes reales todos los días. Te muestro casos concretos.",
  },
  {
    icon: "🎯",
    title: "Un solo responsable",
    subtitle: "Lo desarrollo, instalo y mantengo yo",
    description:
      "De la primera charla al soporte, tratás con la misma persona. Sin intermediarios, sin idas y vueltas entre áreas, sin costos de estructura que terminás pagando vos.",
  },
];

export default function WhyMe() {
  return (
    <section id="por-que" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            ¿Por qué elegirme?
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            Lo que me diferencia
          </h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10" staggerDelay={0.15}>
          {reasons.map((reason) => (
            <StaggerItem key={reason.title}>
              <div className="text-center px-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-neon/25 bg-neon/5 mb-6 text-4xl">
                  {reason.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {reason.title}
                </h3>
                <p className="text-neon text-sm font-medium mb-4">
                  {reason.subtitle}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {reason.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}