import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * O simulado "Diagnóstico" abre sem login. Quando alguém o finaliza deslogado,
 * guardamos o id da tentativa num cookie para vinculá-la à conta assim que a
 * pessoa entrar - o resultado nunca se perde.
 */
const COOKIE = "sim_anon";
const MAX_IDS = 20;
const DIAS = 180;

function lerIds(valor: string | undefined): string[] {
  return (valor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ids das tentativas feitas deslogado neste navegador (para listar "feito"). */
export async function idsTentativasAnonimas(): Promise<string[]> {
  const jar = await cookies();
  return lerIds(jar.get(COOKIE)?.value);
}

/** Registra uma tentativa finalizada deslogado para reivindicá-la no login. */
export async function lembrarTentativaAnonima(tentativaId: string): Promise<void> {
  const jar = await cookies();
  const ids = lerIds(jar.get(COOKIE)?.value);
  if (ids.includes(tentativaId)) return;
  jar.set(COOKIE, [...ids, tentativaId].slice(-MAX_IDS).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

/**
 * Vincula ao usuário as tentativas que ele fez deslogado neste navegador.
 * Idempotente: só toca tentativas ainda sem dono. Chamado em todo login.
 */
export async function vincularTentativasAnonimas(usuarioId: string): Promise<void> {
  const jar = await cookies();
  const ids = lerIds(jar.get(COOKIE)?.value);
  if (ids.length === 0) return;
  try {
    await prisma.tentativa.updateMany({
      where: { id: { in: ids }, usuarioId: null },
      data: { usuarioId },
    });
  } catch (e) {
    console.error("[simulado] falha ao vincular tentativas anônimas:", e);
  }
  jar.delete(COOKIE);
}
