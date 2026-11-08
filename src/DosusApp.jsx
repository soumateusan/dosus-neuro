import { useEffect, useMemo, useRef, useState } from "react";
import {
  FolderOpen, UserCog, ChevronDown, ChevronRight, CheckCircle2, Circle, AlertTriangle, Menu, X as Fechar,
  LogOut, CloudUpload, FileText, Plus, Save, WifiOff, UserPlus,
} from "lucide-react";
import { PacienteCtx } from "./shared/ui.jsx";
import { db, novoId, lerConfig, gravarConfig, lerLocalAntigo, importarDados, apagarLocalAntigo } from "./db.js";
import { sair } from "./nuvem.js";
import { Cartao, Txt } from "./comum.jsx";
import { Arquivo } from "./Arquivo.jsx";
import { pacienteVazio, idadeDe } from "./pacienteComum.jsx";
import { patologias, ativas, patologia } from "./patologias.js";

/* ---------- utilitários de estado ---------- */
function setIn(obj, caminho, valor) {
  const [k, ...resto] = caminho.split(".");
  if (!resto.length) return { ...obj, [k]: valor };
  return { ...obj, [k]: setIn(obj?.[k] ?? {}, resto.join("."), valor) };
}
/* mescla dados salvos sobre o modelo atual (campos novos ganham valor padrão) */
function mesclar(base, salvo, inteiros = []) {
  if (!salvo) return base;
  const r = { ...base };
  for (const k of Object.keys(salvo)) {
    const b = base[k], s = salvo[k];
    r[k] = b && typeof b === "object" && !Array.isArray(b) && s && typeof s === "object" && !Array.isArray(s) && !inteiros.includes(k)
      ? { ...b, ...s } : s;
  }
  return r;
}

const medicoVazio = { nome: "", crm: "", uf: "BA", cns: "", cnes: "", estabelecimento: "", cidade: "", endereco: "" };

