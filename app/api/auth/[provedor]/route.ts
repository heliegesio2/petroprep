import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ehProvedor,
  gerarStateEVerifier,
  provedorConfigurado,
  redirectUriDe,
  urlAutorizacao,
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

  if (!ehProvedor(provedor) || !provedorConfigurado(provedor)) {
    return NextResponse.redirect(`${site}/entrar?erro=indisponivel`);
  }

  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/minha-conta";

  const { state, codeVerifier, codeChallenge } = gerarStateEVerifier();
  const redirectUri = redirectUriDe(provedor, site);

  const jar = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 600,
  };
  jar.set("oauth_state", state, opts);
  jar.set("oauth_verifier", codeVerifier, opts);
  jar.set("oauth_next", next.startsWith("/") ? next : "/minha-conta", opts);

  return NextResponse.redirect(
    urlAutorizacao(provedor, { state, codeChallenge, redirectUri }),
  );
}
