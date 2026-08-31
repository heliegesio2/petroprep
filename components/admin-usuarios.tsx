"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  PlusIcon,
  UserPlusIcon,
} from "@phosphor-icons/react/dist/ssr";

const inputBase =
  "rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

const STATUS_LABEL: Record<string, string> = {
  nenhum: "Sem plano",
  pendente: "Pagamento pendente",
  ativo: "Ativo",
};

interface PlanoOpcao {
  id: string;
  nome: string;
}

interface UsuarioAdmin {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  plano: string | null;
  planoStatus: string;
  planoAte: string | null;
  temSenha: boolean;
  provedores: string[];
  tentativas: number;
  criadoEm: string;
}

function formatarData(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function LinhaUsuario({
  usuario,
  planos,
}: {
  usuario: UsuarioAdmin;
  planos: PlanoOpcao[];
}) {
  const router = useRouter();
  const [plano, setPlano] = useState(usuario.plano ?? "");
  const [status, setStatus] = useState(
    usuario.plano ? usuario.planoStatus : "nenhum",
  );
  const [ate, setAte] = useState(
    usuario.planoAte ? usuario.planoAte.slice(0, 10) : "",
  );
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  const sujo =
    plano !== (usuario.plano ?? "") ||
    status !== (usuario.plano ? usuario.planoStatus : "nenhum") ||
    ate !== (usuario.planoAte ? usuario.planoAte.slice(0, 10) : "");

  async function salvar() {
    setSalvando(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plano,
          planoStatus: plano ? status : "nenhum",
          planoAte: plano && status === "ativo" ? ate : "",
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setMsg({ tipo: "erro", texto: data.message ?? "Não foi possível salvar." });
        setSalvando(false);
        return;
      }
      setMsg({ tipo: "ok", texto: "Plano atualizado." });
      setSalvando(false);
      router.refresh();
    } catch {
      setMsg({ tipo: "erro", texto: "Falha de conexão." });
      setSalvando(false);
    }
  }

  const acessos = [
    usuario.temSenha ? "e-mail e senha" : null,
    ...usuario.provedores,
  ].filter(Boolean);

  return (
    <li className="rounded-2xl border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <p className="font-medium">{usuario.nome}</p>
          <p className="truncate text-sm text-muted">
            {usuario.email ?? "sem e-mail"}
            {usuario.telefone ? ` · ${usuario.telefone}` : ""}
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <p>cadastro {formatarData(usuario.criadoEm)}</p>
          <p>{usuario.tentativas} simulados</p>
        </div>
      </div>

      <p className="mt-1 text-xs text-muted">
        Acesso por: {acessos.length ? acessos.join(", ") : "nenhum"}
      </p>

      <div className="mt-3 grid gap-2 border-t pt-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1 text-xs font-medium">
          Plano
          <select
            value={plano}
            onChange={(e) => {
              setPlano(e.target.value);
              if (e.target.value && status === "nenhum") setStatus("ativo");
            }}
            className={inputBase}
          >
            <option value="">Sem plano</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-xs font-medium">
          Situação
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={!plano}
            className={inputBase}
          >
            <option value="nenhum">Sem plano</option>
            <option value="pendente">Pagamento pendente</option>
            <option value="ativo">Ativo</option>
          </select>
        </label>

        {plano && status === "ativo" ? (
          <label className="grid gap-1 text-xs font-medium">
            Acesso até
            <input
              type="date"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className={inputBase}
              title="Em branco: calcula pela data da prova do plano"
            />
          </label>
        ) : (
          <span className="hidden sm:block" />
        )}

        <button
          type="button"
          onClick={salvar}
          disabled={!sujo || salvando}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-40 sm:col-start-3"
        >
          {salvando ? "Salvando" : "Salvar"}
        </button>
      </div>

      <p className="mt-2 text-xs text-muted">
        Hoje: {usuario.plano ? STATUS_LABEL[usuario.planoStatus] ?? usuario.planoStatus : "Sem plano"}
        {usuario.plano ? ` · ${planos.find((p) => p.id === usuario.plano)?.nome ?? usuario.plano}` : ""}
        {usuario.planoAte ? ` · até ${formatarData(usuario.planoAte)}` : ""}
      </p>

      {msg && (
        <p
          className={`mt-2 flex items-center gap-1.5 text-xs ${
            msg.tipo === "ok"
              ? "text-brand-strong"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {msg.tipo === "ok" && (
            <CheckCircleIcon size={14} weight="fill" aria-hidden />
          )}
          {msg.texto}
        </p>
      )}
    </li>
  );
}

function NovoUsuario({ planos }: { planos: PlanoOpcao[] }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    const fd = new FormData(e.currentTarget);
    const plano = String(fd.get("plano") ?? "");
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nome: fd.get("nome"),
          email: fd.get("email"),
          telefone: fd.get("telefone"),
          senha: fd.get("senha"),
          plano,
          planoStatus: plano ? "ativo" : "nenhum",
        }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setErro(data.message ?? "Não foi possível criar.");
        setSalvando(false);
        return;
      }
      setSalvando(false);
      setAberto(false);
      router.refresh();
    } catch {
      setErro("Falha de conexão.");
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
      >
        <UserPlusIcon size={16} weight="bold" aria-hidden />
        Cadastrar usuário
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border bg-surface p-4"
    >
      <p className="text-sm font-semibold">Cadastrar usuário</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-medium">
          Nome
          <input name="nome" required className={inputBase} placeholder="Nome completo" />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          E-mail
          <input
            name="email"
            type="email"
            required
            className={inputBase}
            placeholder="pessoa@email.com"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          Telefone <span className="text-muted">(opcional)</span>
          <input name="telefone" className={inputBase} placeholder="(00) 00000-0000" />
        </label>
        <label className="grid gap-1 text-xs font-medium">
          Senha
          <input
            name="senha"
            type="text"
            required
            minLength={8}
            className={inputBase}
            placeholder="mínimo 8 caracteres"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium sm:col-span-2">
          Plano
          <select name="plano" className={inputBase} defaultValue="">
            <option value="">Sem plano</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} (ativo)
              </option>
            ))}
          </select>
        </label>
      </div>

      {erro && <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
        >
          <PlusIcon size={15} weight="bold" aria-hidden />
          {salvando ? "Criando" : "Criar"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-background"
        >
          Cancelar
        </button>
      </div>
      <p className="text-xs text-muted">
        A senha é definida por você aqui e precisa ser combinada com a pessoa.
        Ela pode trocar depois entrando pelo login social com o mesmo e-mail.
      </p>
    </form>
  );
}

export function AdminUsuarios({
  usuarios,
  planos,
}: {
  usuarios: UsuarioAdmin[];
  planos: PlanoOpcao[];
}) {
  const comPlano = usuarios.filter((u) => u.planoStatus === "ativo").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Administração</h1>
      <p className="mt-1 text-sm text-muted">
        {usuarios.length} {usuarios.length === 1 ? "usuário" : "usuários"} ·{" "}
        {comPlano} com plano ativo
      </p>

      <div className="mt-6">
        <NovoUsuario planos={planos} />
      </div>

      <ul className="mt-6 grid gap-3">
        {usuarios.map((u) => (
          <LinhaUsuario key={u.id} usuario={u} planos={planos} />
        ))}
      </ul>
    </div>
  );
}
