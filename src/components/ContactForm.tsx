"use client";

import { useState } from "react";
import { WA_NUMBER } from "@/lib/constants";

const RUBROS = [
  "Inmobiliaria",
  "Gastronomía / Restaurant",
  "Salud / Clínica / Médico",
  "Educación",
  "Comercio / Retail",
  "Construcción / Servicios",
  "Transporte / Logística",
  "Automotriz / Concesionario",
  "Tecnología",
  "Otro",
];

type FormState = "idle" | "submitting" | "success";

export default function ContactForm() {
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const mensaje = `Hola Eduardo! Soy ${nombre}, del rubro ${rubro}. Te contacto desde tu web y quiero saber cómo un empleado digital puede ayudar a mi negocio. Mi WhatsApp es ${whatsapp}.`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`;

    setTimeout(() => {
      setStatus("success");
      window.open(url, "_blank", "noopener,noreferrer");
    }, 400);
  }

  if (status === "success") {
    return (
      <div className="text-center py-10 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon/10 border border-neon/30 mb-5 text-3xl">
          ✓
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          ¡Listo! Te abrí WhatsApp
        </h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Si no se abrió automáticamente,{" "}
          <button
            onClick={() => {
              const mensaje = `Hola Eduardo! Soy ${nombre}, del rubro ${rubro}. Te contacto desde tu web y quiero saber cómo un empleado digital puede ayudar a mi negocio. Mi WhatsApp es ${whatsapp}.`;
              window.open(
                `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(mensaje)}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            className="text-neon underline underline-offset-2"
          >
            tocá acá
          </button>
          .
        </p>
        <button
          onClick={() => {
            setNombre("");
            setRubro("");
            setWhatsapp("");
            setStatus("idle");
          }}
          className="mt-6 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          Tu nombre
        </label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Juan García"
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          Rubro de tu negocio
        </label>
        <select
          required
          value={rubro}
          onChange={(e) => setRubro(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-colors appearance-none cursor-pointer text-white [&>option]:bg-[#111]"
          style={{ colorScheme: "dark" }}
        >
          <option value="" disabled>
            Seleccioná tu rubro
          </option>
          {RUBROS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
          Tu WhatsApp
        </label>
        <input
          type="tel"
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+54 9 11 1234-5678"
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-neon text-black font-semibold py-4 rounded-xl text-sm transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,255,178,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {status === "submitting" ? "Abriendo WhatsApp..." : "Quiero mi Empleado Digital →"}
      </button>

      <p className="text-center text-xs text-gray-600 pt-1">
        Te respondo en menos de 24 hs · Sin compromiso
      </p>
    </form>
  );
}