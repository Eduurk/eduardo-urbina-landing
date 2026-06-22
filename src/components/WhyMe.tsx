const reasons = [
  {
    icon: "⚡",
    title: "Rápido",
    subtitle: "Entrega en días, no meses",
    description:
      "Trabajo con herramientas modernas y metodología ágil. Tu solución funciona rápido, sin ciclos interminables de revisión ni burocracia.",
  },
  {
    icon: "🧠",
    title: "Inteligente",
    subtitle: "IA real, no decoración",
    description:
      "Uso modelos de lenguaje, automatizaciones con contexto y sistemas que aprenden del uso. No es un chatbot de preguntas frecuentes.",
  },
  {
    icon: "💰",
    title: "Económico",
    subtitle: "Sin equipos grandes",
    description:
      "Un desarrollador especializado es más eficiente que una agencia. Mismo resultado, costo razonable y comunicación directa.",
  },
];

export default function WhyMe() {
  return (
    <section id="por-que" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            ¿Por qué elegirme?
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            Lo que me diferencia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {reasons.map((reason) => (
            <div key={reason.title} className="text-center px-2">
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
          ))}
        </div>
      </div>
    </section>
  );
}