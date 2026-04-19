# Retrospectiva — Fase 1: Infraestrutura Base

**Data de execução:** 2026-04-17 a 2026-04-18  
**Executor:** Claude Code (claude-sonnet-4-6) + Paulo Reis Silva  
**Documento:** `docs/retrospectivas/FASE-1-RETROSPECTIVA.md`

---

## 1. RESUMO EXECUTIVO

A Fase 1 construiu toda a infraestrutura base do DermaPro: projeto Next.js bootstrapado com TypeScript strict, design system com tokens semânticos em três camadas, 10 utilitários de visão computacional com cobertura de testes, 11 componentes UI reutilizáveis, hub principal funcional com sessão de paciente, modo apresentação, páginas legais e 6 rotas de módulo placeholder. O período de execução foi de 2 dias consecutivos (17–18 abr 2026), com 35 commits granulares e deploy validado em produção em `https://dermapro-nine.vercel.app`. Resultado: Fase 1 concluída 100%, base sólida para implementação dos módulos na Fase 2.

---

## 2. BLOCOS EXECUTADOS

| Bloco | Status | Principal Entrega | Commits |
|-------|--------|-------------------|---------|
| 1 — Bootstrap | ✅ Concluído | Projeto Next.js 16 + TypeScript strict (`noUncheckedIndexedAccess`, `noImplicitReturns`) + Tailwind v4 + configs base | 1 |
| 2 — Dependências | ✅ Concluído | `npm install` com shadcn/ui 4.3, vitest, jsPDF, MediaPipe, ONNX Runtime Web, Lucide | 1 |
| 3 — Design System | ✅ Concluído | Tokens semânticos em 3 camadas (primitivas → aliases → CSS vars) + tipografia DM Sans + JetBrains Mono | 1 |
| 4 — Módulos Config | ✅ Concluído | Registro central de módulos (`modules.ts`) com feature flags (`enabled`, `comingSoon`) | 1 |
| 5 — ML/CV `_shared` | ✅ Concluído | 10 utilitários: `faceLandmarker`, `roiExtractor`, `colorSpace`, `hsvColorSpace`, `morphology`, `clahe`, `connectedComponents`, `gaussianBlur`, `hessianMatrix`, `itaCalculator` + `imageQuality` (QA) | 13 |
| 6 — Componentes UI | ✅ Concluído | shadcn/ui base + `DisclaimerModal`, `UploadCard`, `UncertaintyBanner`, `ModuleCard`, `DownloadPhotoButton`, `PresentationModeProvider`, `PresentationModeToggle` | 8 |
| 7 — PDF Export | ✅ Concluído | `pdfExportBase.ts`: helpers A4, margens, disclaimer fixo, filename timestampado | 1 |
| 8 — Páginas Legais | ✅ Concluído | `/sobre`, `/privacidade`, `/termos` com `LegalLayout` compartilhado e logo SVG inline | 1 |
| 9 — Hub Principal | ✅ Concluído | `app/page.tsx` com `SessionHeader` (localStorage/sessionStorage), `DisclaimerWrapper`, grade de `ModuleCard` responsiva | 1 |
| 10 — Placeholders | ✅ Concluído | Decisão dark-only documentada + `BACKLOG.md` + 6 rotas placeholder (`/acne`, `/melasma`, `/textura`, `/linhas`, `/rosacea`, `/estrutura-facial`) | 2 |
| 11 — Service Worker | ✅ Concluído | `public/sw.js`: cache-first para `_next/static/` e assets estáticos; network-first para HTML | 1 |
| 12 — Deploy | ✅ Concluído | Headers COOP/COEP (`credentialless`) + `vercel.json` + correção radix-ui umbrella → pacotes individuais | 2 |
| 13 — Retrospectiva | ✅ Concluído | Este documento | 1 |

**Total: 35 commits pré-retrospectiva + 1 retrospectiva = 36 commits na Fase 1.**

---

## 3. ESTATÍSTICAS DE CÓDIGO

### Arquivos por categoria

| Categoria | Arquivos |
|-----------|----------|
| Código de produção (`app/`, `components/`, `lib/`) | 54 |
| Testes (`*.test.ts` / `*.test.tsx`) | 13 |
| Documentação (`docs/`) | 6 (após este commit) |
| Design (`design/`) | 10 |

