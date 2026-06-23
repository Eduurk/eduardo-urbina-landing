import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <section id="contacto" className="py-24 px-6 bg-[#0d0d0d]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div>
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            Contacto
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-5 leading-tight">
            Contame tu negocio y te muestro qué{" "}
            <span className="text-neon">empleado digital</span> necesitás
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Completá el formulario y te abro WhatsApp con toda la info.
            En una charla corta analizamos qué procesos podés automatizar
            y cuánto tiempo y plata te ahorrás.
          </p>

          <ul className="space-y-3">
            {[
              "Respuesta en menos de 24 hs",
              "Diagnóstico gratuito de tu negocio",
              "Sin compromiso de contratación",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-neon text-base leading-none">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form */}
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}