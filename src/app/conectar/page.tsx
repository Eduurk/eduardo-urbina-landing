import ConnectWhatsAppButton from "@/components/ConnectWhatsAppButton";

export const metadata = {
  title: "Conectá tu WhatsApp · Empleados Digitales",
  robots: { index: false, follow: false },
};

const PASOS = [
  {
    t: "Tocá “Conectar mi WhatsApp”",
    d: "Se abre una ventana segura de Meta. Iniciás sesión con tu cuenta de Facebook del negocio.",
  },
  {
    t: "Elegí o creá tu cuenta de WhatsApp Business",
    d: "Seguí los pasos que muestra Meta. Autorizás que tu número quede conectado a la plataforma.",
  },
  {
    t: "Listo — activamos tu empleado",
    d: "Tu número aparece de nuestro lado y le cargamos su “cerebro”. En poco tiempo responde solo, 24/7.",
  },
];

export default function ConectarPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <p className="inline-block text-xs font-mono uppercase tracking-widest text-neon border border-neon/30 rounded-full px-3 py-1 mb-5">
            Alta de empleado digital
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-balance">
            Conectá tu WhatsApp
          </h1>
          <p className="text-gray-400 leading-relaxed">
            En un par de pasos dejás tu número listo para que tu empleado digital
            empiece a responder a tus clientes las 24 horas.
          </p>
        </div>

        <ol className="space-y-3 mb-10">
          {PASOS.map((p, i) => (
            <li
              key={i}
              className="flex gap-4 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4"
            >
              <span className="shrink-0 w-8 h-8 rounded-lg bg-neon/10 text-neon font-mono font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-sm">{p.t}</p>
                <p className="text-gray-500 text-sm mt-0.5">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex justify-center">
          <ConnectWhatsAppButton />
        </div>

        <p className="text-center text-gray-600 text-xs mt-8 leading-relaxed">
          Solo pedimos permiso para gestionar tu WhatsApp Business. No accedemos a tus
          chats personales. Cualquier duda, escribinos y te acompañamos en el proceso.
        </p>
      </div>
    </main>
  );
}
