const services = [
  {
    icon: "🤖",
    title: "Chatbots con IA",
    description:
      "Atención al cliente automática las 24 hs. Responde consultas, filtra prospectos y cierra ventas sin intervención humana.",
  },
  {
    icon: "💬",
    title: "Automatización WhatsApp",
    description:
      "Respuestas automáticas, seguimiento de clientes, alertas y notificaciones inteligentes directamente en WhatsApp.",
  },
  {
    icon: "📊",
    title: "Dashboards y Reportes",
    description:
      "Visualizá tus métricas clave en tiempo real. Decisiones basadas en datos, no en suposiciones.",
  },
  {
    icon: "📡",
    title: "Monitoreo IoT",
    description:
      "Conectá sensores físicos a tu operación. Alertas automáticas cuando algo sale de parámetros normales.",
  },
  {
    icon: "⚙️",
    title: "Sistemas a Medida",
    description:
      "Gestión de turnos, inventario, presupuestos y más. Soluciones pensadas exactamente para tu negocio.",
  },
];

export default function Services() {
  return (
    <section id="servicios" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            Servicios
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            Empleados digitales para<br className="hidden sm:block" /> cada área de tu negocio
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service.title}
              className="group border border-[#2a2a2a] rounded-2xl p-8 bg-[#111111] transition-all duration-300 hover:border-neon/40 hover:bg-[#131313] hover:shadow-[0_0_30px_rgba(0,255,178,0.04)]"
            >
              <span className="text-4xl mb-5 block">{service.icon}</span>
              <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-neon transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}