const projects = [
  {
    initial: "I",
    name: "InmoBot",
    tag: "Chatbot IA",
    description:
      "Chatbot inmobiliario que filtra consultas, agenda visitas y responde preguntas sobre propiedades las 24 hs.",
    gradient: "from-emerald-900/30 to-teal-900/20",
    tagStyle: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    link: "https://inmobot-two.vercel.app",
  },
  {
    initial: "P",
    name: "PresuBot",
    tag: "Automatización",
    description:
      "Genera presupuestos automáticos por WhatsApp con IA, calcula precios y envía PDFs al instante.",
    gradient: "from-blue-900/30 to-indigo-900/20",
    tagStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    link: "https://presubot.vercel.app",
  },
  {
    initial: "T",
    name: "Sistema de Turnos",
    tag: "Sistema a medida",
    description:
      "Agenda digital con confirmaciones automáticas, recordatorios por WhatsApp y panel de administración.",
    gradient: "from-purple-900/30 to-violet-900/20",
    tagStyle: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    link: "https://app.turnosbarberlink.com",
  },
  {
    initial: "S",
    name: "SensorIA",
    tag: "IoT",
    description:
      "Monitoreo de sensores industriales con alertas en tiempo real y dashboard de visualización.",
    gradient: "from-orange-900/30 to-amber-900/20",
    tagStyle: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  },
  {
    initial: "B",
    name: "Bot de Pedidos",
    tag: "Chatbot IA",
    description:
      "Asistente para gastronomía que toma pedidos, gestiona el menú y avisa a cocina automáticamente.",
    gradient: "from-rose-900/30 to-pink-900/20",
    tagStyle: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  },
  {
    initial: "C",
    name: "Sistema Concesionario",
    tag: "Sistema a medida",
    description:
      "Gestión vehicular completa: stock, clientes, test drives, financiaciones y reportes automáticos.",
    gradient: "from-slate-800/50 to-gray-800/30",
    tagStyle: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    link: "https://concesibot.vercel.app",
  },
];

export default function Portfolio() {
  return (
    <section id="portafolio" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            Portafolio
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            Proyectos que ya funcionan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const inner = (
              <>
                <div
                  className={`h-44 bg-gradient-to-br ${project.gradient} flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
                  <span className="relative text-6xl font-bold text-white/10 group-hover:text-white/15 transition-colors duration-300 select-none">
                    {project.initial}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-white">
                      {project.name}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium ${project.tagStyle}`}
                    >
                      {project.tag}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>
                  {project.link ? (
                    <span className="text-neon text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                      Ver proyecto <span>→</span>
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs">Próximamente</span>
                  )}
                </div>
              </>
            );

            return project.link ? (
              <a
                key={project.name}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-[#2a2a2a] rounded-2xl overflow-hidden bg-[#0f0f0f] hover:border-neon/40 hover:shadow-[0_0_20px_rgba(0,255,178,0.05)] transition-all duration-300 flex flex-col"
              >
                {inner}
              </a>
            ) : (
              <div
                key={project.name}
                className="group border border-[#2a2a2a] rounded-2xl overflow-hidden bg-[#0f0f0f] transition-all duration-300 flex flex-col"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}