### Linhas de código

| Escopo | Linhas |
|--------|--------|
| `app/_shared/` (total, incluindo testes) | 5.268 |
| Arquivos de teste (`.test.ts`) | 1.528 |
| Código de produção em `app/_shared/` | ~3.740 |

### Testes

- **13 arquivos de teste** passando
- **173 testes** passando (`npm run test:shared`)
- **0 falhas**
- Duração média: ~1.2 s

### Commits totais na Fase 1

**36** (incluindo este commit de retrospectiva)

---

## 4. ARQUITETURA RESULTANTE

### Utilitários em `app/_shared/ml/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `faceLandmarker.ts` | Wrapper do MediaPipe Face Landmarker — carrega modelo `.task`, retorna 478 landmarks normalizados |
| `roiExtractor.ts` | Extrai regiões faciais (testa, bochechas, nariz, queixo, perioral) a partir dos landmarks |
| `colorSpace.ts` | Conversão RGB ↔ CIE L\*a\*b\* (para ITA e análise de pigmentação) |
| `hsvColorSpace.ts` | Conversão RGB ↔ HSV (para segmentação por cor em acne/rosácea) |
| `morphology.ts` | Erosão, dilatação, abertura e fechamento morfológicos (binário e grayscale) |
| `clahe.ts` | CLAHE — equalização de histograma adaptativa por contraste limitado |
| `connectedComponents.ts` | Rotulação de componentes conectados (4-conectividade) com estatísticas por componente |
| `gaussianBlur.ts` | Gaussian blur 2D separável com sigma configurável |
| `hessianMatrix.ts` | Matriz Hessiana 2D, autovalores e gradiente (base para detecção de estruturas) |
| `itaCalculator.ts` | Calculadora ITA (Individual Typology Angle) — classifica fototipo Fitzpatrick a partir de L\* e b\* |

### Utilitário em `app/_shared/qa/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `imageQuality.ts` | QA de imagem: métricas de blur (Laplaciano), brilho (média L\*), lateralidade (face centralizada) |

### Componentes em `app/_shared/components/`

| Componente | Responsabilidade |
|------------|-----------------|
| `DisclaimerModal.tsx` | Modal de aviso legal reutilizável por módulo (aceite por sessionStorage) |
| `DisclaimerWrapper.tsx` | Wrapper global que dispara `DisclaimerModal` no primeiro acesso da sessão |
| `DownloadPhotoButton.tsx` | Botão de download com opções: foto original ou foto anotada |
| `LegalLayout.tsx` | Layout compartilhado das 3 páginas legais (Server Component, logo SVG inline) |
| `ModuleCard.tsx` | Card de módulo para o hub — ícone dinâmico Lucide, status `comingSoon` |
| `PresentationModeProvider.tsx` | Context de modo apresentação — toggle via atalho `P`, aplica classe `presentation-mode` no `body` |
| `PresentationModeToggle.tsx` | Botão visível para toggle do modo apresentação |
| `ServiceWorkerRegistrar.tsx` | Registra/desregistra Service Worker conforme ambiente (prod/dev) |
| `SessionHeader.tsx` | Header do hub: nome do médico (localStorage), sessão de paciente (sessionStorage), relógio, dropdown Ajustes |
| `UncertaintyBanner.tsx` | Banner de alerta contextual para resultados de baixa confiança |
| `UploadCard.tsx` | Upload de imagem com drag-and-drop, validação de tipo/tamanho, preview |

### Como os módulos futuros consumirão essa base

Cada módulo em `app/<modulo>/` seguirá o padrão:

```
app/<modulo>/
  page.tsx          ← Server Component com DisclaimerModal por módulo
  _components/      ← Componentes específicos do módulo
  _hooks/           ← Lógica de estado local
```

