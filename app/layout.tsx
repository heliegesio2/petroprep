import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { OfflineBanner } from "@/components/offline-banner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
const title = "PetroPrep, preparatório para concursos públicos";
const description =
  "Plataforma de estudos para os principais concursos do país. Transpetro 2026 em destaque: simulados no estilo Cesgranrio, conteúdo por cargo e buscador de vagas e cotas por perfil.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | PetroPrep",
  },
  description,
  keywords: [
    "concurso Transpetro",
    "concurso Transpetro 2026",
    "simulado Transpetro",
    "Cesgranrio",
    "concursos 2026",
    "preparatório concurso",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "PetroPrep",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PetroPrep", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#007a3d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <OfflineBanner />
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
