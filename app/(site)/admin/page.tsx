import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirLogin, ehAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { planos } from "@/lib/planos";
import { AdminUsuarios } from "@/components/admin-usuarios";

export const metadata: Metadata = { title: "Administração", robots: { index: false } };

export default async function AdminPage() {
  const usuario = await exigirLogin("/admin");
  if (!ehAdmin(usuario)) notFound();

  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      plano: true,
      planoStatus: true,
      planoAte: true,
      senhaHash: true,
      createdAt: true,
      contasOAuth: { select: { provedor: true } },
      _count: { select: { tentativas: true } },
    },
  });

  const dados = usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    telefone: u.telefone,
    plano: u.plano,
    planoStatus: u.planoStatus,
    planoAte: u.planoAte ? u.planoAte.toISOString() : null,
    temSenha: Boolean(u.senhaHash),
    provedores: u.contasOAuth.map((c) => c.provedor),
    tentativas: u._count.tentativas,
    criadoEm: u.createdAt.toISOString(),
  }));

  return (
    <AdminUsuarios
      usuarios={dados}
      planos={planos.map((p) => ({ id: p.id, nome: p.nome }))}
    />
  );
}
