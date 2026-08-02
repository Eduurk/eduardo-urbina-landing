"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

type Status = "idle" | "connecting" | "ok" | "error";

export default function ConnectWhatsAppButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) {
      setSdkReady(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v22.0",
      });
      setSdkReady(true);
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/es_LA/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  function handleConnect() {
    if (!sdkReady || !window.FB) return;
    setStatus("idle");
    setErrorMsg("");

    window.FB.login(
      function (response: any) {
        if (response.authResponse && response.authResponse.code) {
          const code = response.authResponse.code;
          setStatus("connecting");
          fetch("/api/whatsapp/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setStatus("ok");
              } else {
                console.error(data);
                setStatus("error");
                setErrorMsg("No se pudo completar la conexión. Volvé a intentar o escribinos.");
              }
            })
            .catch((err) => {
              console.error(err);
              setStatus("error");
              setErrorMsg("Error de red. Revisá tu conexión y probá de nuevo.");
            });
        } else {
          console.log("El usuario canceló o no completó el flujo");
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      }
    );
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-neon/30 bg-neon/10 px-6 py-5 text-center">
        <p className="text-neon font-semibold mb-1">✓ ¡WhatsApp conectado!</p>
        <p className="text-gray-400 text-sm">
          Ya podemos activar tu empleado digital. Te avisamos cuando esté listo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleConnect}
        disabled={!sdkReady || status === "connecting"}
        className="inline-flex items-center gap-2 rounded-full bg-neon px-7 py-3.5 text-black font-bold hover:shadow-[0_0_24px_rgba(0,255,178,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "connecting"
          ? "Conectando..."
          : sdkReady
          ? "Conectar mi WhatsApp"
          : "Cargando..."}
      </button>
      {status === "error" && <p className="text-red-400 text-sm text-center max-w-xs">{errorMsg}</p>}
    </div>
  );
}
