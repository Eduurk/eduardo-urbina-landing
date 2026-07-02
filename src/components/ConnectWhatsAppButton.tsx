"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function ConnectWhatsAppButton() {
  const [sdkReady, setSdkReady] = useState(false);

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

    window.FB.login(
      function (response: any) {
        if (response.authResponse && response.authResponse.code) {
          const code = response.authResponse.code;
          fetch("/api/whatsapp/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                alert("WhatsApp conectado correctamente");
              } else {
                console.error(data);
                alert("Hubo un error conectando WhatsApp");
              }
            });
        } else {
          console.log("Usuario cancelo el login o no completo el flujo");
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

  return (
    <button
      onClick={handleConnect}
      disabled={!sdkReady}
      className="rounded-full bg-emerald-500 px-6 py-3 text-white font-medium disabled:opacity-50"
    >
      Conectar WhatsApp
    </button>
  );
}