# Retrospectiva — Fase 2: Módulo Acne

**Data de execução:** 2026-04-18 a 2026-04-19  
**Executor:** Claude Code (claude-sonnet-4-6) + Paulo Reis Silva  
**Documento:** `docs/retrospectivas/FASE-2-RETROSPECTIVA.md`  
**Tag:** `v0.2.0-acne`

---

## 1. RESUMO EXECUTIVO

A Fase 2 entregou o módulo de análise de acne completo — do bootstrap de estrutura até o deploy em produção com tag semântica. O fluxo implementado cobre: validação visual de ROIs faciais com MediaPipe → upload de foto do paciente → download e cache do modelo YOLOv8m → inferência ONNX → contagem por região facial → classificação de severidade pela escala de Hayashi (2008) → exportação de relatório PDF. A fase durou 2 dias (18–19 abr 2026), com 22 commits granulares. Um débito técnico crítico herdado da Fase 1 (landmarks com índices manuais imprecisos) foi resolvido via integração de `topographicIndices.json` do projeto FacePipe Pro, exigindo 4 rodadas de validação visual antes de avançar para os blocos de inferência.

---

## 2. BLOCOS EXECUTADOS

| Bloco | Status | Principal Entrega | Commits |
|-------|--------|-------------------|---------|
| Pré — Estrutura | ✅ | Pastas `_components/`, `_hooks/`, `_lib/`; constantes (`MODEL_ID`, `HAYASHI_THRESHOLDS`, `REGION_LABELS_PT`); scripts de conversão ONNX | 3 |
| Pré — Download | ✅ | `useModelDownload` com progresso por streaming, cache IndexedDB (degradação graciosa), mensagens de erro em pt-BR, reducer testado | 1 |
| Pré — ROIs (4 rodadas) | ✅ | `topographicIndices.json` (19 regiões FacePipe Pro) + `extractPolygonPaths.ts` + refactor completo de `roiExtractor.ts` (5 ROIs compostas por sub-polígonos) + `ROIValidationCanvas` com `evenodd` | 6 |
| Bloco 5 — Detecção | ✅ | `yoloPreprocess.ts` (letterbox + CHW), `yoloPostprocess.ts` (decode YOLOv8 + NMS + rescale), `useAcneDetector` (WebGPU → WASM) | 1 |
| Bloco 6 — Contagem | ✅ | `filterDetectionsByROI`, `countByRegion`, `hayashiSeverity` (Hayashi 2008: I Leve / II Moderado / III Marcante / IV Intenso) | 1 |
| Bloco 7 — UI | ✅ | `acneOverlay.ts`, `AcnePreviewCanvas` (DPR + `useImperativeHandle`), `SeverityBadge`, `RegionChart` (Recharts), `AcneResultPanel`, `AcneModuleClient` (máquina de estados 5 passos) | 1 |
| Bloco 8 — E2E | ✅ | Validação manual — identificou bug de UI (estado `'error'` do download sem mensagem) corrigido inline | — |
| Bloco 9 — PDF | ✅ | `acnePdfExport.ts`: foto anotada + severidade com cor por nível + tabela de regiões + bloco QA warnings + footer disclaimer; `ROIValidationFlow` passa `warnings` ao callback | 1 |
| Bloco 10 — Polish | ✅ | `minWidth` mobile, `RegionChart` via `next/dynamic`, `role="status"/"alert"` + `aria-live`, `SeverityBadge` escala em modo apresentação, `PresentationModeToggle` em resultados, erro de download visível na tela de upload, `originalCanvasRef` → `useState` | 1 |
| Bloco 11 — Deploy | ✅ | Fix `itaCalculator.ts` (bbox antigo), build limpo, bump `0.1.0 → 0.2.0`, push, tag `v0.2.0-acne` | 1 |
| Bloco 12 — Retrospectiva | ✅ | Este documento | 1 |

**Total: 22 commits na Fase 2.**

---

## 3. ESTATÍSTICAS DE CÓDIGO

### Arquivos criados/modificados na Fase 2

