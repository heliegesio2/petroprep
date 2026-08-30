import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-background py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/#top" className="flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-xs font-black text-white">
              P
            </span>
            PetroPrep
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link href="/#plataforma" className="hover:text-foreground">Plataforma</Link>
            <Link href="/#vagas" className="hover:text-foreground">Vagas e cotas</Link>
            <Link href="/#conteudo" className="hover:text-foreground">O que cai na prova</Link>
            <Link href="/#edital" className="hover:text-foreground">Edital</Link>
            <Link href="/#planos" className="hover:text-foreground">Planos</Link>
          </nav>
        </div>

        <hr className="my-8" />

        <p className="text-xs leading-relaxed text-muted">
          A PetroPrep é uma iniciativa independente de preparação para concursos e{" "}
          <strong>
            não possui vínculo com a Petrobras, a Transpetro, a Fundação Cesgranrio ou
            qualquer outro órgão público
          </strong>
          . Nomes de órgãos e concursos citados pertencem aos seus respectivos titulares e
          aparecem aqui apenas para fins informativos. Vagas, salários, datas e conteúdos
          são estimativas montadas a partir da imprensa especializada e de editais
          anteriores. Confirme sempre na fonte oficial. As inscrições são feitas somente
          nos canais oficiais.
        </p>
        <p className="mt-4 text-xs text-muted">
          © {new Date().getFullYear()} PetroPrep. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
