import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

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
}

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

export function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export async function criarSessao(u: SessaoUsuario): Promise<void> {
  const token = await new SignJWT({ email: u.email ?? "", nome: u.nome })
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
