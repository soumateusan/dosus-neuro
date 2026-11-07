/* Conexão com o Firebase: login com Google e banco de dados (Firestore) com cache offline.
   Com o cache persistente, o app abre e grava sem internet; sincroniza quando a conexão volta. */
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager, terminate, clearIndexedDbPersistence, waitForPendingWrites } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config.js";

/* modo emulador (só em desenvolvimento): npm run emuladores + npm run dev:emulador */
const emulador = import.meta.env.DEV && import.meta.env.VITE_EMULADOR === "1";
const config = emulador ? { apiKey: "demo", authDomain: "localhost", projectId: "demo-dosus", appId: "demo" } : firebaseConfig;

export const configurado = Boolean(config.apiKey && config.projectId && config.appId);

let auth = null, fs = null;
if (configurado) {
  const app = initializeApp(config);
  auth = getAuth(app);
  auth.languageCode = "pt";
  fs = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });
  if (emulador) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(fs, "127.0.0.1", 8080);
  }
}
export { auth, fs };

export const observarLogin = (fn) => (auth ? onAuthStateChanged(auth, fn) : () => {});

export async function entrarComGoogle() {
  const prov = new GoogleAuthProvider();
  prov.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth, prov);
  } catch (e) {
    // pop-up bloqueado (comum no app instalado ou no celular): usa redirecionamento
    if (e?.code === "auth/popup-blocked" || e?.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, prov);
      return;
    }
    throw e;
  }
}

/* Sair: espera o envio do que está pendente e apaga a cópia local (os dados continuam na conta).
   Assim, num computador compartilhado, nada fica guardado depois do logout. */
export async function sair() {
  const enviado = await Promise.race([
    waitForPendingWrites(fs).then(() => true),
    new Promise((ok) => setTimeout(() => ok(false), 5000)),
  ]);
  if (!enviado && !window.confirm("Há alterações que ainda não foram enviadas (sem internet?). Se sair agora, elas serão perdidas. Sair mesmo assim?")) return;
  await signOut(auth);
  try { await terminate(fs); await clearIndexedDbPersistence(fs); } catch { /* outra aba aberta: a cópia some quando ela fechar */ }
  window.location.reload();
}

export function mensagemErro(e) {
  const c = e?.code || "";
  if (c === "auth/popup-closed-by-user" || c === "auth/cancelled-popup-request") return "";
  if (c === "auth/network-request-failed") return "Sem internet. O primeiro login precisa de conexão; depois o app funciona offline.";
  if (c === "auth/unauthorized-domain") return "Este endereço não está autorizado no Firebase (Authentication → Configurações → Domínios autorizados).";
  return `Não foi possível entrar (${c || e?.message || e}).`;
}
