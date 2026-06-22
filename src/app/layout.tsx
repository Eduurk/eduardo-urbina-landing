import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eduardo Urbina — Empleados Digitales para tu Negocio",
  description:
    "Desarrollo chatbots con IA, automatizaciones WhatsApp, dashboards y sistemas a medida. Tu próximo empleado no duerme, no falta y trabaja 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}