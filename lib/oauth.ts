import "server-only";
import crypto from "node:crypto";
import { decodeJwt } from "jose";

/**
 * Login social (OAuth 2.0 authorization-code + PKCE), feito na mão para reaproveitar
 * o cookie/JWT de sessão que já existe em lib/auth.ts. Cada provedor degrada sozinho:
 * sem as env vars, provedorConfigurado() volta false e o botão some da tela.
 */

export type Provedor = "google" | "facebook" | "tiktok";

export const PROVEDORES_VALIDOS: Provedor[] = ["google", "facebook", "tiktok"];

export function ehProvedor(v: string): v is Provedor {
  return (PROVEDORES_VALIDOS as string[]).includes(v);
}

export const rotuloProvedor: Record<Provedor, string> = {
  google: "Google",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export interface UsuarioProvedor {
  provedorUserId: string;
  nome: string;
  email: string | null;
  emailVerificado: boolean;
}

interface ConfigProvedor {
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
  /** Nome do parâmetro de id do cliente na URL de autorização. */
  paramCliente: "client_id" | "client_key";
  envId: string;
  envSecret: string;
  /** Extrai o usuário a partir da resposta do token e de uma chamada opcional de userinfo. */
  buscarUsuario: (
    tokenJson: Record<string, unknown>,
    fetchJson: (url: string, init?: RequestInit) => Promise<Record<string, unknown>>,
  ) => Promise<UsuarioProvedor>;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

const CONFIG: Record<Provedor, ConfigProvedor> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    paramCliente: "client_id",
    envId: "GOOGLE_CLIENT_ID",
    envSecret: "GOOGLE_CLIENT_SECRET",
    async buscarUsuario(tokenJson) {
      // O id_token vem direto do endpoint do Google via TLS: decodificar sem
      // verificação de assinatura é o padrão aceito nesse fluxo server-side.
      const claims = decodeJwt(str(tokenJson.id_token));
      return {
        provedorUserId: str(claims.sub),
        nome: str(claims.name) || str(claims.email) || "Usuário",
        email: str(claims.email) || null,
        emailVerificado: claims.email_verified === true,
      };
    },
  },
  facebook: {
    authorizeUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "email public_profile",
    paramCliente: "client_id",
    envId: "FACEBOOK_CLIENT_ID",
    envSecret: "FACEBOOK_CLIENT_SECRET",
    async buscarUsuario(tokenJson, fetchJson) {
      const accessToken = str(tokenJson.access_token);
      const me = await fetchJson(
        `https://graph.facebook.com/v21.0/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
      );
      const email = str(me.email) || null;
      return {
        provedorUserId: str(me.id),
        nome: str(me.name) || email || "Usuário",
        email,
        // O Facebook só devolve e-mails já confirmados na conta.
        emailVerificado: Boolean(email),
      };
    },
  },
  tiktok: {
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scope: "user.info.basic",
    paramCliente: "client_key",
    envId: "TIKTOK_CLIENT_KEY",
    envSecret: "TIKTOK_CLIENT_SECRET",
    async buscarUsuario(tokenJson, fetchJson) {
      const accessToken = str(tokenJson.access_token);
      const resp = await fetchJson(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = (resp.data ?? {}) as Record<string, unknown>;
      return {
        provedorUserId: str(data.open_id) || str(tokenJson.open_id),
        nome: str(data.display_name) || "Usuário do TikTok",
        email: null, // TikTok Login Kit v2 não fornece e-mail
        emailVerificado: false,
      };
    },
  },
};

function credenciais(p: Provedor): { id: string; secret: string } | null {
  const id = process.env[CONFIG[p].envId];
  const secret = process.env[CONFIG[p].envSecret];
  return id && secret ? { id, secret } : null;
}

export function provedorConfigurado(p: Provedor): boolean {
  return credenciais(p) !== null;
}

export function provedoresConfigurados(): Provedor[] {
  return PROVEDORES_VALIDOS.filter(provedorConfigurado);
}

export function redirectUriDe(p: Provedor, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/api/auth/${p}/callback`;
}

export function gerarStateEVerifier(): {
  state: string;
  codeVerifier: string;
  codeChallenge: string;
} {
  const state = crypto.randomBytes(24).toString("base64url");
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { state, codeVerifier, codeChallenge };
}

export function urlAutorizacao(
  p: Provedor,
  opts: { state: string; codeChallenge: string; redirectUri: string },
): string {
  const cfg = CONFIG[p];
  const cred = credenciais(p);
  if (!cred) throw new Error(`Provedor ${p} não configurado.`);

  const params = new URLSearchParams({
    [cfg.paramCliente]: cred.id,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: cfg.scope,
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${cfg.authorizeUrl}?${params.toString()}`;
}

async function fetchJson(
  url: string,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  const res = await fetch(url, init);
  const texto = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(texto) as Record<string, unknown>;
  } catch {
    // resposta não-JSON: mantém {}
  }
  if (!res.ok) {
    throw new Error(`${url} respondeu ${res.status}: ${texto.slice(0, 200)}`);
  }
  return json;
}

export async function trocarCodigo(
  p: Provedor,
  opts: { code: string; codeVerifier: string; redirectUri: string },
): Promise<UsuarioProvedor> {
  const cfg = CONFIG[p];
  const cred = credenciais(p);
  if (!cred) throw new Error(`Provedor ${p} não configurado.`);

  const body = new URLSearchParams({
    [cfg.paramCliente]: cred.id,
    client_secret: cred.secret,
    code: opts.code,
    grant_type: "authorization_code",
    redirect_uri: opts.redirectUri,
    code_verifier: opts.codeVerifier,
  });

  const tokenJson = await fetchJson(cfg.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  return cfg.buscarUsuario(tokenJson, fetchJson);
}
