import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DiagnostiBotCta from "@/components/DiagnostiBotCta";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Portfolio from "@/components/Portfolio";
import WhyMe from "@/components/WhyMe";
import Demo from "@/components/Demo";
import Contact from "@/components/Contact";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <DiagnostiBotCta />
      <Services />
      <HowItWorks />
      <Portfolio />
      <WhyMe />
      <Demo />
      <Contact />
      <CtaFinal />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}