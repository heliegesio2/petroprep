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

  // Detecção de conexão + re-tentativa automática de navegação/Server Action que
  // falha por falta de rede. Expõe o hook useOffline (usado no banner).
  experimental: {
    useOffline: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // O service worker nunca pode ser cacheado: o browser precisa sempre
        // pegar a versão nova para detectar atualização.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
