# DermaPro — Documento Master

**Versão 2.0  ·  Abril 2026**
**Link:** [github.com/reispaulosilva-boop/dermapro](https://github.com/reispaulosilva-boop/dermapro)
**Deploy em produção:** [dermapro-nine.vercel.app](https://dermapro-nine.vercel.app)

> [!NOTE]
> **Nota desta versão:** Este documento incorpora todas as decisões arquiteturais tomadas durante a execução das Fases 1 e 2 (17–19 abr 2026) que divergiram ou complementaram a versão 1.0 original. É a fonte de verdade para qualquer nova sessão de desenvolvimento — incluindo continuidade no Google Gemini CLI ou qualquer outro ambiente.

---

## 1. Visão do Produto

### 1.1 O que é o DermaPro
DermaPro é uma aplicação web de análise visual da pele, construída para uso em consultório dermatológico. Roda em Next.js 16, 100% client-side (imagens nunca saem do dispositivo), hospedada gratuitamente na Vercel.

### 1.2 Perfil do usuário principal
Médico dermatologista (proprietário do projeto) que atende em consultório e utiliza a ferramenta durante a consulta, com foto tirada do celular, enviada ao notebook (MacBook M1) e espelhada em Apple TV para conversa visual com o paciente.

**Implicações do cenário de uso:**
- **Estética clínica moderna** é tão importante quanto a precisão dos algoritmos.
- **Legibilidade a distância:** interface será vista em TV a alguns metros.
- **Ambiente emocionalmente sensível:** paciente está presente, vê a tela. Linguagem e cores importam.
- **Velocidade importa:** análise em poucos segundos para não travar o fluxo da consulta.
- **Download da foto analisada a qualquer momento:** requisito transversal obrigatório.

### 1.3 Filosofia do produto
- **Privacidade radical:** zero imagem transmitida a servidor.
- **Interpretabilidade:** cada número é rastreável até uma medida geométrica ou fotométrica concreta.
- **Linguagem respeitosa:** ferramenta assiste a conversa clínica, nunca julga o paciente.
- **Custo zero operacional:** Vercel Hobby + GitHub + inferência no navegador.
- **Arquitetura evolutiva:** módulos novos plugam sem refatoração.

---

## 2. Arquitetura Global

### 2.1 Stack real (pós-execução)
> [!IMPORTANT]
> Os valores abaixo refletem o que foi efetivamente instalado e executado, não o que estava planejado na v1.0.

| Biblioteca / Ferramenta | Versão real | Observação |
| :--- | :--- | :--- |
| **Next.js** | 16.2.4 | Planejado "14+". create-next-app instalou v16 — sem impacto negativo. |
| **TypeScript** | strict | `noUncheckedIndexedAccess + noImplicitReturns` ativados. |
| **Tailwind CSS** | v4 (CSS-first) | Sem `tailwind.config.ts`. Config via `@theme` inline no `globals.css`. |
| **shadcn/ui** | 4.3.0 | Pacotes `@radix-ui/*` individuais (não umbrella "radix-ui" — ver Seção 10). |
| **MediaPipe Face Landmarker** | latest CDN | Apache 2.0. `topographicIndices.json` do FacePipe Pro (19 regiões). |
| **ONNX Runtime Web** | latest | MIT. Apenas módulo Acne. WebGPU removido (bug M1 — ver Seção 10). |
| **jsPDF** | latest | PDF A4. Fonte Helvetica padrão (DM Sans embutida = débito técnico). |
| **Recharts** | latest | Lazy-loaded via `next/dynamic` (evita SSR e chunk pesado). |
| **Vitest** | latest | Obrigatório em `_shared/`. 267 testes passando pós-Fase 2. |
| **DM Sans** | Google Fonts | Tipografia principal via CSS var `--font-dm-sans`. |
| **JetBrains Mono** | Google Fonts | Tipografia monospace via CSS var `--font-jetbrains-mono`. |

### 2.2 Hospedagem

| Serviço | Uso | Custo |
| :--- | :--- | :--- |
| **GitHub** | Repositório único, branch `main`. | R$ 0 |
| **Vercel Hobby** | Deploy automático no push. | R$ 0 |
| **Hugging Face Hub** | Modelo ONNX do Acne (~99 MB). CORS habilitado. | R$ 0 |

> [!NOTE]
> **Nota sobre COEP:** header configurado como `credentialless` (não `require-corp`). Motivo: CDN do MediaPipe (`storage.googleapis.com`) não serve `Cross-Origin-Resource-Policy`. `credentialless` habilita `SharedArrayBuffer` e permite fetches anônimos cross-origin.

### 2.3 Estrutura de pastas (estado atual)
```
dermapro/
├── app/
│   ├── layout.tsx                     # dark fixo: classe .dark no <html>
│   ├── page.tsx                       # HUB com SessionHeader + DisclaimerWrapper
│   ├── globals.css                    # Tailwind v4 @theme inline + tokens
│   ├── sobre/ privacidade/ termos/    # LegalLayout compartilhado
│   ├── _shared/
│   │   ├── ml/                        # 10 utilitários CV + topographicIndices.json
│   │   ├── qa/                        # imageQuality.ts
│   │   ├── components/                # 11 componentes reutilizáveis
│   │   ├── report/                    # pdfExportBase.ts
│   │   ├── design/                    # tokens.ts + tokens.css
│   │   └── config/                    # modules.ts + models.ts (NOVO Fase 2)
│   ├── acne/                          # Módulo 1 — IMPLEMENTADO ✅
│   │   ├── _components/               # 7 componentes específicos
│   │   ├── _hooks/                    # useAcneDetector + useModelDownload
│   │   └── _lib/                      # acneOverlay + acnePdfExport
│   ├── melasma/ textura/ linhas/      # Placeholder (rotas criadas, lógica pendente)
│   ├── rosacea/ estrutura-facial/     # Desativados (enabled: false)
├── public/
│   ├── sw.js                          # Service Worker (cache-first assets)
│   └── wasm/                          # ONNX Runtime WASM
├── docs/                              # documentação de projeto
│   └── retrospectivas/                # FASE-1 e FASE-2 retrospectivas
├── next.config.ts                     # (gerado .ts, não .js)
├── vercel.json                        # headers COOP/COEP
├── BACKLOG.md                         # light mode + funcionalidades futuras
├── LICENSE (AGPL-3.0) + NOTICE
```

---

## 3. Registro de Módulos e Feature Flags

### 3.1 Estado atual dos módulos
| ID | Nome | Status | Badge | Rota |
| :--- | :--- | :--- | :--- | :--- |
| **acne** | Análise de Acne | ✅ Implementado | beta | `/acne` |
| **melasma** | Análise de Melasma | ⏳ Placeholder | beta | `/melasma` |
| **textura** | Análise de Textura | ⏳ Placeholder | beta | `/textura` |
| **linhas** | Análise de Sinais de Expressão | ⏳ Placeholder | beta | `/linhas` |
| **rosacea** | Análise de Rosácea | 🔒 Desativado | em-breve | `/rosacea` |
| **estrutura-facial** | Análise de Estrutura Facial | 🔒 Desativado | em-breve | `/estrutura-facial` |

### 3.2 Arquivo central: `app/_shared/config/modules.ts`
- **Tipo `ModuleConfig`**: `id`, `enabled`, `name`, `description`, `href`, `icon` (lucide-react), `order`, `badge`.
- **Funções exportadas:** `getEnabledModules()`, `getAllModules()`, `getModuleById(id)`.

### 3.3 Arquivo novo: `app/_shared/config/models.ts`
- Criado na Fase 2. Centraliza configuração de modelos ML (URL, tamanho esperado, ID para cache).
- **Modelo Acne:** [Hugging Face Hub](https://huggingface.co/drpauloreis/dermapro-acne-yolov8m) (~99 MB, Apache 2.0).
- `USE_STUB_DETECTOR`: `false` em produção. Setar `true` localmente para testes sem modelo.

---

## 4. Padrões Transversais

### 4.1 Download de foto
`<DownloadPhotoButton />` com opções: baixar foto original · baixar foto anotada (canvas com overlays). Nome de arquivo: `dermapro-{modulo}-{YYYY-MM-DD-HHMMSS}.{ext}`.
> [!IMPORTANT]
> Usar `useState` (não `useRef`) para passar canvas a componentes filhos — `useRef` não dispara re-render.

### 4.2 Modo Apresentação
Toggle no canto superior direito. Esconde chrome de navegação, amplia painéis, aumenta tipografia em 20%, amplia overlays. Atalho de teclado: `P`.
`PresentationModeProvider` (Context) + `PresentationModeToggle` (botão). Classe `.presentation-mode` aplicada no body.

### 4.3 Design System — Tailwind v4 CSS-first
Três camadas de tokens:
1. **Primitivas** (`design/tokens.css`): variáveis CSS brutas.
2. **Aliases semânticos** (`:root` em `globals.css`): `--bg-surface`, `--text-strong` etc.
3. **Integração Tailwind** (`@theme` inline): utilitários gerados sem duplicar `:root`.

**Dark-only no MVP:** classe `.dark` fixada no `<html>` via `layout.tsx`. Não há toggle. Light mode está no `BACKLOG.md`.

### 4.4 Linguagem — regras absolutas de UI
> [!CAUTION]
> **Proibido:** "problema", "defeito", "anormal", "danificado", "diagnóstico", "doença", "tratamento", "antienvelhecimento", "envelhecido", "velho". Nunca estimar idade do paciente.

**Preferido:** "sinais", "característica", "padrão observado", "marca natural". Linguagem descritiva, nunca prescritiva.

### 4.5 Licenças
| Item | Licença | Restrição importante |
| :--- | :--- | :--- |
| **Código DermaPro** | AGPL-3.0 | Uso próprio, não-comercial |
| **Modelo Acne** | Apache 2.0 | Atribuição em NOTICE: Nathaniel Handan, Amina Shiga |
| **MediaPipe** | Apache 2.0 | — |
| **ONNX Runtime** | MIT | — |
| **FFHQ-Wrinkle** | CC BY-NC-SA 4.0 | Não-comercial obrigatório. |

### 4.6 Git e commits
- **Branch única:** `main`. Sem develop, sem feature branches.
- **Convenção:** `feat:` novidades · `fix:` correções · `chore:` infra · `docs:` documentação.

### 4.7 Testes
- **Obrigatório em `_shared/`**: cada arquivo de `_shared/ml/` e `_shared/qa/` tem `.test.ts` com cobertura.
- **Estado atual:** 267 testes passando, 0 falhas.

### 4.8 Canvas e Apple TV — devicePixelRatio
`canvas.width = logicalWidth * dpr` + `ctx.scale(dpr, dpr)`. Sem isso, análise fica borrada em TV 4K.

### 4.9 Service Worker
`public/sw.js`: cache-first para static assets. Network-first para HTML.
> [!WARNING]
> Modelos `.onnx` e `.task` NÃO são pré-cacheados. Primeira execução offline falha.

---

## 5. Ordem de Execução e Estado das Fases

| Fase | Conteúdo | Status | Tag Git |
| :--- | :--- | :--- | :--- |
| **0 — Design System** | Tokens, paleta, tipografia | ✅ Concluído | — |
| **1 — Infra Base** | Next.js 16, _shared/, hub, deploy | ✅ Concluído | `v0.1.0-fase1` |
| **2 — Módulo Acne** | Pipeline YOLOv8m, Hayashi I-IV, PDF | ✅ Concluído | `v0.2.0-acne` |
| **3 — Módulo Melasma** | Colorimetria ITA, segmentação pigmento | ⏳ Pendente | — |
| **4 — Módulo Textura** | Poros (CLAHE), oleosidade (HSV) | ⏳ Pendente | — |
| **5 — Módulo Sinais de Expressão** | Frangi + skeletonize + hessian | ⏳ Pendente | — |
| **6 — Módulos Futuros** | Rosácea + Estrutura Facial | ⏳ Pendente | — |

---

## 6. Inventário de Componentes `_shared/`

### 6.1 Utilitários ML/CV (`_shared/ml/`)
- `faceLandmarker.ts`: Wrapper MediaPipe — 468 pontos faciais.
- `roiExtractor.ts`: ROIs compostas por sub-polígonos. Usa `topographicIndices.json`.
- `topographicIndices.json`: Mapeamento anatômico canônico portado do FacePipe Pro.
- `extractPolygonPaths.ts`: Extrai paths SVG/canvas a partir dos índices topográficos.
- `colorSpace.ts`: RGB ↔ CIE L*a*b*.
- `hsvColorSpace.ts`: RGB ↔ HSV.
- `clahe.ts`: CLAHE. **DÉBITO:** sem interpolação bilinear.
- `itaCalculator.ts`: Individual Typology Angle. **DÉBITO:** usa bbox.

### 6.2 Utilitários YOLO (`_shared/ml/yolo/`)
- `yoloPreprocess.ts`: Letterbox 640×640 + normalização + CHW.
- `yoloPostprocess.ts`: Decode layout [1,5,8400] attr-major + NMS.
- `filterDetectionsByROI.ts`: Descarta bboxes fora das ROIs.
- `countByRegion.ts`: Agrupa detecções por região.
- `hayashiSeverity.ts`: Severidade I-IV (Hayashi 2008).

---

## 7. Módulo Acne — Implementação (Referência)

### 7.1 Pipeline
`Disclaimer → ROI Validation → Upload → Analyzing (ONNX) → Results`
- **Modelo:** YOLOv8m (~99 MB). Hugging Face Hub.
- **Backend:** WASM apenas (WebGPU removido por bug no M1).
- **Cache:** IndexedDB.

---

## 8. Débitos Técnicos Conhecidos

| Débito | Arquivo | Impacto | Prioridade |
| :--- | :--- | :--- | :--- |
| **CLAHE sem interpolação bilinear** | `clahe.ts` | Artefatos de bloco | **ALTA** |
| **QA de imagem no upload do Acne** | `AcneModuleClient.tsx` | Risco clínico | **ALTA** |
| **Skeletonize não implementado** | `_shared/ml/` | Necessário para Linhas | **MÉDIA** |
| **itaCalculator usa bbox** | `itaCalculator.ts` | Imprecisão Melasma | **MÉDIA** |

---

## 9. Identidade Visual

### 9.1 Paleta implementada
- `--primary-500`: `#0F4C5C` (Azul-petróleo).
- `--accent-amber`: `#F4A261` (Âmbar).
- **Módulo Acne:** `#c97d6a` (terracota).
- **Módulo Melasma:** `#b78a5a` (âmbar-caramelo).

---

## 10. Decisões Tomadas Durante a Execução

### 10.1 Divergências da v1.0
- **Next.js 16.2.4**: create-next-app instalou v16 por padrão.
- **Tailwind v4**: Instado nativamente. Sem `tailwind.config.ts`.
- **Dark-only**: Decisão pós-validação visual (17/04/2026).
- **COEP credentialless**: Necessário para CDN MediaPipe.

---

## 11. Checklist de Decisões Consolidadas (v2.0)
- **URL produção:** [https://dermapro-nine.vercel.app](https://dermapro-nine.vercel.app)
- **Modelo Acne:** Hugging Face Hub.
- **Testes:** 267 passando.
- **Licença:** AGPL-3.0.

---

## 12. Como Proceder nas Próximas Fases

### 12.1 Antes do Melasma (Fase 3)
1. **Resolver `itaCalculator`**: substituir bbox por `isPointInROI()`.
2. **QA no upload do Acne**: chamar `runQualityChecks` no step upload.

### 12.2 Antes da Textura (Fase 4)
Corrigir **CLAHE** com interpolação bilinear.

### 12.3 Antes das Linhas (Fase 5)
Implementar **Skeletonize**.

---

**Fim do Documento Master — Versão 2.0 — Abril 2026**
