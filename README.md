# DOSUS Neuro

Preenchimento automatizado de documentos do SUS para neurologia. React + Vite + Tailwind. Funciona **offline** depois da primeira visita, e pode ser instalado como aplicativo pelo navegador.

```bash
npm install
npm run dev      # desenvolvimento: http://localhost:5173
npm run build    # gera dist/ (com service worker para uso offline)
npm run preview  # testa o build
```

Antes do primeiro uso, configure o Firebase (abaixo).

## Doença de Alzheimer

Segue o PCDT (Portaria Conjunta SAES/SCTIE nº 27/2025) e as orientações da SESAB/BA.

- **O que pedir / elegibilidade** — documentos, exames com validade, critérios de MEEM/CDR por medicamento, monitoramento, renovação e unidades de referência.
- **Paciente e história** — identificação, CID-10, capacidade/responsável e história clínica (alimentam todos os documentos).
- **MEEM** e **CDR** — com ficha para impressão (vieram do NeuroCalc; cópia em `src/shared/`).
- **Exames** — marque o que vai pedir (códigos SIGTAP editáveis) e gere: o **chequinho SESAB** impresso (3 por folha; laboratório pode ir numa guia só), o **texto da solicitação** para copiar e o **laudo APAC** preenchido (1 principal + 5 secundários). Abaixo, o registro dos resultados com alerta de validade vencida.
- **Prescrição** — esquemas clicáveis (titulação/manutenção) → texto para a prescrição eletrônica e quantidades do LME.
- **LME** — preenche o PDF oficial (`public/docs/lme-2026.pdf`) no próprio navegador; o PDF gerado continua editável.
- **Termo de esclarecimento** e **Formulário de acesso** — modelos da SESAB com cabeçalho e brasão, impressos já preenchidos.
- **Relatório médico** — alternativa ao formulário de acesso, texto pronto para o prontuário.
- **Imprimir tudo** — Termo (1 ou 2 vias), Formulário de acesso, MEEM e CDR numa só impressão; LME + APAC num único PDF.
- **Checklist em tempo real** — mostra o que falta em cada documento.

## Epilepsia

Segue o PCDT (Portaria Conjunta SAES/SCTIE nº 17/2018) e as orientações da SESAB/BA: CIDs G40.0–G40.8, os 15
medicamentos do CEAF (levetiracetam, lamotrigina, topiramato, clobazam, gabapentina, vigabatrina, etossuximida) com
esquemas prontos, crises pela ILAE 2017, tratamento (1ª/2ª monoterapia, associação) com alerta quando a associação
foge de "espectro amplo + restrito", termo e formulário de acesso nos modelos da SESAB de 2026, relatório, exames
(EEG, RM e monitoramento anual) e Imprimir tudo.

**Login com Google:** cada conta tem o próprio perfil e os próprios pacientes, guardados no Firestore em
`users/{uid}/…` (as regras em `firestore.rules` impedem uma conta de ver a outra). O app guarda uma cópia no
aparelho para funcionar offline e sincroniza quando a conexão volta; ao **sair**, essa cópia é apagada.

**Pacientes (arquivo):** busca por nome, mãe, CPF ou CNS; reabrir, renovar (copia o processo anterior e zera
MEEM/CDR/datas) e backup/importação em `.json`. Pacientes da versão antiga (só no navegador) podem ser levados para a conta no primeiro login.

**Perfil do médico:** nome, CRM, CNS, CNES e estabelecimento — preenchido uma vez, usado em todos os documentos.

## Configurar o Firebase (uma vez)

1. Em <https://console.firebase.google.com> → **Adicionar projeto** → nome `dosus-neuro` (Google Analytics pode ficar desligado).
2. **Authentication** → Começar → **Método de login** → **Google** → Ativar → escolha o e-mail de suporte → Salvar.
3. **Firestore Database** → Criar banco de dados → local **southamerica-east1 (São Paulo)** → modo de **produção**.
4. **Firestore → Regras**: cole o conteúdo de `firestore.rules` e publique (ou `npx firebase deploy --only firestore:rules`).
5. **Configurações do projeto** (engrenagem) → **Seus apps** → ícone **Web `</>`** → apelido `DOSUS Neuro` →
   copie o objeto `firebaseConfig` para `src/firebase-config.js`.
6. Ao publicar num domínio próprio: **Authentication → Configurações → Domínios autorizados** → adicione o domínio
   (`localhost` e `*.web.app` já vêm liberados).

### Publicar no Firebase Hosting

```bash
npx firebase login
npx firebase use --add          # escolha o projeto dosus-neuro
npm run build && npx firebase deploy
```

O endereço fica `https://<projeto>.web.app`.

### Testar sem projeto (emuladores locais, precisa de Java)

```bash
npm run emuladores     # num terminal
npm run dev:emulador   # em outro: http://localhost:5175
```

**LGPD:** são dados pessoais sensíveis (saúde). O médico é o controlador; mantenha o banco em São Paulo, use as
regras de segurança, oriente os pacientes e não compartilhe a conta.

## Para adicionar uma patologia

Partes comuns (já prontas): identificação do paciente (`pacienteComum.jsx`), prescrição (`prescricao.jsx`), LME
(`lmeTela.jsx`, `lme.js`), solicitação de exames/chequinho/APAC (`solicitacao.jsx`, `apac.js`), resultados de
exames (`exames.jsx`), Imprimir tudo (`imprimirTudo.jsx`), checklist e arquivo.

1. `src/<patologia>/dados.js` — CIDs, apresentações (texto exato da lista do LME), esquemas, exames, critérios.
2. `processo.js` — modelo de dados (`novo…`) e `derivar()` (o que falta em cada documento → checklist).
3. `telas.jsx`, `documentos.jsx` (termo, formulário, relatório nos modelos da SESAB), `textos.js`.
4. `index.jsx` — o módulo: seções do menu, `render()`, `renovar()`; registre em `src/patologias.js`.