| Categoria | Arquivos |
|-----------|----------|
| `app/acne/` (componentes, hooks, lib) | 19 |
| `app/_shared/ml/yolo/` (pipeline YOLO) | 5 |
| `app/_shared/ml/` (ROIs + landmarks) | 3 (`topographicIndices.json`, `extractPolygonPaths.ts`, refactor `roiExtractor.ts`) |
| `app/_shared/config/` | 1 (`models.ts`) |
| Scripts de conversão | 2 |
| **Total** | **45 arquivos** (3.588 inserções, 196 remoções) |

### Testes

| Métrica | Fase 1 | Fase 2 |
|---------|--------|--------|
| Arquivos de teste | 13 | 20 |
| Testes passando | 173 | 267 |
| Novos testes (Fase 2) | — | +94 |
| Falhas | 0 | 0 |

---

## 4. ARQUITETURA RESULTANTE

### Fluxo de execução do módulo Acne

```
Disclaimer
    ↓ aceitar (inicia download do modelo em background)
ROI Validation
    ↓ upload foto → MediaPipe → extrair 5 ROIs → validação visual → confirmar
    ↓ (ou pular se já validado nesta sessão — localStorage)
Upload da foto de análise
    ↓ UploadCard → createImageBitmap
Analyzing
    ↓ detect(canvas) → LandmarkPoint[] → extract{Forehead,Cheek,Chin,Nose}ROI
    ↓ useAcneDetector.detect(canvas) → Detection[]  (WebGPU → WASM)
    ↓ countByRegion → RegionCount[]
    ↓ hayashiSeverity → SeverityResult
Results
    ↓ AcnePreviewCanvas (canvas DPR + bboxes sobrepostos)
    ↓ SeverityBadge + RegionChart
    ↓ DownloadPhotoButton (original / anotada)
    ↓ Exportar PDF (acnePdfExport.ts)
```

### Componentes em `app/acne/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `_components/AcneModuleClient.tsx` | Máquina de estados: `disclaimer → roi_validation → upload → analyzing → results`; coordena todos os hooks |
| `_components/AcnePreviewCanvas.tsx` | Canvas com DPR correto, bboxes de lesões desenhadas, `useImperativeHandle` expõe `getAnnotatedCanvas()` |
| `_components/AcneResultPanel.tsx` | Layout 60/40 (canvas + stats); `RegionChart` via `next/dynamic` |
| `_components/SeverityBadge.tsx` | Nível Hayashi com cor do design system; escala em `presentationMode` |
| `_components/RegionChart.tsx` | Recharts BarChart horizontal por região; lazy-loaded |
| `_components/ROIValidationCanvas.tsx` | Canvas de validação visual com polígonos ROI em `evenodd` |
| `_components/ROIValidationFlow.tsx` | Fluxo upload → QA → MediaPipe → revisão; passa `(correct, warnings[])` ao pai |
| `_components/ROIValidationControls.tsx` | Controles de confirmação/rejeição da validação visual |
| `_hooks/useAcneDetector.ts` | Gerencia ciclo de vida da sessão ONNX; `detect()` → pré-processa → infere → pós-processa; `USE_STUB_DETECTOR` para testes |
| `_hooks/useModelDownload.ts` | Download com progresso por streaming, cache IndexedDB, reducer testado |
| `_lib/acneOverlay.ts` | `drawBboxesOnCanvas`: rounded rects com fill sutil + stroke terracota |
| `_lib/acnePdfExport.ts` | PDF A4: foto + severidade + tabela de regiões + avisos QA + disclaimer |
| `_lib/countByRegion.ts` | `filterDetectionsByROI` (ray casting), `countByRegion` → `RegionCount[]` |
| `_lib/hayashiSeverity.ts` | Escala Hayashi 2008 — nunca "grave"/"severo" (MASTER §4.4) |
| `_lib/constants.ts` | Constantes do módulo: thresholds, labels, instruções |

### Adições em `app/_shared/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `ml/topographicIndices.json` | 19 regiões anatômicas com índices canônicos do FacePipe Pro (478 landmarks MediaPipe) |
| `ml/extractPolygonPaths.ts` | Detecta sub-caminhos fechados na convenção FacePipe (índice repetido = fechamento) |
| `ml/yolo/yoloPreprocess.ts` | Letterbox 640×640, HWC→CHW, normaliza [0,1] |
| `ml/yolo/yoloPostprocess.ts` | Decodifica YOLOv8 `[1,5,8400]`, NMS, rescale para coords originais |
| `config/models.ts` | Registro de `ModelConfig` com URL, tamanho esperado, `classNames`, `USE_STUB_DETECTOR` |

