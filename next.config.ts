import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor mínimo em .next/standalone para a imagem Docker de produção.
  // (A Vercel ignora e usa o próprio empacotamento.)
  output: "standalone",

  // A home (app/(site)/page.tsx) lê public/edital/<slug>/*.pdf com fs em tempo de
  // requisição. No runtime serverless da Vercel, arquivos de public/ só entram no
  // bundle da função se listados aqui.
  outputFileTracingIncludes: {
    "/": ["./public/edital/**/*"],
  },
};

export default nextConfig;