export default function DosusApp({ usuario }) {
  const nomeGoogle = usuario?.displayName || "";
  const [med, setMed] = useState(medicoVazio);
  const [atual, setAtual] = useState(null); // { pacId, pac, procId, patologia, d, criadoEm }
  const [tela, setTela] = useState({ tipo: "arquivo" });
  const [abertos, setAbertos] = useState({ alzheimer: true, epilepsia: true });
  const [menuNovo, setMenuNovo] = useState(false);
  const [menuMovel, setMenuMovel] = useState(false);
  const [salvoEm, setSalvoEm] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [versaoArquivo, setVersaoArquivo] = useState(0);
  const [localAntigo, setLocalAntigo] = useState(null);
  const [erroGravacao, setErroGravacao] = useState("");
  const [menuConta, setMenuConta] = useState(false);

  const levarParaConta = async () => {
    const n = await importarDados(localAntigo);
    await apagarLocalAntigo();
    setLocalAntigo(null);
    lerConfig("medico", null).then((m) => m && setMed({ ...medicoVazio, ...m }));
    setVersaoArquivo((v) => v + 1);
    window.alert(`${n} registro(s) levados para a sua conta.`);
  };

  useEffect(() => {
    lerConfig("medico", null).then((m) => setMed(m ? { ...medicoVazio, ...m } : { ...medicoVazio, nome: nomeGoogle }));
    lerLocalAntigo().then(setLocalAntigo);
    const erroGrav = (e) => setErroGravacao(e.detail);
    window.addEventListener("dosus-erro-gravacao", erroGrav);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); window.removeEventListener("dosus-erro-gravacao", erroGrav); };
  }, [nomeGoogle]);

  /* salvamento automático (a partir do momento em que o paciente tem nome) */
  const timer = useRef();
  useEffect(() => {
    if (!atual || !atual.pac.nome.trim()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const agora = new Date().toISOString();
      const derv = patologia(atual.patologia).derivar(atual.pac, atual.d, med);
      await db.salvar("pacientes", { ...atual.pac, id: atual.pacId, atualizadoEm: agora });
      await db.salvar("processos", {
        id: atual.procId, pacienteId: atual.pacId, patologia: atual.patologia, criadoEm: atual.criadoEm, atualizadoEm: agora,
        dados: atual.d,
        resumo: { cid: atual.d.cid, tipo: atual.d.tipo, meds: derv.nomesFam, feitos: derv.feitos, total: derv.checklist.length },
      });
      setSalvoEm(new Date());
      setVersaoArquivo((v) => v + 1);
    }, 600);
    return () => clearTimeout(timer.current);
  }, [atual, med]);

  const salvarMed = (m) => { setMed(m); gravarConfig("medico", m); };

  const mod = atual ? patologia(atual.patologia) : null;
  const der = useMemo(() => (atual ? patologia(atual.patologia).derivar(atual.pac, atual.d, med) : null), [atual, med]);
  const upP = (k, v) => setAtual((a) => ({ ...a, pac: { ...a.pac, [k]: v } }));
  const up = (caminho, v) => setAtual((a) => ({ ...a, d: setIn(a.d, caminho, typeof v === "function" ? v(caminho.split(".").reduce((o, k) => o?.[k], a.d)) : v) }));

  const ir = (sec) => { setTela({ tipo: "proc", sec }); setMenuMovel(false); setMenuNovo(false); window.scrollTo(0, 0); };

  /* novo processo de uma patologia; com pac/pacId reaproveita o paciente; base = dados copiados (renovação) */
  const novoProcesso = (patId, pac, pacId, base) => {
    const m = patologia(patId);
    const d = base ? mesclar(m.novo(), base, m.inteiros) : m.novo();
    setAtual({ pacId: pacId || novoId(), pac: { ...pacienteVazio(), ...(pac || {}) }, procId: novoId(), patologia: patId, d, criadoEm: new Date().toISOString() });
    setAbertos((o) => ({ ...o, [patId]: true }));
    setSalvoEm(null);
    ir(pac?.nome ? "visao" : "paciente");
  };
  const abrirProcesso = (paciente, proc) => {
    const m = patologia(proc.patologia);
    if (!m) { window.alert("Esta patologia ainda não está disponível nesta versão."); return; }
    const { id, atualizadoEm: _a, ...pac } = paciente;
    void _a;
    setAtual({ pacId: id, pac: { ...pacienteVazio(), ...pac }, procId: proc.id, patologia: proc.patologia, d: mesclar(m.novo(), proc.dados, m.inteiros), criadoEm: proc.criadoEm });
    setAbertos((o) => ({ ...o, [proc.patologia]: true }));
    setSalvoEm(new Date(proc.atualizadoEm));
    ir("visao");
  };
  const pacAtual = () => {
    if (!atual) return [undefined, undefined];
    return [atual.pac, atual.pacId];
  };
  /* renovação: cada patologia decide o que copia do processo anterior */
  const renovar = (paciente, proc) => {
    const m = patologia(proc.patologia);
    if (!m) return;
    const { id, atualizadoEm: _a, ...pac } = paciente;
    void _a;
    novoProcesso(proc.patologia, pac, id, m.renovar(proc.dados, proc.resumo));
  };

  const ctxPaciente = atual ? {
    nome: atual.pac.nome, idade: idadeDe(atual.pac), app: "DOSUS Neuro",
    data: mod?.dataFicha ? mod.dataFicha(tela.sec, atual.d) : "",
  } : { nome: "", idade: "", data: "", app: "DOSUS Neuro" };

  const props = atual && { pac: atual.pac, upP, d: atual.d, up, der, med, ir, irPerfil: () => setTela({ tipo: "perfil" }) };

  const menu = (
    <nav className="flex flex-col gap-1 text-sm">
      <BotaoMenu ativo={tela.tipo === "arquivo"} icone={FolderOpen} onClick={() => { setTela({ tipo: "arquivo" }); setMenuMovel(false); }}>Pacientes (arquivo)</BotaoMenu>
      <BotaoMenu ativo={tela.tipo === "perfil"} icone={UserCog} onClick={() => { setTela({ tipo: "perfil" }); setMenuMovel(false); }}>
        Perfil do médico {!med.nome && <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" />}
      </BotaoMenu>
      <div className="mt-3 mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Patologias</div>
      {patologias.map((p) => {
        const aberto = p.ativo && abertos[p.id];
        const destaProc = atual?.patologia === p.id;
        return (
        <div key={p.id}>
          <button disabled={!p.ativo} onClick={() => setAbertos((o) => ({ ...o, [p.id]: !o[p.id] }))}
            className={"w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left font-semibold " + (p.ativo ? "text-slate-700 hover:bg-slate-200/60" : "text-slate-300 cursor-default")}>
            {p.ativo ? (aberto ? <ChevronDown size={15} /> : <ChevronRight size={15} />) : <span className="w-[15px]" />}
            <span className="truncate">{p.nome}</span>
            {!p.ativo && <span className="ml-auto text-[9px] font-semibold uppercase">em breve</span>}
            {destaProc && <span className="ml-auto w-2 h-2 rounded-full bg-teal-500 shrink-0" />}
          </button>
          {aberto && destaProc && (
            <div className="ml-3 pl-2 border-l border-slate-200 flex flex-col gap-0.5 my-1">
              {p.secoes.map((sc) => {
                const Ic = sc.icone;
                const sel = tela.tipo === "proc" && tela.sec === sc.id;
                const ok = der && sc.ok ? sc.ok(der) : null;
                return (
                  <button key={sc.id} onClick={() => ir(sc.id)}
                    className={"flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[13px] " + (sel ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-200/60")}>
                    <Ic size={14} className="shrink-0" />
                    <span className="truncate flex-1">{sc.nome}</span>
                    {ok != null && (ok ? <CheckCircle2 size={13} className={sel ? "text-white" : "text-teal-600"} /> : <Circle size={13} className={sel ? "text-teal-100" : "text-slate-300"} />)}
                  </button>
                );
              })}
            </div>
          )}
          {aberto && !destaProc && (
            <div className="ml-3 pl-2 border-l border-slate-200 flex flex-col gap-0.5 my-1">
              {atual?.pac.nome && (
                <button onClick={() => novoProcesso(p.id, ...pacAtual())} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[13px] text-slate-600 hover:bg-slate-200/60">
                  <Plus size={14} className="shrink-0" /><span className="truncate">Novo processo — {atual.pac.nome.split(" ")[0]}</span>
                </button>
              )}
              <button onClick={() => novoProcesso(p.id)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[13px] text-slate-600 hover:bg-slate-200/60">
                <UserPlus size={14} className="shrink-0" /> Novo paciente
              </button>
            </div>
          )}
        </div>
        );
      })}
    </nav>
  );

  return (
    <PacienteCtx.Provider value={ctxPaciente}>
      <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white">
        {/* topo */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 print:hidden">
          <div className="max-w-[90rem] mx-auto px-3 h-14 flex items-center gap-3">
            <button className="md:hidden p-1.5 -ml-1 text-slate-600" onClick={() => setMenuMovel((o) => !o)}>{menuMovel ? <Fechar size={20} /> : <Menu size={20} />}</button>
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0"><FileText size={17} /></div>
            <div className="leading-tight min-w-0">
              <div className="font-bold text-slate-800">DOSUS Neuro</div>
              <div className="text-[11px] text-slate-500 truncate hidden sm:block">Preenchimento automatizado de documentos do SUS para neurologia</div>
            </div>
            <div className="ml-auto flex items-center gap-3 min-w-0">
              {!online && <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500"><WifiOff size={13} /> offline</span>}
              {atual && (
                <div className="text-right min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate max-w-[14rem]">{atual.pac.nome || "Novo paciente"}</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                    <Save size={11} />{atual.pac.nome.trim() ? (salvoEm ? `salvo ${salvoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "salvando…") : "salva ao informar o nome"}
                  </div>
                </div>
              )}
              <div className="relative shrink-0">
                <button onClick={() => setMenuNovo((o) => !o)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700">
                  <Plus size={15} /> <span className="hidden sm:inline">Novo paciente</span>
                </button>
                {menuNovo && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg p-1.5 z-40">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Novo paciente em</div>
                    {ativas.map((p) => (
                      <button key={p.id} onClick={() => novoProcesso(p.id)} className="w-full text-left px-2 py-2 rounded-lg text-sm text-slate-700 hover:bg-teal-50">{p.nome}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative shrink-0">
                <button onClick={() => setMenuConta((o) => !o)} title={usuario?.email} className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-teal-100 text-teal-800 text-sm font-bold flex items-center justify-center">
                  {usuario?.photoURL ? <img src={usuario.photoURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : (usuario?.email || "?")[0].toUpperCase()}
                </button>
                {menuConta && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-3 z-40">
                    <div className="text-sm font-semibold text-slate-800 truncate">{usuario?.displayName}</div>
                    <div className="text-xs text-slate-500 truncate mb-3">{usuario?.email}</div>
                    <button onClick={sair} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700">
                      <LogOut size={15} /> Sair
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2 leading-snug">Ao sair, a cópia guardada neste aparelho é apagada. Os dados continuam na sua conta.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[90rem] mx-auto px-3 py-4 flex gap-5 items-start print:p-0 print:max-w-none">
          <aside className="hidden md:block w-60 shrink-0 sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto print:hidden">{menu}</aside>
          {menuMovel && <div className="md:hidden fixed inset-0 top-14 z-20 bg-slate-100 p-3 overflow-y-auto print:hidden">{menu}</div>}

          <main className="flex-1 min-w-0 max-w-3xl print:max-w-none">
            {erroGravacao && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 print:hidden">
                Uma gravação foi recusada pelo servidor ({erroGravacao}). Confira as regras de segurança do Firestore.
                <button onClick={() => setErroGravacao("")} className="ml-2 font-semibold underline">fechar</button>
              </div>
            )}
            {localAntigo && tela.tipo === "arquivo" && (
              <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900 print:hidden">
                <div className="flex items-start gap-2">
                  <CloudUpload size={18} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p><b>{localAntigo.pacientes.length} paciente(s)</b> estão salvos só neste navegador (versão anterior, sem login). Levar para a sua conta?</p>
                    <p className="text-xs text-teal-700 mt-0.5">Depois de levar, a cópia antiga deste navegador é apagada.</p>
                    <div className="flex gap-2 mt-2">
                      <button onClick={levarParaConta} className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700">Levar para a minha conta</button>
                      <button onClick={() => setLocalAntigo(null)} className="px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-xs font-semibold">Agora não</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tela.tipo === "arquivo" && <Arquivo versao={versaoArquivo} onAbrir={abrirProcesso} onRenovar={renovar} onNovo={novoProcesso} atualId={atual?.procId} patologias={ativas} />}
            {tela.tipo === "perfil" && <Perfil med={med} salvar={salvarMed} />}
            {tela.tipo === "proc" && atual && mod && (
              <>
                <TituloSecao mod={mod} sec={tela.sec} pac={atual.pac} der={der} />
                {der && <ChecklistMovel der={der} d={atual.d} up={up} ir={ir} />}
                {mod.render(tela.sec, props)}
              </>
            )}
            <footer className="mt-8 text-[11px] text-slate-400 leading-relaxed border-t border-slate-200 pt-3 print:hidden">
              Os dados ficam na sua conta ({usuario?.email}) e numa cópia neste aparelho para uso offline; só você tem acesso.
              Confira sempre os documentos antes de assinar — a responsabilidade pelo conteúdo é do médico.{" "}
              {mod && tela.tipo === "proc" ? mod.rodape : "Critérios conforme os PCDT do Ministério da Saúde e as orientações da SESAB/BA."}
            </footer>
          </main>

          {atual && der && tela.tipo === "proc" && (
            <aside className="hidden xl:block w-72 shrink-0 sticky top-[4.5rem] print:hidden">
              <Checklist der={der} d={atual.d} up={up} ir={ir} />
            </aside>
          )}
        </div>
      </div>
    </PacienteCtx.Provider>
  );
}

function BotaoMenu({ ativo, icone: Ic, onClick, children }) {
  return (
    <button onClick={onClick}
      className={"flex items-center gap-2 px-2 py-2 rounded-lg text-left font-semibold " + (ativo ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-slate-200/60")}>
      <Ic size={16} className="shrink-0" /> {children}
    </button>
  );
}

function TituloSecao({ mod, sec, pac, der }) {
  const s = mod.secoes.find((x) => x.id === sec);
  return (
    <div className="mb-3 print:hidden">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">{mod.nome}</div>
      <h2 className="text-xl font-bold text-slate-800">{s?.nome}</h2>
      {pac.nome && <p className="text-xs text-slate-500">{pac.nome}{idadeDe(pac) ? `, ${idadeDe(pac)} anos` : ""}{der?.nomesFam.length ? ` · ${der.nomesFam.join(" + ")}` : ""}</p>}
    </div>
  );
}

/* ---------- checklist em tempo real ---------- */
function ItensChecklist({ der, d, up, ir }) {
  return (
    <div className="space-y-1">
      {der.checklist.map((c) => {
        const Ic = c.ok ? CheckCircle2 : c.alerta ? AlertTriangle : Circle;
        return (
          <div key={c.id} className="rounded-lg hover:bg-slate-50">
            <button onClick={() => (c.manual ? up(`docs.${c.id}`, !d.docs[c.id]) : ir(c.sec))} className="w-full flex items-start gap-2 px-2 py-1.5 text-left">
              <Ic size={16} className={"shrink-0 mt-0.5 " + (c.ok ? "text-teal-600" : c.alerta ? "text-amber-500" : "text-slate-300")} />
              <span className="min-w-0">
                <span className={"block text-[13px] " + (c.ok ? "text-slate-500" : "text-slate-800 font-medium")}>{c.nome}</span>
                {!c.ok && c.falta.length > 0 && (
                  <span className="block text-[11px] text-slate-400 leading-snug">{c.manual ? "toque para marcar" : c.falta.slice(0, 3).join(" · ")}{c.falta.length > 3 ? ` · +${c.falta.length - 3}` : ""}</span>
                )}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Checklist(props) {
  const { der } = props;
  const pct = Math.round((der.feitos / der.checklist.length) * 100);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800">Checklist do processo</h3>
        <span className="text-xs font-semibold text-teal-700">{der.feitos}/{der.checklist.length}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 mb-3 overflow-hidden"><div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} /></div>
      <ItensChecklist {...props} />
      {der.contraind && <p className="mt-2 text-[11px] text-rose-600 px-2">Contraindicação marcada no formulário de acesso.</p>}
    </div>
  );
}

function ChecklistMovel(props) {
  const [aberto, setAberto] = useState(false);
  const { der } = props;
  const pct = Math.round((der.feitos / der.checklist.length) * 100);
  return (
    <div className="xl:hidden mb-4 rounded-xl border border-slate-200 bg-white print:hidden">
      <button onClick={() => setAberto((o) => !o)} className="w-full flex items-center gap-3 px-3 py-2.5">
        <span className="text-sm font-bold text-slate-800">Checklist</span>
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-teal-500" style={{ width: `${pct}%` }} /></div>
        <span className="text-xs font-semibold text-teal-700">{der.feitos}/{der.checklist.length}</span>
        {aberto ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>
      {aberto && <div className="px-1 pb-2"><ItensChecklist {...props} /></div>}
    </div>
  );
}

/* ---------- perfil do médico ---------- */
function Perfil({ med, salvar }) {
  const m = med;
  const set = (k) => (v) => salvar({ ...m, [k]: v });
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Perfil do médico</h2>
        <p className="text-xs text-slate-500">Preencha uma vez: entra automaticamente no LME, termo, formulário, prescrição e relatório. Salva sozinho.</p>
      </div>
      <Cartao titulo="Médico solicitante">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-6" rot="Nome completo" obrig valor={m.nome} onChange={set("nome")} />
          <Txt className="sm:col-span-2" rot="CRM" obrig valor={m.crm} onChange={set("crm")} />
          <Txt className="sm:col-span-1" rot="UF" obrig valor={m.uf} onChange={(v) => set("uf")(v.toUpperCase().slice(0, 2))} />
          <Txt className="sm:col-span-3" rot="CNS do médico (Cartão SUS)" obrig valor={m.cns} onChange={set("cns")} dica="Campo 15 do LME." />
        </div>
      </Cartao>
      <Cartao titulo="Estabelecimento de saúde">
        <div className="grid gap-3 sm:grid-cols-6">
          <Txt className="sm:col-span-2" rot="CNES" obrig valor={m.cnes} onChange={set("cnes")} />
          <Txt className="sm:col-span-4" rot="Nome do estabelecimento" obrig valor={m.estabelecimento} onChange={set("estabelecimento")} />
          <Txt className="sm:col-span-2" rot="Cidade (local dos documentos)" valor={m.cidade} onChange={set("cidade")} />
          <Txt className="sm:col-span-4" rot="Endereço (cabeçalho da receita)" valor={m.endereco} onChange={set("endereco")} />
        </div>
      </Cartao>
    </div>
  );
}
