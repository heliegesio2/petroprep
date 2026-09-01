import Link from "next/link";
import { concursoDestaque, formatData } from "@/lib/concursos";
import { lerSessao, ehAdmin } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";

const links = [
  { href: "/", label: "Vagas" },
  { href: "/simulado", label: "Simulados" },
  { href: "/ranking", label: "Ranking" },
  { href: "/planos", label: "Planos" },
  { href: "/duvidas", label: "Dúvidas" },
];

export async function SiteNav() {
  const sessao = await lerSessao();

  return (
    <>
      <div className="bg-[#062a1c] px-4 py-2 text-center text-xs text-white/90">
        <span className="font-semibold text-accent">
          {concursoDestaque.tituloCompleto}
        </span>{" "}
        {concursoDestaque.inscricoesAte
          ? `inscrições até ${formatData(concursoDestaque.inscricoesAte)}.`
          : "edital em breve."}{" "}
        <Link href="/planos" className="font-semibold underline underline-offset-2">
          Ver os planos
        </Link>
      </div>

      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-black text-white">
              P
            </span>
            <span>PetroPrep</span>
          </Link>

          <ul className="hidden items-center gap-6 text-sm text-muted lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {sessao ? (
            <AccountMenu
              nome={sessao.nome}
              email={sessao.email}
              avatar={sessao.avatar ?? null}
              admin={ehAdmin(sessao)}
            />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/entrar"
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                Cadastre-se
              </Link>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
