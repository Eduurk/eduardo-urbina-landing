"use client";

export default function AIOrb() {
  return (
    <div className="relative flex items-center justify-center w-[320px] h-[320px] mx-auto select-none">

      {/* Outer glow ring */}
      <div
        className="absolute rounded-full border border-neon/10 animate-[spin_20s_linear_infinite]"
        style={{ width: 300, height: 300 }}
      />

      {/* Orbit ring 1 */}
      <div
        className="absolute rounded-full border border-neon/20 animate-[spin_8s_linear_infinite]"
        style={{ width: 260, height: 260 }}
      >
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_10px_#00FFB2]"
          style={{ top: -5, left: "50%", transform: "translateX(-50%)" }}
        />
      </div>

      {/* Orbit ring 2 - reverse */}
      <div
        className="absolute rounded-full border border-neon/15 animate-[spin_12s_linear_infinite_reverse]"
        style={{ width: 200, height: 200 }}
      >
        <div
          className="absolute w-2 h-2 rounded-full bg-neon/80 shadow-[0_0_8px_#00FFB2]"
          style={{ bottom: -4, left: "50%", transform: "translateX(-50%)" }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-neon/60"
          style={{ top: "50%", right: -3, transform: "translateY(-50%)" }}
        />
      </div>

      {/* Orbit ring 3 */}
      <div
        className="absolute rounded-full border border-neon/10 animate-[spin_6s_linear_infinite]"
        style={{ width: 150, height: 150, transform: "rotate(45deg)" }}
      >
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-neon shadow-[0_0_6px_#00FFB2]"
          style={{ top: -3, left: "50%", transform: "translateX(-50%)" }}
        />
      </div>

      {/* Core orb */}
      <div
        className="absolute rounded-full animate-[pulse_3s_ease-in-out_infinite]"
        style={{
          width: 100,
          height: 100,
          background:
            "radial-gradient(circle at 35% 35%, rgba(0,255,178,0.5) 0%, rgba(0,255,178,0.15) 40%, rgba(0,0,0,0) 70%)",
          boxShadow:
            "0 0 40px rgba(0,255,178,0.3), 0 0 80px rgba(0,255,178,0.1), inset 0 0 30px rgba(0,255,178,0.1)",
          border: "1px solid rgba(0,255,178,0.4)",
        }}
      />

      {/* Inner core shine */}
      <div
        className="absolute rounded-full"
        style={{
          width: 60,
          height: 60,
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,255,178,0.8) 0%, rgba(0,255,178,0.2) 50%, transparent 70%)",
          animation: "pulse 3s ease-in-out infinite 0.5s",
        }}
      />

      {/* Floating particles */}
      {[
        { size: 3, x: -90, y: -60, delay: "0s", dur: "4s" },
        { size: 2, x: 80, y: -80, delay: "1s", dur: "5s" },
        { size: 2, x: 100, y: 40, delay: "2s", dur: "3.5s" },
        { size: 3, x: -70, y: 80, delay: "0.5s", dur: "4.5s" },
        { size: 2, x: 30, y: 110, delay: "1.5s", dur: "4s" },
        { size: 2, x: -110, y: 20, delay: "3s", dur: "5s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-neon"
          style={{
            width: p.size,
            height: p.size,
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
            boxShadow: `0 0 6px #00FFB2`,
            animation: `float ${p.dur} ease-in-out infinite ${p.delay}`,
          }}
        />
      ))}

      {/* Background ambient glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(0,255,178,0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}