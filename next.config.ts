import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `output: "standalone"` só para a imagem Docker de produção. Na Vercel ele
  // quebra o passo final do build (ENOENT next-server.js.nft.json), então só
  // liga quando NÃO está rodando na Vercel.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),

  // A home (app/(site)/page.tsx) lê public/edital/<slug>/*.pdf com fs em tempo de
  // requisição. No runtime serverless da Vercel, arquivos de public/ só entram no
  // bundle da função se listados aqui.
  outputFileTracingIncludes: {
    "/": ["./public/edital/**/*"],
  },
};

export default nextConfig;
