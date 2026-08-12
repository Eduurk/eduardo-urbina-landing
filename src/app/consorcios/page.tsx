import { WA_NUMBER } from "@/lib/constants";

export const metadata = {
  title: "Portero Digital · Empleados Digitales para consorcios",
  description:
    "Un asistente con IA que atiende el WhatsApp de tu consorcio 24/7: recibe reclamos, informa expensas y las cobra. Administrá más edificios con menos desgaste.",
};

const WA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Hola Eduardo, administro consorcios y quiero ver el Portero Digital"
)}`;

const dolores = [
  "💬 Mensajes de vecinos a toda hora, de todos los edificios.",
  "🔧 Reclamos que se pierden entre las conversaciones.",
  "💸 Correr detrás de las expensas impagas cada mes.",
  "🚨 Urgencias mezcladas con consultas que se repiten mil veces.",
];

const funciones = [
  { i: "📋", t: "Reclamos con seguimiento", d: "Recibe el reclamo, lo clasifica por urgencia y le da un número. Se acabó el “¿en qué quedó lo del ascensor?”." },
  { i: "💰", t: "Consulta y cobro de expensas", d: "El vecino pregunta cuánto debe y recibe el saldo con un link de pago. Cobrás más rápido." },
  { i: "📢", t: "Comunicados al edificio", d: "“Corte de agua mañana de 9 a 12” llega a todas las unidades en un toque." },
  { i: "🗓️", t: "Reserva de espacios", d: "SUM, parrilla o quincho: el vecino reserva y el portero chequea disponibilidad." },
  { i: "❓", t: "Dudas del reglamento", d: "Horarios, cómo sacar la basura, dónde están los medidores… respondidas al instante." },
  { i: "🚨", t: "Emergencias derivadas", d: "Ante una fuga de gas o alguien en el ascensor, avisa a una persona de inmediato." },
];

const beneficios = [
  { t: "Más edificios, mismo equipo", d: "El portero absorbe lo repetitivo. Vos decidís, no contestás." },
  { t: "Nada se pierde", d: "Cada reclamo queda registrado, con estado y seguimiento." },
  { t: "Cobrás más rápido", d: "Recordatorios de expensas y link de pago directo, sin perseguir a nadie." },
  { t: "Vecinos más conformes", d: "Respuesta al instante, cualquier día y hora. Menos quejas hacia vos." },
];

export default function ConsorciosPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-20 bg-[#0a0a0a]/85 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <span className="font-extrabold tracking-tight">
            Eduardo <span className="text-neon">Urbina</span>
          </span>
          <span className="hidden sm:inline text-xs text-gray-500 font-mono">· Portero Digital</span>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="ml-auto bg-neon text-black font-bold text-sm px-4 py-2 rounded-full hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] transition-all">
            Pedir demo
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="inline-block text-xs font-mono uppercase tracking-[0.2em] text-neon border border-neon/30 rounded-full px-4 py-1.5 mb-6">
          Para administradores de consorcios
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-balance max-w-3xl mx-auto">
          El edificio que se atiende <span className="text-neon">solo, 24/7</span>
        </h1>
        <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
          Portero Digital contesta a los vecinos, registra los reclamos e informa las expensas por WhatsApp
          — para que administres más edificios con menos desgaste.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-9">
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="bg-neon text-black font-bold px-7 py-3.5 rounded-full hover:shadow-[0_0_24px_rgba(0,255,178,0.35)] transition-all">
            Ver una demo en vivo →
          </a>
          <a href="#como" className="border border-white/15 text-white font-semibold px-7 py-3.5 rounded-full hover:border-neon/40 hover:text-neon transition-colors">
            Cómo funciona
          </a>
        </div>
      </section>

      {/* Dolor */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-neon text-xs font-mono uppercase tracking-[0.2em] text-center mb-3">El día a día que conocés</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-balance">Si administrás consorcios, esto te suena</h2>
        <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">El WhatsApp no para nunca, y entre tanto mensaje se te escapan los reclamos importantes.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {dolores.map((d) => (
            <div key={d} className="bg-white/[0.03] border border-white/10 border-l-2 border-l-orange-500/60 rounded-xl px-5 py-4 text-sm text-gray-200">{d}</div>
          ))}
        </div>
      </section>

      {/* Funciones */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-neon text-xs font-mono uppercase tracking-[0.2em] text-center mb-3">Qué hace por vos</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-balance">Un portero que nunca duerme</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {funciones.map((f) => (
            <div key={f.t} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-neon/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-neon/10 grid place-items-center text-2xl mb-4">{f.i}</div>
              <h3 className="font-semibold mb-2">{f.t}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo chat */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-neon text-xs font-mono uppercase tracking-[0.2em] text-center mb-3">Así de simple para el vecino</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-balance">Una charla, un reclamo resuelto</h2>
        <div className="max-w-sm mx-auto bg-white/[0.03] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-neon/20 grid place-items-center">🏢</div>
            <div>
              <p className="text-sm font-semibold">Portero Digital · Edif. Rivadavia 540</p>
              <p className="text-[11px] text-neon font-mono">● en línea</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="max-w-[82%] bg-white/[0.07] border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2">Hola, se cortó el agua caliente en el 4°B</div>
            <div className="max-w-[82%] ml-auto bg-neon text-black rounded-2xl rounded-br-sm px-3.5 py-2">Uy, qué macana 😕 Ya te registro el reclamo. ¿Es en toda la unidad o solo un baño?</div>
            <div className="max-w-[82%] bg-white/[0.07] border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2">Toda la unidad</div>
            <div className="max-w-[88%] ml-auto bg-neon text-black rounded-2xl rounded-br-sm px-3.5 py-2">Listo ✅ Reclamo <span className="font-mono bg-black/15 px-1.5 rounded">#47</span> registrado y derivado al administrador. Te aviso cuando el plomero tenga fecha.</div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-neon text-xs font-mono uppercase tracking-[0.2em] text-center mb-3">Lo que ganás vos</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-balance">Administrá más, con menos desgaste</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {beneficios.map((b) => (
            <div key={b.t} className="flex gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <span className="text-neon font-bold text-xl">✓</span>
              <div>
                <h3 className="font-semibold text-sm mb-1">{b.t}</h3>
                <p className="text-gray-400 text-sm">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como" className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-neon text-xs font-mono uppercase tracking-[0.2em] text-center mb-3">Cómo se pone en marcha</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-balance">Listo en días, no en meses</h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { n: "1", t: "Conectamos el WhatsApp", d: "Un número dedicado para tu edificio o tu administración." },
            { n: "2", t: "Lo entrenamos", d: "Cargamos el reglamento, los datos de expensas y a quién derivar." },
            { n: "3", t: "Atiende solo", d: "Desde el día uno responde a los vecinos. Vos ves todo en tu panel." },
          ].map((s) => (
            <div key={s.n} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <div className="w-9 h-9 rounded-lg bg-neon/10 text-neon font-mono font-bold grid place-items-center mb-3">{s.n}</div>
              <h3 className="font-semibold mb-1">{s.t}</h3>
              <p className="text-gray-400 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 pt-8 pb-24">
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 text-center">
          <p className="text-neon text-xs font-mono uppercase tracking-[0.2em] mb-3">Probalo sin compromiso</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Mirá al Portero Digital en acción</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Te muestro una demo en vivo y te armo una propuesta para tus edificios.</p>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-neon text-black font-bold px-8 py-4 rounded-full hover:shadow-[0_0_24px_rgba(0,255,178,0.35)] transition-all">
            Hablar por WhatsApp →
          </a>
          <p className="text-gray-600 text-xs font-mono mt-6">Eduardo Urbina · Empleados Digitales · Necochea</p>
        </div>
      </section>
    </main>
  );
}
