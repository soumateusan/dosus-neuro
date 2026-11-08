/* Armazenamento na nuvem (Firestore), separado por conta Google:
     users/{uid}/pacientes/{id}   identificação, reaproveitada em todas as patologias
     users/{uid}/processos/{id}   um por solicitação (patologia + data), com tudo o que foi preenchido
     users/{uid}/config/{chave}   perfil do médico e preferências
   O Firestore guarda uma cópia no aparelho: lê e grava sem internet e sincroniza depois.
   As gravações não esperam o servidor (offline elas ficariam pendentes), só a cópia local. */
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { fs } from "./nuvem.js";
import { hojeISO } from "./shared/ui.jsx";

let uid = null;
export const usarConta = (id) => { uid = id; };

const col = (store) => collection(fs, "users", uid, store);
const chaveDe = (store, obj) => (store === "config" ? obj.chave : obj.id);

/* avisa a tela quando uma gravação é recusada pelo servidor (ex.: regras de segurança) */
function falhou(e) {
  console.error("DOSUS: falha ao gravar", e);
  window.dispatchEvent(new CustomEvent("dosus-erro-gravacao", { detail: String(e?.code || e?.message || e) }));
}

export const novoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

export const db = {
  todos: async (store) => (await getDocs(col(store))).docs.map((d) => d.data()),
  pegar: async (store, id) => {
    try { const s = await getDoc(doc(col(store), id)); return s.exists() ? s.data() : undefined; }
    catch { return undefined; }
  },
  salvar: (store, obj) => { setDoc(doc(col(store), chaveDe(store, obj)), obj).catch(falhou); return Promise.resolve(); },
  apagar: (store, id) => { deleteDoc(doc(col(store), id)).catch(falhou); return Promise.resolve(); },
};

export async function lerConfig(chave, padrao) {
  const r = await db.pegar("config", chave);
  return r ? r.valor : padrao;
}
export const gravarConfig = (chave, valor) => db.salvar("config", { chave, valor });

export async function apagarPaciente(id) {
  const procs = (await db.todos("processos")).filter((p) => p.pacienteId === id);
  for (const p of procs) await db.apagar("processos", p.id);
  await db.apagar("pacientes", id);
}

/* cópia de segurança: um arquivo .json com tudo da conta */
export async function exportarBackup() {
  const dados = {
    app: "DOSUS Neuro",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    pacientes: await db.todos("pacientes"),
    processos: await db.todos("processos"),
    config: await db.todos("config"),
  };
  const blob = new Blob([JSON.stringify(dados, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dosus-neuro-backup-${hojeISO()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* mescla na conta: registros com o mesmo id ficam com a versão mais recente */
export async function importarDados(dados) {
  const atuais = {
    pacientes: new Map((await db.todos("pacientes")).map((x) => [x.id, x])),
    processos: new Map((await db.todos("processos")).map((x) => [x.id, x])),
  };
  let n = 0;
  for (const store of ["pacientes", "processos"]) {
    for (const obj of dados[store] || []) {
      const atual = atuais[store].get(obj.id);
      if (!atual || (obj.atualizadoEm || "") >= (atual.atualizadoEm || "")) { await db.salvar(store, obj); n++; }
    }
  }
  const temPerfil = await db.pegar("config", "medico");
  for (const c of dados.config || []) if (c.chave !== "medico" || !temPerfil?.valor?.nome) await db.salvar("config", c);
  return n;
}

export async function importarBackup(arquivo) {
  const dados = JSON.parse(await arquivo.text());
  if (dados.app !== "DOSUS Neuro") throw new Error("Arquivo não é um backup do DOSUS Neuro.");
  return importarDados(dados);
}

/* ---------- dados da versão anterior, que ficavam só no navegador (IndexedDB "dosus-neuro") ---------- */
function abrirLocalAntigo() {
  return new Promise((ok) => {
    if (!indexedDB.databases) { ok(null); return; }
    indexedDB.databases().then((lista) => {
      if (!lista.some((d) => d.name === "dosus-neuro")) { ok(null); return; }
      const req = indexedDB.open("dosus-neuro");
      req.onsuccess = () => ok(req.result);
      req.onerror = () => ok(null);
    }).catch(() => ok(null));
  });
}

export async function lerLocalAntigo() {
  const banco = await abrirLocalAntigo();
  if (!banco) return null;
  const ler = (s) => new Promise((ok) => {
    if (!banco.objectStoreNames.contains(s)) { ok([]); return; }
    const r = banco.transaction(s).objectStore(s).getAll();
    r.onsuccess = () => ok(r.result || []);
    r.onerror = () => ok([]);
  });
  const dados = { pacientes: await ler("pacientes"), processos: await ler("processos"), config: await ler("config") };
  banco.close();
  return dados.pacientes.length || dados.processos.length ? dados : null;
}

export function apagarLocalAntigo() {
  return new Promise((ok) => {
    const r = indexedDB.deleteDatabase("dosus-neuro");
    r.onsuccess = r.onerror = r.onblocked = () => ok();
  });
}
