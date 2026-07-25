"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { WA_LINK } from "@/lib/constants";

const WA_LINK_ROI = `${WA_LINK}?text=Hola%20Eduardo%2C%20calcul%C3%A9%20mi%20ahorro%20con%20tu%20calculadora%20y%20quiero%20automatizar%20mi%20negocio`;

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  display?: string;
};

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  display,
}: SliderProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-semibold text-white">
          {display ?? value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-neon cursor-pointer"
        aria-label={label}
      />
    </div>
  );
}

export default function RoiCalculator() {
  const [messages, setMessages] = useState(40);
  const [minutesPerMsg, setMinutesPerMsg] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(8);
  const [workDays, setWorkDays] = useState(6);
  const BOT_MONTHLY_COST = 50;

  const hoursPerMonth = (messages * minutesPerMsg * workDays * 4.33) / 60;
  const manualCost = hoursPerMonth * hourlyRate;
  const monthlySavings = Math.max(0, manualCost - BOT_MONTHLY_COST);
  const yearlySavings = monthlySavings * 12;

  const maxBar = Math.max(manualCost, BOT_MONTHLY_COST, 1);
  const manualWidth = (manualCost / maxBar) * 100;
  const autoWidth = (BOT_MONTHLY_COST / maxBar) * 100;

  const fmt = (n: number) =>
    n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
  const fmtDec = (n: number) =>
    n.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <section id="calculadora" className="py-24 px-6 bg-background">
      <div className="max-w-xl mx-auto">
        <FadeIn className="text-center mb-12">
          <span className="text-neon text-xs font-semibold tracking-[0.2em] uppercase">
            Calculadora de ahorro
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 leading-tight">
            ¿Cuánto te cuesta responder a mano?
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base">
            Ajustá los datos de tu negocio y calculá tu ahorro con un empleado
            digital.
          </p>
        </FadeIn>

        <FadeIn>
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
            <Slider
              label="Mensajes por día"
              value={messages}
              min={1}
              max={200}
              onChange={setMessages}
            />
            <Slider
              label="Minutos por mensaje"
              value={minutesPerMsg}
              min={0.5}
              max={15}
              step={0.5}
              unit=" min"
              onChange={setMinutesPerMsg}
            />
            <Slider
              label="Costo horario empleado (USD)"
              value={hourlyRate}
              min={1}
              max={50}
              step={0.5}
              display={`$${hourlyRate}`}
              onChange={setHourlyRate}
            />
            <Slider
              label="Días hábiles por semana"
              value={workDays}
              min={1}
              max={7}
              step={1}
              unit={workDays === 1 ? " día" : " días"}
              onChange={setWorkDays}
            />

            {/* Barra comparativa */}
            <div className="mt-6 mb-2">
              <p className="text-xs text-gray-400 mb-2">
                Costo mensual: manual vs automatizado
              </p>
              <div className="space-y-2">
                <div className="h-7 bg-white/5 rounded-md relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-red-500/80 rounded-md transition-all duration-500"
                    style={{ width: `${manualWidth}%` }}
                  />
                </div>
                <div className="h-7 bg-white/5 rounded-md relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-neon rounded-md transition-all duration-500"
                    style={{ width: `${autoWidth}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-red-400">● Manual</span>
                <span className="text-neon">● Con empleado digital</span>
              </div>
            </div>

            {/* Resultados */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Horas al mes</p>
                <p className="text-2xl font-bold tabular-nums text-white">
                  {fmtDec(hoursPerMonth)}
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Costo mensual manual</p>
                <p className="text-2xl font-bold tabular-nums text-red-400">
                  ${fmt(manualCost)}
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Ahorro mensual</p>
                <p className="text-2xl font-bold tabular-nums text-neon">
                  ${fmt(monthlySavings)}
                </p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Ahorro anual</p>
                <p className="text-2xl font-bold tabular-nums text-neon">
                  ${fmt(yearlySavings)}
                </p>
              </div>
            </div>

            {/* CTA */}
            <a
              href={WA_LINK_ROI}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-6 py-3.5 text-center bg-neon text-black rounded-xl font-bold hover:shadow-[0_0_25px_rgba(0,255,178,0.35)] transition-shadow"
            >
              Quiero automatizar mi negocio
            </a>
            <p className="text-[11px] text-gray-500 text-center mt-3">
              Precio de referencia. El costo real depende de tu operación.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
