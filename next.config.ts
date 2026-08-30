import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor mínimo em .next/standalone para a imagem Docker de produção.
  output: "standalone",
  images: {
    // Placeholder de imagem enquanto não há fotos reais dos concursos.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
