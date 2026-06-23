import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import WhyMe from "@/components/WhyMe";
import Contact from "@/components/Contact";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <WhyMe />
      <Contact />
      <CtaFinal />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}