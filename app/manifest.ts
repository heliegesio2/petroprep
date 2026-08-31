import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PetroPrep - preparatório para concursos",
    short_name: "PetroPrep",
    description:
      "Simulados, conteúdo programático e buscador de vagas para a Transpetro 2026 e outros concursos.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f8f7",
    theme_color: "#007a3d",
    lang: "pt-BR",
    categories: ["education"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
