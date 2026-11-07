# DOSUS Neuro

Preenchimento automatizado de documentos do SUS para neurologia. React + Vite + Tailwind. Funciona **offline** depois da primeira visita, e pode ser instalado como aplicativo pelo navegador.

```bash
npm install
npm run dev      # desenvolvimento: http://localhost:5173
npm run build    # gera dist/ (com service worker para uso offline)
npm run preview  # testa o build
```

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

**Pacientes (arquivo):** tudo fica salvo no IndexedDB do navegador (sem servidor). Busca por nome, mãe, CPF ou CNS;
reabrir, renovar (copia o processo anterior e zera MEEM/CDR/datas) e backup/importação em `.json`.

**Perfil do médico:** nome, CRM, CNS, CNES e estabelecimento — preenchido uma vez, usado em todos os documentos.

## Para adicionar uma patologia

1. `src/<patologia>/dados.js` — CIDs, medicamentos (texto exato da lista do LME), exames, critérios.
2. `processo.js` — modelo de dados e `derivar()` (o que falta em cada documento → checklist).
3. Telas e documentos impressos; registrar em `patologias` e nas seções em `src/DosusApp.jsx`.
