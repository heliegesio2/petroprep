import Link from "next/link";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { concursoDestaque, formatData } from "@/lib/concursos";

const DESTAQUES = [
  "Simulados no estilo Cesgranrio com correção comentada",
  "Conteúdo programático completo, disciplina por disciplina",
  "Buscador de vagas e cotas para o seu perfil",
  "Diagnóstico de desempenho e plano de estudos",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.1fr]">
      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#062a1c] p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm font-black text-[#062a1c]">
            P
          </span>
          PetroPrep
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Sua preparação para a Transpetro, num só lugar.
          </h2>
          <ul className="mt-6 grid gap-3 text-sm text-white/85">
            {DESTAQUES.map((d) => (
              <li key={d} className="flex items-start gap-2.5">
                <CheckCircleIcon
                  size={18}
                  weight="fill"
                  className="mt-0.5 flex-none text-accent"
                  aria-hidden
                />
                {d}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/60">
          {concursoDestaque.banca ? `Banca ${concursoDestaque.banca}` : "Banca definida no edital"}
          {concursoDestaque.dataProva
            ? ` · prova em ${formatData(concursoDestaque.dataProva)}`
            : ""}
        </p>
      </div>
    </div>
  );
}