---

## 5. DECISÕES ARQUITETURAIS RELEVANTES

### 5.1 `topographicIndices.json` do FacePipe Pro em vez de índices manuais

O débito técnico de Fase 1 (índices de landmarks escritos manualmente e nunca validados visualmente) exigiu 4 rodadas de correção antes de ser resolvido definitivamente. A solução foi portar o arquivo `topographicIndices.json` do projeto FacePipe Pro, que contém 19 regiões com polígonos validados. A convenção de fechamento (índice inicial repetido ao final) foi encapsulada em `extractPolygonPaths.ts`, tornando o mapeamento auditável e reutilizável por futuros módulos.

**Lição:** índices de landmarks nunca devem ser escritos à mão sem validação visual imediata. Qualquer novo mapeamento anatômico deve ter um canvas de preview antes de ser marcado como pronto.

### 5.2 `beginPath()` fora do loop de polígonos (bug crítico recorrente)

O bug de `ctx.beginPath()` dentro do `for (const polygon of polygons)` apareceu **duas vezes** — na implementação original e novamente após o refactor de ROIs. Cada chamada a `beginPath()` limpa o caminho acumulado, fazendo apenas o último sub-polígono ser renderizado. A regra correta: um único `beginPath()` antes do loop, `moveTo()` para cada sub-polígono, e `fill('evenodd')` único ao final.

**Lição:** documentar esse padrão como `CANVAS_PATTERN.md` ou comentário de aviso no arquivo seria evitado a segunda ocorrência.

### 5.3 Layout YOLOv8 `[1, 5, 8400]`: `output[attr * 8400 + anchor]`

Modelos YOLOv8 exportados pela Ultralytics têm o tensor de saída transposto em relação à expectativa ingênua. O layout correto é `attr-major`: `output[attr * numAnchors + anchorIdx]`, onde `attr` ∈ {cx=0, cy=1, w=2, h=3, score=4}. A confusão com o layout `anchor-major` (`output[anchorIdx * 5 + attr]`) geraria zero detecções sem erro explícito.

### 5.4 `USE_STUB_DETECTOR` para desenvolvimento sem modelo

O modelo `acne-yolov8m.onnx` (~99 MB) não foi publicado no GitHub Releases durante a Fase 2. Flag `USE_STUB_DETECTOR` em `models.ts` permite testar o fluxo completo com detecções simuladas. O stub retorna N lesões aleatórias em 600 ms, cobrindo o caminho feliz de toda a UI sem dependência de rede ou ONNX.

**Status atual:** `USE_STUB_DETECTOR = false` (produção). Setar `true` localmente para testes sem modelo.

> **Update 2026-04-19:** Modelo migrado de GitHub Releases para Hugging Face Hub em 2026-04-19 devido a bloqueio de CORS no GitHub. Repositório público: `drpauloreis/dermapro-acne-yolov8m`. URL do artefato: `https://huggingface.co/drpauloreis/dermapro-acne-yolov8m/resolve/main/acne-yolov8m.onnx`.

### 5.5 `originalCanvas` como `useState`, não `useRef`

`DownloadPhotoButton` recebia `originalCanvasRef.current` (sempre `null` no primeiro render porque `useRef` não dispara re-render quando atualizado em `useEffect`). Corrigido para `useState<HTMLCanvasElement | null>`, que força o re-render assim que o canvas é criado.

**Regra:** nunca passar `ref.current` para props de componente filho quando o valor é criado num `useEffect` — usar `useState` para valores que precisam ser propagados via props.

### 5.6 `next/dynamic` para Recharts (~300KB)

Recharts é pesado e usa APIs de browser (`ResizeObserver`, `window`). Importado estaticamente acabaria no chunk principal. Solução: `next/dynamic(() => import('./RegionChart'), { ssr: false })` em `AcneResultPanel` — Recharts entra num chunk separado carregado apenas quando a tela de resultados é exibida.

---

## 6. BUGS SIGNIFICATIVOS E CORREÇÕES