Consumo direto da base:
- **`faceLandmarker` + `roiExtractor`** → detectar face e isolar ROI no upload
- **`imageQuality`** → validar imagem antes de processar (exibir `UncertaintyBanner` se baixa qualidade)
- **`colorSpace` / `hsvColorSpace`** → análise de pigmentação e segmentação
- **`morphology` + `connectedComponents`** → pós-processamento de máscaras
- **`itaCalculator`** → ajuste de limiar conforme fototipo do paciente
- **`UploadCard`** → entry point de imagem em todos os módulos
- **`pdfExportBase`** → geração de relatório A4 por módulo
- **`DisclaimerModal`** → aviso legal individual por módulo (além do global)
- **Design tokens** → cores, espaçamento e tipografia consistentes

---

## 5. DECISÕES ARQUITETURAIS QUE DIVERGIRAM DO MASTER ORIGINAL

### 5.1 Tailwind CSS v4 (implícito v3 no MASTER)

O MASTER foi escrito assumindo Tailwind v3. A instalação via `create-next-app` com `--tailwind` entregou Tailwind v4, que muda fundamentalmente a configuração: config CSS-first (`@theme inline`) em vez de `tailwind.config.js`, e `@custom-variant dark` para o modo escuro. Adaptado sem fricção — v4 é compatível com os tokens do design system.

### 5.2 Dark-only no MVP

Design system previa suporte a light + dark. Durante a validação visual do Bloco 9, o hub ficou coerente apenas no dark. Decisão tomada pelo usuário após validação visual: classe `.dark` fixada no `<html>` para todo o MVP. Light mode fica no BACKLOG. Documentado em `docs/00-MASTER.md`.

### 5.3 COEP: `credentialless` em vez de `require-corp`

O MASTER não especificava o valor do header COEP. `require-corp` é a escolha canônica para habilitar `SharedArrayBuffer` (necessário para workers WASM do MediaPipe), mas o CDN do MediaPipe (`storage.googleapis.com`) não serve header `Cross-Origin-Resource-Policy`. Resultado: com `require-corp`, os modelos não carregariam. Solução: `credentialless` — habilita `SharedArrayBuffer` e permite fetches anônimos cross-origin, adequado para apps que carregam modelos ML de CDN de terceiros.

### 5.4 Substituição de `radix-ui` umbrella por pacotes `@radix-ui/react-*` individuais

shadcn/ui 4.3.0 gera componentes importando do pacote monolítico `"radix-ui"` (padrão mais recente). Esse pacote resolve corretamente via Turbopack localmente, mas falha no build da Vercel (webpack) por incompatibilidade na resolução do campo `exports`. Correção: 8 componentes em `components/ui/` migrados para os pacotes individuais estáveis (`@radix-ui/react-slot`, `@radix-ui/react-dialog`, etc.). Dois novos pacotes instalados: `@radix-ui/react-dropdown-menu` e `@radix-ui/react-separator`. Correção adicional: `Slot.Root` → `Slot` (a API individual não usa namespace).

### 5.5 Camada semântica de tokens em três níveis

O design system do MASTER previa tokens. A implementação introduziu uma hierarquia explícita de três camadas:
1. **Primitivas** (`--color-gray-950`, `--color-dermapro-500`) — valores brutos
2. **Aliases semânticos** (`--color-background`, `--color-foreground`, `--color-primary`) — significado contextual
3. **Variáveis CSS + TypeScript** (`design/tokens.ts`) — consumíveis em ambos os ambientes

Essa estrutura garante que os módulos sempre referenciem semântica (não valores), facilitando futuras variações de tema.

### 5.6 Next.js 16.2.4 (vs 14+ esperado pelo MASTER)

O MASTER especificava "Next.js 14+". A instalação entregou 16.2.4, que inclui breaking changes documentados em `node_modules/next/dist/docs/`. O impacto mais relevante: a propriedade `headers()` em `next.config.ts` é a configuração de cabeçalhos HTTP (não confundir com `headers()` de `next/headers` para Server Components). Hook de validação pós-ferramenta (`posttooluse-validate: nextjs`) gerou falso positivo nesse padrão durante o desenvolvimento.

---

## 6. DÉBITOS TÉCNICOS CONHECIDOS

