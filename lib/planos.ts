export interface Plano {
  id: "transpetro" | "completo";
  nome: string;
  preco: number;
  periodo: string;
  resumo: string;
  beneficios: string[];
  /** Slugs de concursos incluídos, ou "todos". */
  concursos: string[] | "todos";
  destaque: boolean;
}

export const planos: Plano[] = [
  {
    id: "transpetro",
    nome: "Plano Transpetro",
    preco: 50,
    periodo: "acesso até o dia da prova (29/11/2026)",
    resumo: "Tudo para passar na Transpetro, sem mensalidade.",
    beneficios: [
      "Todo o material e conteúdo programático da Transpetro",
      "Simulados no estilo Cesgranrio com correção comentada",
      "Buscador de vagas e cotas por perfil",
      "Diagnóstico de desempenho e plano de estudos",
      "Acesso até o dia da prova, pagamento único",
    ],
    concursos: ["transpetro-2026"],
    destaque: true,
  },
  {
    id: "completo",
    nome: "Plano Completo",
    preco: 80,
    periodo: "acesso a todos os concursos da plataforma",
    resumo: "Estuda para a Transpetro e para os próximos concursos no mesmo lugar.",
    beneficios: [
      "Tudo do Plano Transpetro",
      "Todos os outros concursos da plataforma",
      "Materiais novos liberados conforme os editais saem",
      "Comparativo de vagas entre concursos",
      "Prioridade no suporte",
    ],
    concursos: "todos",
    destaque: false,
  },
];

export function getPlano(id: string): Plano | undefined {
  return planos.find((p) => p.id === id);
}
