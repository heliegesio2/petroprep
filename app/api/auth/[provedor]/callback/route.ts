import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasDatabase, prisma } from "@/lib/prisma";
import { criarSessao } from "@/lib/auth";
import {
  ehProvedor,
  provedorConfigurado,
  redirectUriDe,
  trocarCodigo,
} from "@/lib/oauth";

export const runtime = "nodejs";

function baseUrl(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provedor: string }> },
) {
  const { provedor } = await params;
  const site = baseUrl(request);
  const erro = (codigo: string) =>
    NextResponse.redirect(`${site}/entrar?erro=${codigo}`);

  if (!ehProvedor(provedor) || !provedorConfigurado(provedor) || !hasDatabase) {
    return erro("indisponivel");
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const jar = await cookies();
  const stateCookie = jar.get("oauth_state")?.value;
  const verifier = jar.get("oauth_verifier")?.value;
  const next = jar.get("oauth_next")?.value || "/minha-conta";

  jar.delete("oauth_state");
  jar.delete("oauth_verifier");
  jar.delete("oauth_next");

  if (url.searchParams.get("error")) return erro("provedor");
  if (!code || !state || !verifier || state !== stateCookie) return erro("state");

  let dados;
  try {
    dados = await trocarCodigo(provedor, {
      code,
      codeVerifier: verifier,
      redirectUri: redirectUriDe(provedor, site),
    });
  } catch (e) {
    console.error(`[oauth ${provedor}] falha na troca de código:`, e);
    return erro("provedor");
  }

  if (!dados.provedorUserId) return erro("provedor");

  try {
    // 1. Já existe vínculo com esse provedor?
    const vinculo = await prisma.contaOAuth.findUnique({
      where: {
        provedor_provedorUserId: {
          provedor,
          provedorUserId: dados.provedorUserId,
        },
      },
      include: { usuario: true },
    });

    let usuario = vinculo?.usuario ?? null;

    // 2. Vincular a uma conta existente pelo e-mail verificado.
    if (!usuario && dados.email && dados.emailVerificado) {
      const porEmail = await prisma.usuario.findUnique({
        where: { email: dados.email.toLowerCase() },
      });
      if (porEmail) {
        usuario = porEmail;
        await prisma.contaOAuth.create({
          data: {
            provedor,
            provedorUserId: dados.provedorUserId,
            usuarioId: porEmail.id,
          },
        });
      }
    }

    // 3. Criar conta nova.
    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          nome: dados.nome.slice(0, 80),
          email: dados.email ? dados.email.toLowerCase() : null,
          senhaHash: null,
          contasOAuth: {
            create: { provedor, provedorUserId: dados.provedorUserId },
          },
        },
      });
    }

    await criarSessao({
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      avatar: dados.avatarUrl,
    });
  } catch (e) {
    console.error(`[oauth ${provedor}] falha ao gravar usuário:`, e);
    return erro("provedor");
  }

  return NextResponse.redirect(`${site}${next.startsWith("/") ? next : "/minha-conta"}`);
}
