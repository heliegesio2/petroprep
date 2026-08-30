import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { concurso } from "@/lib/concurso";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const title = "PetroPrep 2027 — Preparatório para o Concurso da Petrobras";
const description =
  "Plataforma de estudos para o próximo concurso da Petrobras: simulados no estilo Cesgranrio, conteúdo programático organizado e um buscador de vagas por escolaridade e área.";

export const metadata: Metadata = {
  metadataBase: new URL(concurso.siteUrl),
  title: {
    default: title,
    template: "%s · PetroPrep 2027",
  },
  description,
  keywords: [
    "concurso Petrobras",
    "concurso Petrobras 2027",
    "simulado Petrobras",
    "Cesgranrio",
    "Transpetro",
    "edital Petrobras",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: concurso.siteUrl,
    siteName: "PetroPrep 2027",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