| Débito | Localização | Impacto | Prioridade |
|--------|-------------|---------|------------|
| CLAHE sem interpolação bilinear entre blocos | `app/_shared/ml/clahe.ts` | Artefatos de bloco visíveis em bordas de células — `TODO` documentado no arquivo | Médio — corrigir antes do módulo Textura |
| `Skeletonize` não implementado | Previsto em `_shared/ml/` | Algoritmo de esqueletonização necessário para análise de linhas finas no módulo Linhas | Médio — implementar no Bloco 5 da Fase 3 |
| PDF sem fonte Inter embutida | `app/_shared/report/pdfExportBase.ts` | Usa Helvetica padrão do jsPDF; tipografia diverge do design system | Baixo — cosmético |
| Landmarks MediaPipe com índices manuais | `app/_shared/ml/roiExtractor.ts` | **RESOLVIDO** (Fase 2, Bloco 4): mapeamento anatômico definitivo via `topographicIndices.json` portado do FacePipe Pro. 19 regiões com polígonos fechados validados. Bochechas compostas por 3 sub-polígonos (malar_lateral + malar_medial + infrapalpebral). | — |
| Service Worker sem pre-cache agressivo | `public/sw.js` | Modelos `.onnx` e `.task` não são pré-cacheados no install; primeira execução offline falha | Baixo no MVP; alto se offline for requisito |
| `imageQuality` sem calibração por câmera | `app/_shared/qa/imageQuality.ts` | Limiar de blur fixo (`150`) pode gerar falsos negativos em câmeras com compressão agressiva | Baixo — refinar com dados reais |
| Sem testes de integração de componentes | `app/_shared/components/` | Componentes testados apenas manualmente; sem cobertura vitest para React | Médio — adicionar nos módulos com Fase 2 |

---

## 7. PREPARAÇÃO PARA FASE 2

### Fase 2: Módulo Acne (`docs/03-MODULO-ACNE.md` — a criar)

**Dependências da base já prontas:**

| Utilitário / Componente | Uso no módulo Acne |
|-------------------------|-------------------|
| `faceLandmarker` | Detectar face e validar enquadramento antes do processamento |
| `roiExtractor` | Isolar regiões T-zone (testa, nariz) e U-zone (bochechas) |
| `imageQuality` | Bloquear processamento se blur > limiar; exibir `UncertaintyBanner` |
| `hsvColorSpace` | Segmentação inicial de lesões por matiz (vermelho/marrom) |
| `morphology` | Limpar máscara de lesões (abertura morfológica) |
| `connectedComponents` | Contar e classificar lesões individuais |
| `itaCalculator` | Ajustar limiar de segmentação HSV conforme fototipo |
| `UploadCard` | Entrada da imagem do paciente |
| `DisclaimerModal` | Aviso legal específico do módulo Acne |
| `UncertaintyBanner` | Alertas contextuais ("Qualidade insuficiente", "Face não detectada") |
| `DownloadPhotoButton` | Download da foto anotada com marcações de lesões |
| `pdfExportBase` | Relatório A4 com contagem, distribuição e severidade estimada |
| Design tokens | Cores, espaçamento, tipografia |

**Dependência nova prevista:**

- `onnxruntime-web` — já instalado (`package.json`)
- Modelo `acne-yolov8n.onnx` — a baixar via GitHub Releases (repositório a definir em `docs/03-MODULO-ACNE.md`)
- Pipeline: imagem → ROI crop → pré-processamento → inferência ONNX → pós-processamento → contagem + severidade → PDF

**Decisão de arquitetura a tomar na Fase 2:** definir se o carregamento do modelo ONNX será eager (no mount do módulo) ou lazy (no primeiro upload). Recomendação: lazy com indicador de progresso via `UncertaintyBanner` + estado de loading.

---

## 8. RECONHECIMENTOS

O processo de desenvolvimento em blocos granulares com commits atômicos funcionou excepcionalmente bem: a rastreabilidade do git log é total, e o rollback granular teria sido possível em qualquer ponto. A decisão de validar visualmente cada bloco UI antes de avançar (em vez de seguir cegamente o spec) evitou ao menos dois retrabalhos identificados durante o Bloco 9. Para as próximas fases, recomenda-se manter o padrão de "pare antes do push para revisão" especialmente nos blocos que introduzem novas dependências ou mudanças em `next.config.ts` — o caso radix-ui demonstrou que o ambiente local (Turbopack) e o ambiente de CI (webpack/Vercel) podem divergir silenciosamente.
