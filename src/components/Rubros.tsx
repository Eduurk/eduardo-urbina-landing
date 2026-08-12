import FadeIn, { StaggerContainer, StaggerItem } from "@/components/FadeIn";

const rubros = [
  {
    icon: "🏠",
    title: "Inmobiliarias",
    desc: "Responde consultas de alquiler y venta, filtra curiosos de interesados reales y agenda las visitas.",
  },
  {
    icon: "✂️",
    title: "Peluquerías y estética",
    desc: "Toma turnos, manda recordatorios para que no falten y cobra la seña por adelantado.",
  },
  {
    icon: "🔧",
    title: "Ferreterías y comercios",
    desc: "Responde stock, precios y envíos, arma el pedido y te lo deja listo para cobrar.",
  },
  {
    icon: "🏢",
    title: "Consorcios",
    desc: "Recibe los reclamos de los vecinos con seguimiento, informa las expensas y las cobra.",
  },
  {
    icon: "🦷",
    title: "Clínicas y consultorios",
    desc: "Agenda turnos, informa obras sociales y precios de referencia y evacúa las dudas frecuentes.",
  },
  {
    icon: "🍔",
    title: "Gastronomía",
    desc: "Toma pedidos y reservas fuera de hora, cobra por adelantado y coordina la entrega.",
  },
];

export default function Rubros() {
  return (
    <section id="rubros" className="py-24 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            Para tu rubro
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            Hecho para cómo trabaja<br className="hidden sm:block" /> tu negocio
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mt-5 max-w-2xl mx-auto">
            El mismo empleado, entrenado con el idioma y las necesidades de tu rubro. Estos son algunos:
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rubros.map((r) => (
            <StaggerItem key={r.title}>
              <div className="group border border-[#2a2a2a] rounded-2xl p-7 bg-[#111111] transition-all duration-300 hover:border-neon/40 hover:bg-[#131313] hover:shadow-[0_0_30px_rgba(0,255,178,0.04)] h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{r.icon}</span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-neon transition-colors duration-300">
                    {r.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{r.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            ¿No ves el tuyo? Lo entrenamos a medida para{" "}
            <span className="text-neon">cualquier negocio</span> con muchas consultas por WhatsApp.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
