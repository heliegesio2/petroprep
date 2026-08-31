import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { vincularTentativasAnonimas } from "@/lib/tentativas-anonimas";

const COOKIE = "petroprep_sessao";
const DIAS = 30;

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ??
    "dev-secret-troque-em-producao-com-AUTH_SECRET-no-env",
);

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  console.warn("[auth] AUTH_SECRET não definido em produção — usando fallback inseguro.");
}

export interface SessaoUsuario {
  id: string;
  email: string | null;
  nome: string;
  /** URL da foto do provedor social, se houver. */
  avatar?: string | null;
}

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(u: SessaoUsuario): Promise<void> {
  const token = await new SignJWT({
    email: u.email ?? "",
    nome: u.nome,
    avatar: u.avatar ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setIssuedAt()
    .setExpirationTime(`${DIAS}d`)
    .sign(secret);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });

  // Puxa para a conta os simulados feitos deslogado neste navegador.
  await vincularTentativasAnonimas(u.id);
}

export async function encerrarSessao(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function lerSessao(): Promise<SessaoUsuario | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.sub),
      email: String(payload.email ?? "") || null,
      nome: String(payload.nome ?? ""),
      avatar: String(payload.avatar ?? "") || null,
    };
  } catch {
    return null;
  }
}

/** Usuário completo do banco (com plano atualizado), ou null. */
export async function usuarioAtual() {
  const s = await lerSessao();
  if (!s) return null;
  const u = await prisma.usuario.findUnique({ where: { id: s.id } });
  return u;
}

export async function exigirLogin(next = "/") {
  const u = await usuarioAtual();
  if (!u) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return u;
}

export function planoAtivo(u: { planoStatus: string; planoAte: Date | null } | null): boolean {
  if (!u || u.planoStatus !== "ativo") return false;
  return !u.planoAte || u.planoAte.getTime() > Date.now();
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? "heliegesio@gmail.com")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/** Acesso ao painel de administração: e-mail na lista ADMIN_EMAIL (padrão: o dono). */
export function ehAdmin(u: { email: string | null } | null | undefined): boolean {
  return !!u?.email && ADMIN_EMAILS.includes(u.email.toLowerCase());
}
