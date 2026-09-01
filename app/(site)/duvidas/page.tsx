import type { Metadata } from "next";
import { FaqSection } from "@/components/faq-section";

export const metadata: Metadata = {
  title: "Dúvidas",
  description: "Perguntas frequentes sobre a PetroPrep, os planos e os simulados.",
};

export default function DuvidasPage() {
  return (
    <div className="pt-6">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dúvidas</h1>
      </div>
      <FaqSection />
    </div>
  );
}
