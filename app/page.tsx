import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { FeatureGrid } from "@/components/feature-grid";
import { VagasSection } from "@/components/vagas-section";
import { ConteudoSection } from "@/components/conteudo-section";
import { EditalSection } from "@/components/edital-section";
import { WaitlistSection } from "@/components/waitlist-section";
import { FaqSection } from "@/components/faq-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <VagasSection />
        <ConteudoSection />
        <EditalSection />
        <WaitlistSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
