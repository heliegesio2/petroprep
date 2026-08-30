import Link from "next/link";

const links = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#cargos", label: "Cargos e vagas" },
  { href: "#conteudo", label: "O que cai na prova" },
  { href: "#edital", label: "Edital" },
  { href: "#faq", label: "Dúvidas" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="#top" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-black text-white">
            P
          </span>
          <span>
            PetroPrep <span className="text-brand">2027</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#lista"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Entrar na lista
        </Link>
      </nav>
    </header>
  );
}
