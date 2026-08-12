import FadeIn, { StaggerContainer, StaggerItem } from "@/components/FadeIn";

const services = [
  {
    icon: "💬",
    title: "Atiende 24/7",
    description:
      "Responde al instante, con memoria de la conversación y en el tono de tu negocio. No duerme, no falta, no se cansa.",
  },
  {
    icon: "🎤",
    title: "Entiende audios",
    description:
      "Tus clientes mandan notas de voz y las entiende igual que un texto. Clave para el WhatsApp argentino.",
  },
  {
    icon: "💳",
    title: "Cobra por vos",
    description:
      "Genera links de pago de MercadoPago al instante y te avisa cuando el cliente pagó. Tu empleado también factura.",
  },
  {
    icon: "📋",
    title: "Toma turnos y pedidos",
    description:
      "Registra cada turno, pedido o reclamo con su seguimiento, para que no se te escape ninguno.",
  },
  {
    icon: "🎯",
    title: "Ordena tus clientes",
    description:
      "Guarda cada prospecto, lo califica por interés y te muestra a quién conviene seguir primero.",
  },
  {
    icon: "🙋",
    title: "Sabe cuándo llamarte",
    description:
      "Cuando hay una venta caliente o un caso que necesita una persona, te pasa la conversación al instante.",
  },
];

export default function Services() {
  return (
    <section id="servicios" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            Qué hace
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            No es un chatbot.<br className="hidden sm:block" /> Es un empleado que trabaja.
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mt-5 max-w-2xl mx-auto">
            Un asistente con IA conectado a tu WhatsApp que no solo responde: agenda, cobra y ordena tu negocio solo.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <StaggerItem key={service.title}>
              <div className="group border border-[#2a2a2a] rounded-2xl p-8 bg-[#111111] transition-all duration-300 hover:border-neon/40 hover:bg-[#131313] hover:shadow-[0_0_30px_rgba(0,255,178,0.04)] h-full">
                <span className="text-4xl mb-5 block">{service.icon}</span>
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-neon transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
