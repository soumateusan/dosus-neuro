import { useState } from "react";
import { FileText, ShieldCheck, Cloud, WifiOff, Loader2 } from "lucide-react";
import { entrarComGoogle, mensagemErro } from "./nuvem.js";

function Moldura({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-teal-700 text-white flex items-center justify-center"><FileText size={22} /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">DOSUS Neuro</h1>
            <p className="text-xs text-slate-500">Preenchimento automatizado de documentos do SUS para neurologia</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const LogoGoogle = () => (
  <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export function Login() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const entrar = async () => {
    setCarregando(true); setErro("");
    try { await entrarComGoogle(); } catch (e) { setErro(mensagemErro(e)); }
    setCarregando(false);
  };
  return (
    <Moldura>
      <button onClick={entrar} disabled={carregando}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 disabled:opacity-60">
        {carregando ? <Loader2 size={18} className="animate-spin" /> : <LogoGoogle />} Entrar com Google
      </button>
      {erro && <p className="mt-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{erro}</p>}
      <ul className="mt-6 space-y-3 text-xs text-slate-500">
        <li className="flex gap-2"><ShieldCheck size={15} className="text-teal-600 shrink-0" /> Cada conta tem o próprio perfil e só enxerga os próprios pacientes.</li>
        <li className="flex gap-2"><Cloud size={15} className="text-teal-600 shrink-0" /> Os dados ficam na sua conta e aparecem em qualquer aparelho em que você entrar.</li>
        <li className="flex gap-2"><WifiOff size={15} className="text-teal-600 shrink-0" /> Depois do primeiro login, funciona sem internet e sincroniza quando a conexão volta.</li>
      </ul>
      <p className="mt-6 text-[11px] text-slate-400 leading-relaxed">
        Contém dados de saúde (dados sensíveis, LGPD). Use em aparelho pessoal ou saia da conta ao terminar — ao sair, a cópia guardada no aparelho é apagada.
      </p>
    </Moldura>
  );
}

export function Configurar() {
  return (
    <Moldura>
      <h2 className="font-semibold text-slate-800 mb-2">Falta configurar o Firebase</h2>
      <p className="text-sm text-slate-600 leading-relaxed">
        O login com Google e o banco de dados usam um projeto do Firebase. Crie o projeto (passo a passo no README) e cole a
        configuração em <code className="text-xs bg-slate-100 px-1 rounded">src/firebase-config.js</code>.
      </p>
    </Moldura>
  );
}

export function Carregando() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-400">
      <Loader2 size={28} className="animate-spin" />
    </div>
  );
}
