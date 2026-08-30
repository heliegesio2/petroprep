import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-background py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="#top" className="flex items-center gap-2 font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-xs font-black text-white">
              P
            </span>
            PetroPrep 2027
          </Link>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <Link href="#plataforma" className="hover:text-foreground">Plataforma</Link>
            <Link href="#vagas" className="hover:text-foreground">Vagas e cotas</Link>
            <Link href="#conteudo" className="hover:text-foreground">O que cai na prova</Link>
            <Link href="#edital" className="hover:text-foreground">Edital</Link>
            <Link href="#lista" className="hover:text-foreground">Lista de espera</Link>
          </nav>
        </div>

        <hr className="my-8" />

        <p className="text-xs leading-relaxed text-muted">
          A PetroPrep é uma iniciativa independente de preparação para concursos e
          <strong> não possui vínculo com a Petrobras, a Transpetro ou a Fundação
          Cesgranrio</strong>. &quot;Petrobras&quot; e demais nomes citados
          pertencem aos seus respectivos titulares e são usados aqui apenas para
          fins informativos. Datas, vagas e conteúdos apresentados antes da
          publicação do edital são estimativas com base em concursos anteriores.
          As inscrições devem ser feitas somente nos canais oficiais.
        </p>
        <p className="mt-4 text-xs text-muted">
          © {new Date().getFullYear()} PetroPrep. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