| Bug | Onde | Causa Raiz | Correção |
|-----|------|------------|----------|
| ROIs não renderizavam corretamente | `ROIValidationCanvas` | `beginPath()` dentro do loop de sub-polígonos | Mover `beginPath()` para fora do loop |
| UI travada em "Detectando lesões..." | `AcneModuleClient` | Nenhuma branch para `modelDownload.status === 'error'` | Novo `useEffect` que redireciona para 'upload' com mensagem de erro |
| `originalCanvas` null no download | `AcneResultPanel` | `useRef` não dispara re-render | Migrar para `useState` |
| Build quebrado em produção | `itaCalculator.ts` | `roi.bbox` refatorado de `{x1,y1,x2,y2}` para `{x,y,width,height}` — arquivo não atualizado | Atualizar desestruturação para novo formato |
| Bochechas invertidas (Dir/Esq) | `roiExtractor.ts` | Convenção MediaPipe: Dir/Esq = perspectiva do paciente, não da câmera | Mapear `extractLeftCheekROI` para índices do lado alto (perspectiva paciente) |
| WebGPU trava `session.run()` silenciosamente em M1 | `useAcneDetector.ts` | Bug conhecido onnxruntime-web + Apple Silicon: shader compilation pode bloquear indefinidamente sem lançar exceção | Remover WebGPU de `executionProviders` + adicionar timeout de 30s na inferência |

---

## 7. DÉBITOS TÉCNICOS CONHECIDOS

| Débito | Localização | Impacto | Prioridade |
|--------|-------------|---------|------------|
| ~~Modelo ONNX não publicado~~ | ~~GitHub Releases `v0.2.0-acne-model`~~ | **RESOLVIDO 2026-04-19** — Modelo migrado de GitHub Releases para Hugging Face Hub (`drpauloreis/dermapro-acne-yolov8m`) devido a bloqueio de CORS no GitHub. | — |
| PDF sem fonte Inter embutida | `acnePdfExport.ts` | Usa Helvetica; tipografia diverge do design system | Baixo — cosmético |
| QA de imagem não aplicada na foto de análise | `AcneModuleClient` (step `upload`) | Foto de acne não passa por `runQualityChecks`; apenas a foto de validação ROI passa | Médio — adicionar QA no step 'upload' |
| `itaCalculator` sem `isPointInROI` exato | `itaCalculator.ts` | Usa apenas bbox para verificação de ROI; deve usar `isPointInROI` | Baixo — já tem TODO no código |
| Sem testes de integração para componentes React | `app/acne/_components/` | Componentes cobertos apenas por testes manuais | Médio |
| CLAHE sem interpolação bilinear | `app/_shared/ml/clahe.ts` | Herdado da Fase 1 — impacta módulo Textura | Médio — corrigir antes da Fase 3 |

---

## 8. PREPARAÇÃO PARA FASE 3

### Próximos módulos e dependências da base de acne

| Módulo | Reutilização direta do Módulo Acne |
|--------|------------------------------------|
| **Melasma** | `useModelDownload`, `acnePdfExport` (adaptado), `AcnePreviewCanvas` (adaptado), `runQualityChecks` |
| **Textura** | `useModelDownload`, pipeline YOLO (adaptado), `countByRegion` (adaptado) |
| **Rosácea** | ROI de bochechas + nariz de `roiExtractor`, `SeverityBadge` (adaptado) |

### ~~Ação bloqueadora antes de qualquer lançamento~~ — RESOLVIDA em 2026-04-19

~~Publicar o modelo `acne-yolov8m.onnx` (~99 MB) na URL do GitHub Releases.~~

Modelo publicado em Hugging Face Hub (`drpauloreis/dermapro-acne-yolov8m`) com CORS habilitado. `USE_STUB_DETECTOR = false` em produção.

---

## 9. RECONHECIMENTOS

O padrão de desenvolvimento em blocos atômicos com validação visual obrigatória antes de avançar provou seu valor novamente: as 4 rodadas de ROI — embora custosas — evitaram que um mapeamento anatômico incorreto chegasse à inferência ONNX, onde seria muito mais difícil de diagnosticar. A integração do `topographicIndices.json` do FacePipe Pro foi a decisão técnica mais impactante da fase: substituiu ~200 linhas de índices manuais frágeis por uma fonte canônica validada com 19 regiões.

O padrão `USE_STUB_DETECTOR` merece ser generalizado para todos os módulos futuros: qualquer módulo com dependência de modelo externo deve ter um stub funcional que não bloqueie o desenvolvimento da UI.
