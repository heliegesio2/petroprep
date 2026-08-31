// IndexedDB local (cliente). Guarda simulados baixados para estudo offline e a
// fila de tentativas feitas sem internet. Sem lib: wrapper minimo em Promise.

const DB_NOME = "petroprep-offline";
const DB_VERSAO = 1;
const STORE_SIMULADOS = "simulados";
const STORE_PENDENTES = "pendentes";

export interface QuestaoOffline {
  id: string;
  ordem: number;
  disciplina: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  comentario: string | null;
}

export interface PacoteOffline {
  slug: string;
  simuladoId: string;
  titulo: string;
  descricao: string | null;
  duracaoMin: number;
  versao: string;
  baixadoEm: number;
  questoes: QuestaoOffline[];
}

export interface TentativaPendente {
  id: string;
  slug: string;
  titulo: string;
  iniciadoEm: string;
  finalizadoEm: string;
  respostas: Record<string, number>;
  nota: number;
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponível"));
      return;
    }
    const req = indexedDB.open(DB_NOME, DB_VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SIMULADOS)) {
        db.createObjectStore(STORE_SIMULADOS, { keyPath: "slug" });
      }
      if (!db.objectStoreNames.contains(STORE_PENDENTES)) {
        db.createObjectStore(STORE_PENDENTES, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function operar<T>(
  store: string,
  modo: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrir().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, modo);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export function salvarPacote(p: PacoteOffline): Promise<IDBValidKey> {
  return operar(STORE_SIMULADOS, "readwrite", (s) => s.put(p));
}

export function lerPacote(slug: string): Promise<PacoteOffline | undefined> {
  return operar(STORE_SIMULADOS, "readonly", (s) => s.get(slug));
}

export function listarPacotes(): Promise<PacoteOffline[]> {
  return operar(STORE_SIMULADOS, "readonly", (s) => s.getAll());
}

export function removerPacote(slug: string): Promise<undefined> {
  return operar(STORE_SIMULADOS, "readwrite", (s) => s.delete(slug));
}

export function salvarPendente(t: TentativaPendente): Promise<IDBValidKey> {
  return operar(STORE_PENDENTES, "readwrite", (s) => s.put(t));
}

export function listarPendentes(): Promise<TentativaPendente[]> {
  return operar(STORE_PENDENTES, "readonly", (s) => s.getAll());
}

export function removerPendente(id: string): Promise<undefined> {
  return operar(STORE_PENDENTES, "readwrite", (s) => s.delete(id));
}

/** Pede ao navegador para não apagar os dados sob pressão de disco. */
export async function pedirPersistencia(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    // sem suporte
  }
  return false;
}

export async function espacoUsado(): Promise<{ usado: number; cota: number } | null> {
  try {
    if (navigator.storage?.estimate) {
      const e = await navigator.storage.estimate();
      return { usado: e.usage ?? 0, cota: e.quota ?? 0 };
    }
  } catch {
    // sem suporte
  }
  return null;
}
