# Fase 2 — Módulo Acne

**Propósito:** primeiro módulo de análise real do DermaPro. Detecta lesões acneiformes em fotos faciais usando YOLOv8n em ONNX, classifica por região anatômica (testa, bochechas, mento), calcula severidade pela escala Hayashi (I-IV) e gera overlay visual + PDF exportável.

**Executor:** Claude Code, sessão 2.

**Tempo estimado:** 5-8 dias úteis em tempo parcial, ou 2 dias full-time.

**Pré-requisitos:**
- Fase 1 concluída e em produção (https://dermapro-nine.vercel.app).
- `_shared/` completo com 10 utilitários ML + 7 componentes UI + config.
- Tag `v0.1.0-fase1` criada.
- Node v20.x, Git limpo, repo conectado ao GitHub e Vercel.

---

## Antes de começar a sessão

Na aba do Claude Code:

1. Rode `git status` — deve retornar "nothing to commit, working tree clean".
2. Rode `git log --oneline -1` — último commit deve ser a retrospectiva da Fase 1.
3. Cole o prompt inicial abaixo.

### Prompt inicial da sessão

```
Você está no projeto DermaPro. A Fase 1 (infraestrutura base) foi concluída com 36 commits, 173 testes passando, hub em produção em https://dermapro-nine.vercel.app, tag v0.1.0-fase1 criada.

Agora vamos iniciar a FASE 2 — Módulo Acne.

PASSO 1 — Leia na ordem:
1. docs/00-MASTER.md (seção 4 — padrões transversais, seção 6 — logo/identidade, seção 10 — decisões da Fase 1).
2. docs/retrospectivas/FASE-1-RETROSPECTIVA.md (débitos técnicos e preparação para Fase 2).
3. docs/03-MODULO-ACNE.md (este documento, que você está lendo após eu colar este prompt).

Os demais módulos (melasma, textura, linhas) virão em sessões futuras.

PASSO 2 — Verifique o ambiente:
- git status deve estar limpo.
- Último commit deve ser a retrospectiva da Fase 1.
- npm run test:shared deve passar 173/173.
- npm run build deve passar limpo.
- Pasta app/_shared/ existe com todos os utilitários.
- Pasta design/ existe com tokens e mockups.

PASSO 3 — Me devolva um relatório com:
- Resumo do pipeline previsto para o módulo Acne.
- Utilitários do _shared/ que serão consumidos (de ml/, qa/, components/, config/, report/, design/).
- Novas dependências previstas (principalmente: modelo acne-yolov8n.onnx via GitHub Releases).
- Débitos técnicos da Fase 1 que afetam este módulo (especialmente: validação visual de ROIs).
- Confirmação de que está pronto para iniciar quando eu autorizar.

PASSO 4 — Aguarde. NÃO execute nada ainda.

Lembretes operacionais válidos para esta fase:
- Commit ao final de cada bloco (padrão feat/fix/chore/docs).
- Pare antes de cada push para eu aprovar em blocos sensíveis (mudanças em next.config.ts, novas dependências, mudanças de arquitetura).
- Pergunte antes de divergir do documento. NÃO chute decisões arquiteturais.
- Linguagem da UI em pt-BR, seguindo termos permitidos/proibidos do MASTER seção 4.4.
- Canvas sempre respeitando devicePixelRatio.
- Zero upload de imagens para servidor. TUDO client-side.
- Validação visual de ROIs ANTES de detecção de acne (débito técnico Alto da Fase 1).

Comece pelo PASSO 1.
```

Após o relatório, autorize bloco por bloco conforme abaixo.

---

## Visão Geral da Fase 2

### Pipeline do módulo

```
Upload foto
  ↓
Quality check (_shared/qa/imageQuality)
  ↓
Face Landmarker (_shared/ml/faceLandmarker) → 468 pontos
  ↓
ROI Extractor (_shared/ml/roiExtractor) → polígonos testa/bochechas/mento
  ↓
[VALIDAÇÃO VISUAL DE ROIs — primeira vez]
  ↓
Preprocess (resize letterbox 640×640, normalização 0-1)
  ↓
Inferência ONNX (YOLOv8n single-class "lesão acneiforme")
  ↓
Postprocess (decode + NMS + rescale)
  ↓
Filter by ROI (descarta detecções fora da pele facial)
  ↓
Contagem por região + Severidade Hayashi (I-IV)
  ↓
Overlay bboxes na foto original
  ↓
Painel de resultados + botão Exportar PDF + DownloadPhotoButton
```

### Blocos desta fase

| Bloco | Conteúdo | Dependência |
|---|---|---|
| 1 | Preparação do modelo ONNX (conversão + GitHub Release) | — |
| 2 | Estrutura de pastas do módulo `/acne` + constantes | Bloco 1 |
| 3 | Download de modelo com progresso + cache | Bloco 2 |
| 4 | Validação visual de ROIs (DÉBITO TÉCNICO ALTO) | Bloco 2 |
| 5 | Pipeline de detecção: preprocess + inferência + postprocess | Bloco 3 + 4 |
| 6 | Filter by ROI + contagem por região + severidade Hayashi | Bloco 5 |
| 7 | UI do módulo: upload, canvas de preview, painel de resultados | Bloco 2 |
| 8 | Integração end-to-end: upload → análise → overlay → download | Blocos 5-7 |
| 9 | Exportação PDF específica do módulo | Bloco 8 |
| 10 | Testes de usabilidade + responsividade + modo apresentação | Bloco 9 |
| 11 | Deploy na Vercel + validação em produção | Bloco 10 |
| 12 | Retrospectiva da Fase 2 | Bloco 11 |

---

## Bloco 1 — Preparação do Modelo ONNX

**Objetivo:** obter `acne-yolov8n.onnx` (~6 MB) a partir dos pesos PyTorch do Hugging Face `Tinny-Robot/acne` (autores Nathaniel Handan + Amina Shiga, licença Apache 2.0) e hospedá-lo como GitHub Release.

**Contexto licença:** este módulo NÃO redistribui os pesos de PyTorch originais. Ele apenas baixa, converte localmente para ONNX, e publica o `.onnx` como release do projeto DermaPro mantendo atribuição (NOTICE). Isso respeita a Apache 2.0 do modelo original.

### Prompt 1.1 — Conversão do modelo

```
Vamos converter o modelo acne de PyTorch para ONNX. Faremos isso FORA do Claude Code (no meu Mac) porque envolve rodar Python com Ultralytics. Sua função aqui é preparar um script de conversão limpo e me instruir passo a passo.

Crie a pasta scripts/ na raiz do repo (se não existir) e dentro dela:

1. scripts/convert-acne-model.md — Documentação do processo, contendo:
   - Pré-requisitos: Python 3.10+, pip, conexão à internet.
   - Comando para criar virtualenv: python3 -m venv scripts/.venv && source scripts/.venv/bin/activate
   - Instalar dependências: pip install ultralytics huggingface_hub onnx onnxsim
   - Script de download + conversão (executável direto, ver abaixo).
   - Como validar que o .onnx gerou certo (tamanho esperado ~6 MB, teste de inferência com imagem dummy).
   - Como fazer upload como GitHub Release (instruções gh CLI + fallback manual no site).

2. scripts/convert-acne-model.py — Script Python:
   ```python
   """
   Converte o modelo Tinny-Robot/acne (YOLOv8n, Apache 2.0, autores: Nathaniel Handan + Amina Shiga)
   de PyTorch (.pt) para ONNX (.onnx) para uso no navegador via ONNX Runtime Web.
   """
   from huggingface_hub import hf_hub_download
   from ultralytics import YOLO
   import os
   
   OUTPUT_DIR = "scripts/output"
   os.makedirs(OUTPUT_DIR, exist_ok=True)
   
   print("Baixando pesos PyTorch do Hugging Face...")
   pt_path = hf_hub_download(repo_id="Tinny-Robot/acne", filename="best.pt", local_dir=OUTPUT_DIR)
   print(f"Baixado: {pt_path}")
   
   print("Carregando modelo com Ultralytics...")
   model = YOLO(pt_path)
   print(f"Classes: {model.names}")
   print(f"Imgsz: {model.args.get('imgsz', 640)}")
   
   print("Exportando para ONNX...")
   onnx_path = model.export(format="onnx", opset=12, simplify=True, dynamic=False, imgsz=640)
   print(f"ONNX gerado: {onnx_path}")
   
   # Copiar com nome padronizado
   import shutil
   target = os.path.join(OUTPUT_DIR, "acne-yolov8n.onnx")
   shutil.copy(onnx_path, target)
   print(f"Arquivo final: {target}")
   print(f"Tamanho: {os.path.getsize(target) / (1024*1024):.2f} MB")
   ```

3. Adicione scripts/.venv/ e scripts/output/ ao .gitignore (para não commitar venv nem o .pt/.onnx gerado).

4. Crie scripts/README.md com visão geral da pasta (esse README fica trackeado).

Me devolva:
- Conteúdo dos 4 arquivos (3 novos + .gitignore atualizado).
- Instruções exatas que devo rodar no terminal para fazer a conversão.
- O que fazer se a conversão FALHAR (fallback para a Opção C — stub simulado; isso será o Bloco 1B abaixo).

Commit: "chore: scripts de conversão do modelo acne (Hugging Face → ONNX)"
```

**Verificação após prompt 1.1:** arquivos criados, commit feito, documentação clara. Ainda não executou a conversão.

### Passo manual (você no terminal)

Siga as instruções que o Claude Code te passou. Comandos esperados:

```bash
cd ~/Projetos/dermapro
python3 -m venv scripts/.venv
source scripts/.venv/bin/activate
pip install ultralytics huggingface_hub onnx onnxsim
python scripts/convert-acne-model.py
```

Esperado: arquivo `scripts/output/acne-yolov8n.onnx` gerado com ~6 MB.

**Tempo esperado:** 5-15 minutos (depende da conexão para baixar Ultralytics ~200 MB).

### Cenários possíveis

**Cenário A — Conversão funcionou:** prossiga para Prompt 1.2.

**Cenário B — Conversão falhou** (ex: erro de versão Python, pacote incompatível, modelo corrompido): pule para Bloco 1B (stub) abaixo. Marque a conversão como débito para tentar depois.

### Prompt 1.2 — Upload do modelo como GitHub Release

```
A conversão gerou scripts/output/acne-yolov8n.onnx com sucesso. Agora vamos hospedá-lo como GitHub Release para que o navegador possa baixá-lo sob demanda, sem poluir o repo git com binário de 6 MB.

Instruções para o humano executar:

OPÇÃO 1 — Via gh CLI (se tiver instalado):
gh release create v0.2.0-acne-model \
  scripts/output/acne-yolov8n.onnx \
  --title "Modelo Acne YOLOv8n v0.2.0" \
  --notes "Modelo ONNX derivado de Tinny-Robot/acne (Apache 2.0, Nathaniel Handan + Amina Shiga). YOLOv8n single-class ('lesao_acneiforme'), input 640x640, exportado com opset 12."

OPÇÃO 2 — Via navegador:
1. Abra https://github.com/reispaulosilva-boop/dermapro/releases/new
2. Choose a tag: digite "v0.2.0-acne-model" e clique "Create new tag"
3. Release title: "Modelo Acne YOLOv8n v0.2.0"
4. Description: cole o mesmo texto dos notes acima.
5. Attach binaries: arraste scripts/output/acne-yolov8n.onnx.
6. Click "Publish release".

Após o upload, a URL do modelo terá o formato:
https://github.com/reispaulosilva-boop/dermapro/releases/download/v0.2.0-acne-model/acne-yolov8n.onnx

Essa URL deve ser configurada em app/_shared/config/models.ts (será criado no Bloco 2).

Me avise qual opção usou, e me confirme que a URL está acessível (curl -I deve retornar 200 OK).
```

**Verificação:** release publicado, URL do modelo acessível publicamente.

### Bloco 1B (Fallback) — Stub simulado

**Quando usar:** se a conversão do Bloco 1 falhou e você quer seguir com a UI antes de resolver o modelo real.

### Prompt 1B.1

```
A conversão do modelo real falhou. Vamos seguir com um STUB SIMULADO: um detector falso que gera bounding boxes aleatórias em regiões plausíveis da face, permitindo desenvolver toda a UI do módulo sem bloquear em ML.

Crie app/_shared/config/models.ts:
- Exporta URL do modelo real (placeholder por enquanto).
- Flag USE_STUB_DETECTOR = true (vai virar false quando modelo real estiver pronto).
- Interface comum Detection = { bbox: [x1,y1,x2,y2]; score: number; class: string }.

Quando chegarmos ao Bloco 5 (pipeline), o detector vai ler essa flag e decidir entre inferência real ou stub.

Documente em docs/BACKLOG.md na seção "Módulos":
- "Módulo Acne rodando com stub simulado. Substituir por modelo ONNX real quando conversão for completada. Ver scripts/convert-acne-model.md."

Commit: "feat(config): flag USE_STUB_DETECTOR para desenvolvimento sem modelo real".
```

---

## Bloco 2 — Estrutura do Módulo e Constantes

### Prompt 2.1

```
Vamos criar a estrutura do módulo Acne em app/acne/.

IMPORTANTE: o placeholder atual app/acne/page.tsx (criado no Bloco 10 da Fase 1) deve ser SOBRESCRITO. Os utilitários de detecção vão em app/_shared/ml/ ou em app/acne/_lib/ dependendo de se forem reutilizáveis em outros módulos.

Decisão de arquitetura:
- Funções GENÉRICAS de YOLO (preprocess letterbox, postprocess YOLOv8 decode, NMS) vão em app/_shared/ml/yolo/ porque outros módulos futuros podem reusar.
- Funções ESPECÍFICAS de acne (classificação Hayashi, contagem por região acne, overlay style) vão em app/acne/_lib/.

Estrutura final:

app/acne/
├── page.tsx                              # página do módulo (Server + Client Components)
├── _lib/
│   ├── hayashiSeverity.ts                # escala Hayashi I-IV
│   ├── countByRegion.ts                  # contagem por região anatômica
│   ├── acneOverlay.ts                    # estilo dos bboxes
│   └── constants.ts                      # thresholds, cores, texts do módulo
├── _components/
│   ├── AcneResultPanel.tsx               # painel de resultados
│   ├── SeverityBadge.tsx                 # badge Hayashi colorido
│   ├── RegionChart.tsx                   # gráfico por região (Recharts)
│   ├── AcnePreviewCanvas.tsx             # canvas com bboxes
│   └── ROIValidationCanvas.tsx           # canvas para validação visual de ROIs (bloco 4)
└── _hooks/
    ├── useAcneDetector.ts                # orchestration hook
    └── useModelDownload.ts               # download com progresso

app/_shared/ml/yolo/
├── yoloPreprocess.ts                     # letterbox + normalização
├── yoloPostprocess.ts                    # decode + NMS + rescale
└── index.ts

app/_shared/ml/yolo/*.test.ts            # testes dos utilitários genéricos

app/_shared/config/models.ts              # URLs e flags de modelos

Crie TODOS esses arquivos como stubs (cabeçalho + interfaces + TODO), sem implementação real ainda. Nos blocos seguintes preenchemos.

Crie também app/acne/_lib/constants.ts com:

export const MODULE_ID = 'acne' as const;
export const MODEL_INPUT_SIZE = 640;
export const DETECTION_CONF_THRESHOLD = 0.25;
export const NMS_IOU_THRESHOLD = 0.45;
export const MIN_UPLOAD_WIDTH = 480;
export const MIN_UPLOAD_HEIGHT = 640;

export const HAYASHI_THRESHOLDS = {
  MILD: 5,       // I: ≤ 5 lesões
  MODERATE: 20,  // II: 6-20
  SEVERE: 50,    // III: 21-50
                 // IV: > 50
} as const;

export const REGION_LABELS_PT = {
  forehead: 'Testa',
  leftCheek: 'Bochecha esquerda',
  rightCheek: 'Bochecha direita',
  chin: 'Mento',
  nose: 'Nariz',
} as const;

export const INSTRUCTIONS_UPLOAD = [
  'Foto frontal, rosto desocluído (retire óculos, afaste cabelo).',
  'Iluminação difusa e uniforme. Evite flash direto ou sombras fortes.',
  'Sem maquiagem facial para melhor resultado.',
  `Resolução mínima: ${MIN_UPLOAD_WIDTH}×${MIN_UPLOAD_HEIGHT} pixels.`,
];

export const DISCLAIMER_ACNE_PT = {
  title: 'Sobre a análise de acne',
  body: 'Esta ferramenta estima o número de lesões acneiformes visíveis em uma foto. É um apoio à conversa clínica, não substitui avaliação presencial, não fornece diagnóstico e não prescreve tratamentos. Resultados podem variar conforme iluminação, pose e tipo de pele.',
};

Commit: "chore(acne): estrutura de pastas do módulo e constantes".
```

**Verificação:** estrutura criada, compila sem erro, rota /acne continua renderizando o placeholder (vai ser substituído mais tarde).

### Prompt 2.2 — Configuração do modelo

```
Crie app/_shared/config/models.ts:

export interface ModelConfig {
  id: string;
  url: string;
  expectedSize: number;      // bytes
  classNames: string[];
  inputSize: number;
  license: string;
  attribution: string;
}

export const MODELS: Record<string, ModelConfig> = {
  'acne-yolov8n': {
    id: 'acne-yolov8n',
    url: 'https://github.com/reispaulosilva-boop/dermapro/releases/download/v0.2.0-acne-model/acne-yolov8n.onnx',
    expectedSize: 6 * 1024 * 1024,  // ~6 MB, ajustar após upload real
    classNames: ['lesao_acneiforme'],
    inputSize: 640,
    license: 'Apache 2.0',
    attribution: 'Derivado de Tinny-Robot/acne — Nathaniel Handan + Amina Shiga',
  },
};

export const USE_STUB_DETECTOR = false;  // mudar para true se modelo real não disponível

export function getModelConfig(id: string): ModelConfig {
  const config = MODELS[id];
  if (!config) throw new Error(`Modelo ${id} não registrado em MODELS`);
  return config;
}

Crie app/_shared/config/models.test.ts com testes:
- getModelConfig retorna config correta para id válido.
- getModelConfig lança erro para id inválido.
- URL do acne-yolov8n é HTTPS.
- classNames não-vazio.
- inputSize > 0.

Commit: "feat(config): registro de modelos ML com atribuições de licença".
```

---

## Bloco 3 — Download de Modelo com Progresso

**Objetivo:** criar hook reutilizável que baixa o modelo ONNX via fetch com ReadableStream, reporta progresso, cacheia em IndexedDB (opcional) e lida com falhas.

### Prompt 3.1

```
Implemente app/acne/_hooks/useModelDownload.ts como hook React reutilizável para download de modelos ONNX com progresso.

Requisitos:
1. Hook recebe ModelConfig e retorna:
   - status: 'idle' | 'downloading' | 'ready' | 'error'
   - progress: number (0-100)
   - bytesDownloaded: number
   - totalBytes: number
   - error: string | null
   - modelArrayBuffer: ArrayBuffer | null
   - startDownload: () => Promise<void>
   - reset: () => void

2. Usa fetch com ReadableStream para ler o body em chunks e reportar progresso:
   const response = await fetch(url);
   const contentLength = Number(response.headers.get('content-length'));
   const reader = response.body!.getReader();
   // acumula chunks em Uint8Array e atualiza state a cada chunk

3. Ao finalizar, concatena os chunks num único ArrayBuffer e retorna.

4. Se fetch falhar (rede, 404, CORS), status = 'error' com mensagem clara em pt-BR.

5. Cache em IndexedDB é OPCIONAL no MVP. Se implementar, use `idb` ou API nativa via Promise wrapper. Se não implementar, deixe TODO e fallback para download a cada sessão.

6. Hook é 'use client'.

Crie app/acne/_hooks/useModelDownload.test.ts (se possível testar em jsdom, mockar fetch). Se for complexo mockar ReadableStream, marque como TODO e deixe testes de integração manual.

Commit: "feat(acne): hook useModelDownload com progresso e gestão de erros".
```

---

## Bloco 4 — Validação Visual de ROIs (Débito Técnico)

**DÉBITO TÉCNICO ALTO da Fase 1:** os índices dos landmarks MediaPipe em `_shared/ml/roiExtractor.ts` foram chutados razoavelmente, mas nunca foram validados em foto real. Precisamos validar AGORA, antes de propagar erros para todos os 4 módulos.

### Prompt 4.1 — Componente de validação visual

```
Vamos implementar uma tela de validação visual de ROIs. Objetivo: o usuário sobe uma foto frontal, o sistema detecta landmarks, extrai ROIs e desenha os polígonos sobre a foto. Se as ROIs estiverem corretas (cobrem testa, bochechas, mento, nariz), o débito técnico é resolvido. Se estiverem erradas, ajustamos os índices.

Implemente app/acne/_components/ROIValidationCanvas.tsx:

Props:
- imageBitmap: ImageBitmap (foto carregada)
- landmarks: FacialPoint[] (do faceLandmarker)
- rois: SkinROI[] (do roiExtractor)
- showLandmarks: boolean (toggle para mostrar 468 pontos)
- onROISelection?: (roiName: string) => void (opcional, para destacar ao clicar)

Renderização:
1. Canvas com devicePixelRatio correto (use o padrão do MASTER seção 4.8).
2. Desenha a foto como fundo.
3. Para cada SkinROI, desenha o polígono com cor distinta e transparência 30%:
   - forehead: cor do módulo acne (terracota do design/tokens)
   - leftCheek: cor complementar 1
   - rightCheek: cor complementar 2
   - chin: cor complementar 3
   - nose: cor complementar 4
4. Se showLandmarks === true, desenha os 468 pontos em cima (pequenos dots semi-transparentes).
5. Labels de região (testa, bochecha E, bochecha D, mento, nariz) em pt-BR, desenhados perto do centro de cada ROI.

Comportamento:
- Responsivo: o canvas ocupa todo o espaço disponível mantendo aspect ratio da foto.
- Em modo apresentação, labels ficam maiores (respeita .presentation-mode do body).

Crie também um componente de controle app/acne/_components/ROIValidationControls.tsx:
- Toggle "Mostrar 468 landmarks" (showLandmarks)
- Botão "ROIs parecem corretas" → marca débito como resolvido em sessionStorage
- Botão "ROIs parecem erradas" → abre modal pedindo feedback ("qual região está errada?")
- Se usuário marcar alguma ROI como errada, salvar em sessionStorage key 'dermapro-roi-validation-feedback' para debug posterior.

Commit: "feat(acne): componente de validação visual de ROIs com overlay colorido".
```

### Prompt 4.2 — Integração com a página do módulo

```
Crie um modo especial da página /acne para validação de ROIs. Esse modo roda ANTES da detecção de acne e só aparece na primeira vez que o usuário abre o módulo.

Implementação em app/acne/page.tsx:

Fluxo:
1. Usuário acessa /acne.
2. Disclaimer Modal (moduleType="acne") aparece se primeira visita.
3. Após aceitar disclaimer, sistema verifica sessionStorage 'dermapro-roi-validated' === 'true'.
4. Se NÃO validado ainda:
   - Mostra tela explicativa: "Validação de Regiões Faciais — Antes de começar a análise de acne, precisamos confirmar que o sistema está detectando as regiões corretas. Envie uma foto frontal sua."
   - UploadCard aparece com instruções específicas de validação.
   - Após upload: quality check → faceLandmarker → roiExtractor → ROIValidationCanvas.
   - Usuário confirma ("ROIs corretas") ou reporta ("ROIs erradas").
   - Se correto: salva 'dermapro-roi-validated' = 'true' no LOCAL storage (persiste entre sessões), redireciona para tela normal de análise de acne.
   - Se errado: abre modal explicando "Alguns módulos podem ter precisão reduzida. Vamos reportar." e salva feedback.

5. Se JÁ validado: pula validação e vai direto para tela de análise de acne.

Componente app/acne/_components/ROIValidationFlow.tsx encapsula todo esse fluxo.

Use componentes do _shared/:
- DisclaimerModal (moduleType="acne")
- UploadCard (com instructions específicas)
- UncertaintyBanner (se ROIs forem marcadas como erradas)

Commit: "feat(acne): fluxo de validação visual de ROIs (resolve débito técnico Fase 1)".
```

### Validação manual (VOCÊ) — passo importante

Depois do Claude Code terminar o Bloco 4:

1. Rode `npm run dev`.
2. Abra localhost:3000/acne.
3. Aceite o disclaimer.
4. Faça upload de **uma foto frontal sua real** (tire uma agora ou use uma antiga).
5. Verifique visualmente:
   - ROI da testa cobre só a testa (não pega olhos ou cabelo).
   - ROI da bochecha esquerda cobre só a bochecha esquerda da foto (que visualmente é o lado direito, porque espelho).
   - ROI da bochecha direita: idem, lado oposto.
   - ROI do mento cobre queixo, não inclui boca.
   - ROI do nariz segue o contorno do nariz.

6. Se **todas** as ROIs estiverem corretas: clique "ROIs parecem corretas" → segue.
7. Se **alguma** estiver errada: clique "ROIs parecem erradas" → reporta e volte para esta conversa. Vamos corrigir os índices do roiExtractor antes de prosseguir.

**Tempo esperado dessa validação:** 5-15 minutos.

---

## Bloco 5 — Pipeline de Detecção (Preprocess + Inferência + Postprocess)

### Prompt 5.1 — YOLO Preprocess (genérico, vai em _shared/)

```
Implemente app/_shared/ml/yolo/yoloPreprocess.ts.

Tipos:
export interface PreprocessResult {
  tensor: Float32Array;
  dims: [1, 3, number, number];
  scale: number;
  padX: number;
  padY: number;
}

Função principal:
preprocessImageForYOLO(canvas: HTMLCanvasElement, targetSize: number): PreprocessResult

Passos:
1. letterbox: redimensiona o canvas mantendo aspect ratio, preenchendo com cinza neutro (padding 114,114,114 em RGB, padrão YOLO) até ficar quadrado targetSize×targetSize.
2. Calcula scale = min(targetSize/origWidth, targetSize/origHeight).
3. Calcula padX, padY como deslocamento para centralizar.
4. canvasToTensor: lê ImageData, extrai R, G, B, normaliza dividindo por 255, reorganiza em [batch=1, channels=3, H, W] (CHW layout).
5. Retorna tensor Float32Array + metadata para desfazer no postprocess.

Teste yoloPreprocess.test.ts:
- Input 640x480 com targetSize 640 → scale=1.0, padY=80 (centraliza vertical).
- Input 480x640 com targetSize 640 → scale=1.0, padX=80.
- Input quadrado → padX=padY=0.
- Tensor tem 3*640*640 = 1.228.800 elementos.
- Valores normalizados em [0, 1].

Commit: "feat(_shared/ml): yoloPreprocess genérico (letterbox + CHW normalizado)".
```

### Prompt 5.2 — YOLO Postprocess (genérico)

```
Implemente app/_shared/ml/yolo/yoloPostprocess.ts.

Tipos:
export interface Detection {
  bbox: [number, number, number, number];  // x1, y1, x2, y2 em pixels da imagem ORIGINAL
  score: number;
  classId: number;
  className: string;
}

Funções:

1. decodeYolov8Output(output: Float32Array, dims: number[], confThreshold: number, classNames: string[]): Detection[]
   - Output do YOLOv8 para single-class tem shape [1, 5, 8400]:
     - Primeiro 8400 valores: cx de cada anchor
     - Próximo 8400: cy
     - Próximo: w
     - Próximo: h
     - Próximo: score_class_0
   - IMPORTANTE: o output vem transposto. Layout real é [attribute_idx * 8400 + anchor_idx]. Verificar com cuidado.
   - Para cada anchor, se score >= confThreshold: converte (cx, cy, w, h) para (x1, y1, x2, y2).
   - Retorna array de Detection com coordenadas ainda no espaço do input (targetSize × targetSize).

2. nonMaxSuppression(detections: Detection[], iouThreshold: number): Detection[]
   - Ordena por score decrescente.
   - Itera: pega a maior, descarta todas com IoU > threshold, repete.
   - Retorna subset filtrado.

3. iou(a: Detection, b: Detection): number
   - Intersection over Union entre duas bboxes.

4. rescaleDetections(detections: Detection[], scale: number, padX: number, padY: number): Detection[]
   - Converte coordenadas do espaço letterbox para espaço da imagem ORIGINAL.
   - Fórmula: x_orig = (x_letterbox - padX) / scale.

5. postprocessYoloOutput(output, dims, scale, padX, padY, confThreshold, iouThreshold, classNames): Detection[]
   - Orquestrador: decode → NMS → rescale.

Teste yoloPostprocess.test.ts:
- iou de bboxes idênticas = 1.0.
- iou de bboxes disjuntas = 0.
- NMS com 3 bboxes sobrepostas mantém só a de maior score.
- rescale retorna coordenadas corretas.
- decodeYolov8Output com tensor sintético (mock) retorna detecções plausíveis.

Commit: "feat(_shared/ml): yoloPostprocess genérico (decode + NMS + rescale)".
```

### Prompt 5.3 — Barrel + integração

```
Crie app/_shared/ml/yolo/index.ts com barrel exports.

Atualize app/_shared/ml/index.ts para incluir:
export * from './yolo';

Rode npm run test:shared — deve passar com os novos testes do yolo/.

Commit: "chore(_shared/ml): barrel exports para yolo/".
```

### Prompt 5.4 — Service de detecção

```
Implemente app/acne/_hooks/useAcneDetector.ts como hook principal de orquestração.

Requisitos:
1. Consome useModelDownload para baixar o .onnx.
2. Cria InferenceSession do ONNX Runtime Web com executionProviders ['webgpu', 'wasm'] (fallback automático).
3. Estado:
   - status: 'idle' | 'loading_model' | 'ready' | 'detecting' | 'error'
   - downloadProgress: number
   - backend: 'webgpu' | 'wasm' | null
   - error: string | null
4. Método `detect(canvas: HTMLCanvasElement): Promise<Detection[]>`:
   a. preprocessImageForYOLO(canvas, MODEL_INPUT_SIZE)
   b. ort.Tensor.from(preprocessed.tensor)
   c. session.run({ images: tensor })
   d. extrai output do result
   e. postprocessYoloOutput(...)
   f. retorna Detection[]
5. Stub simulado (quando USE_STUB_DETECTOR === true):
   - Gera 3-15 bboxes aleatórias em regiões plausíveis (centradas nas ROIs).
   - Scores aleatórios 0.3-0.9.
   - Simula delay de 500-1500ms para parecer inferência real.
   - Permite desenvolver UI sem modelo real.
6. Configuração WASM:
   - ort.env.wasm.wasmPaths deve apontar para /_next/static/... ou equivalente no Next.js 16.
   - Pode precisar de configuração em next.config.ts para servir .wasm files corretamente.
   - Se der problema, investigar e me perguntar.

Teste useAcneDetector.test.ts:
- Focus nos testes da LÓGICA (stub mode: gera entre 3 e 15 detecções; rescale correto aplicado; erro tratado se canvas vazio).
- Mockar ort.InferenceSession para não baixar modelo real nos testes.

Commit: "feat(acne): hook useAcneDetector com suporte a modelo real e stub simulado".
```

### Validação manual (VOCÊ)

Depois do Bloco 5 terminar:

1. Rode `npm run dev`.
2. Abra DevTools > Console.
3. Acesse /acne, passe pela validação de ROIs, chegue na tela de análise.
4. Faça upload de uma foto de teste.
5. Console deve mostrar:
   - "Iniciando download do modelo..."
   - Progresso 0% → 100%.
   - "Modelo carregado em Xms, backend: webgpu (ou wasm)."
   - "Detecção em Xms, N lesões detectadas."

Se houver erro, me reporte antes de prosseguir.

---

## Bloco 6 — Filter by ROI, Contagem, Severidade

### Prompt 6.1 — Filter by ROI

```
Adicione função filterDetectionsByROI em app/_shared/ml/yolo/index.ts (ou arquivo próprio se preferir):

filterDetectionsByROI(detections: Detection[], rois: SkinROI[]): Detection[]
  - Para cada Detection, calcula o centro: (x1+x2)/2, (y1+y2)/2.
  - Testa se o centro está dentro de PELO MENOS UMA ROI usando isPointInROI (já existe em _shared/ml/roiExtractor).
  - Se sim, mantém. Se não, descarta.
  - Retorna subset filtrado.

Teste:
- 5 detecções, 3 dentro das ROIs, 2 fora → retorna 3.
- Nenhuma ROI passada → retorna lista original (permissivo).
- Nenhuma detecção → retorna [].

Commit: "feat(_shared/ml): filterDetectionsByROI para restringir detecções à pele".
```

### Prompt 6.2 — Contagem por região

```
Implemente app/acne/_lib/countByRegion.ts:

export interface RegionCount {
  region: keyof typeof REGION_LABELS_PT;
  count: number;
  percentage: number;
}

export function countByRegion(detections: Detection[], rois: SkinROI[]): RegionCount[]
  - Para cada detecção, determina em qual ROI está o centro.
  - Se estiver em múltiplas ROIs (ex: nariz + bochecha), atribui à primeira encontrada (ou à de maior área — documente a decisão).
  - Retorna array ordenado por count decrescente.
  - Inclui regiões com count=0 se houver ROI correspondente.

Teste countByRegion.test.ts:
- 10 detecções distribuídas em 3 regiões → retorna 3+ RegionCounts somando 10.
- Percentuais somam 100 (ou 0 se total=0).
- Sem detecções → todas regiões com count=0.

Commit: "feat(acne): contagem de lesões por região anatômica".
```

### Prompt 6.3 — Escala Hayashi

```
Implemente app/acne/_lib/hayashiSeverity.ts:

export type HayashiLevel = 'I' | 'II' | 'III' | 'IV';

export interface SeverityResult {
  level: HayashiLevel;
  label: string;           // 'Leve' | 'Moderado' | 'Marcante' | 'Intenso'
  description: string;     // descrição neutra em pt-BR
  color: string;           // token CSS var (ex: 'var(--mod-acne-light)')
}

export function hayashiSeverity(totalCount: number): SeverityResult

Limiares (Hayashi 2008):
- I (Leve): ≤5 lesões
- II (Moderado): 6-20
- III (Marcante): 21-50
- IV (Intenso): >50

Labels em pt-BR (respeitando linguagem do MASTER seção 4.4):
- NUNCA usar "grave" ou "severo" — usar "marcante" / "intenso".
- Descrições neutras, exemplo:
  - Leve: "Poucas lesões visíveis distribuídas pela face."
  - Moderado: "Número intermediário de lesões. Distribuição pode orientar conversa clínica."
  - Marcante: "Número elevado de lesões visíveis. Apoia avaliação dermatológica detalhada."
  - Intenso: "Número muito elevado de lesões. Apoia planejamento clínico aprofundado."

Cores via tokens (mod-acne-*, definir no design):
- I → mod-acne-soft (verde sutil)
- II → mod-acne-mid (âmbar suave)
- III → mod-acne-strong (laranja vinho)
- IV → mod-acne-deepest (vinho suave, nunca vermelho puro)

Teste hayashiSeverity.test.ts:
- hayashiSeverity(0) → level 'I'
- hayashiSeverity(5) → level 'I'
- hayashiSeverity(6) → level 'II'
- hayashiSeverity(20) → level 'II'
- hayashiSeverity(21) → level 'III'
- hayashiSeverity(50) → level 'III'
- hayashiSeverity(51) → level 'IV'
- hayashiSeverity(1000) → level 'IV'

Commit: "feat(acne): escala Hayashi I-IV com linguagem neutra em pt-BR".
```

---

## Bloco 7 — UI do Módulo

### Prompt 7.1 — AcnePreviewCanvas (overlay com bboxes)

```
Implemente app/acne/_components/AcnePreviewCanvas.tsx:

Props:
- imageBitmap: ImageBitmap
- detections: Detection[]
- rois?: SkinROI[] (opcional, mostra outline sutil das ROIs se passado)
- showLabels: boolean

Renderização:
1. Canvas com devicePixelRatio correto (padrão MASTER 4.8).
2. Desenha foto como fundo.
3. Para cada Detection: bbox com borda cor do módulo acne, espessura 2px, corner-radius sutil. Semi-transparente.
4. Se showLabels, label pequena com "Lesão #N" ou score (ex: "87%").
5. Responsivo (mantém aspect ratio).

Em modo apresentação (.presentation-mode ativo):
- Espessura bbox = 3px (visível de longe).
- Labels maiores.
- Contraste aumentado.

Forneça também uma ref (useImperativeHandle) que expõe `getAnnotatedCanvas(): HTMLCanvasElement` — usado pelo DownloadPhotoButton para baixar a foto com marcações.

Commit: "feat(acne): AcnePreviewCanvas com overlay de bboxes respeitando devicePixelRatio".
```

### Prompt 7.2 — SeverityBadge e RegionChart

```
Implemente app/acne/_components/SeverityBadge.tsx:

Props: SeverityResult (do hayashiSeverity)

Renderiza:
- Badge grande com cor do nível (background-color via CSS var).
- Texto: "Perfil: {label}" (ex: "Perfil: Moderado")
- Subtexto: description do SeverityResult
- Tipografia grande, legível a distância (TV).

Implemente app/acne/_components/RegionChart.tsx:

Props: regionCounts: RegionCount[]

Usa Recharts BarChart horizontal:
- Eixo Y: nomes das regiões em pt-BR (REGION_LABELS_PT).
- Eixo X: contagem.
- Cor das barras: cor do módulo acne.
- Labels de valor no final de cada barra.
- Responsivo.

Em modo apresentação, escalas maiores, labels mais legíveis.

Commit: "feat(acne): SeverityBadge e RegionChart com linguagem neutra".
```

### Prompt 7.3 — AcneResultPanel

```
Implemente app/acne/_components/AcneResultPanel.tsx como painel completo de resultados.

Props:
- detections: Detection[]
- rois: SkinROI[]
- imageBitmap: ImageBitmap
- onExportPdf: () => void
- canvasRef: React.RefObject<{ getAnnotatedCanvas: () => HTMLCanvasElement }>

Layout (dark mode):
1. Header: "Resultado da análise"
2. AcnePreviewCanvas à esquerda (ocupa 60% em desktop, topo em mobile).
3. Painel direito (40%):
   - SeverityBadge no topo.
   - Estatística: "Total: N lesões detectadas" em mono (JetBrains).
   - RegionChart em baixo.
   - UncertaintyBanner se ROIs não foram validadas: "Algumas regiões faciais podem ter precisão reduzida."
4. Footer do painel:
   - DownloadPhotoButton (original + anotada).
   - Botão "Exportar PDF" → onExportPdf.
   - Link "Refazer análise" → reseta state.

Respeita modo apresentação.

Commit: "feat(acne): AcneResultPanel com canvas + severidade + gráfico + downloads".
```

### Prompt 7.4 — Página principal do módulo

```
Sobrescreva app/acne/page.tsx:

Fluxo:
1. Server Component renderiza layout base + <AcneModuleClient /> (Client Component).
2. AcneModuleClient gerencia state:
   - step: 'disclaimer' | 'roi_validation' | 'upload' | 'analyzing' | 'result'
   - file: File | null
   - imageBitmap: ImageBitmap | null
   - landmarks: FacialPoint[] | null
   - rois: SkinROI[] | null
   - detections: Detection[] | null
   - error: string | null

3. Render condicional por step:
   - 'disclaimer': DisclaimerModal (moduleType="acne"). Aceitar → salva e vai para 'roi_validation' (se nunca validado) ou 'upload'.
   - 'roi_validation': ROIValidationFlow (Bloco 4). Confirmar → salva e vai para 'upload'.
   - 'upload': UploadCard + instruções específicas. Após upload, faz quality check. Se passar, vai para 'analyzing'.
   - 'analyzing': LoadingState com useAcneDetector.status e progress. Ao terminar, vai para 'result'.
   - 'result': AcneResultPanel.

4. Integração com Apple TV / modo apresentação: SessionHeader global já cuida disso.

5. Uma vez em 'result', DownloadPhotoButton e botão "Exportar PDF" estão ativos.

Commit: "feat(acne): fluxo completo disclaimer → ROI → upload → análise → resultado".
```

---

## Bloco 8 — Integração End-to-End

### Prompt 8.1 — Teste manual

```
Objetivo: garantir que todo o fluxo funciona. Não há código novo neste bloco — é validação.

VOCÊ (humano) vai:
1. Rodar npm run dev.
2. Abrir localhost:3000/acne.
3. Passar pelos steps:
   - Aceitar disclaimer.
   - Validação de ROIs: upload de foto frontal, confirmar ROIs corretas.
   - Upload da mesma (ou outra) foto para análise.
   - Aguardar download do modelo (primeira vez ~5-30s).
   - Aguardar inferência (~0.5-2s).
   - Ver resultado: bboxes overlay + severidade + gráfico por região.
   - Clicar DownloadPhotoButton → verifica que baixa.
   - Clicar Exportar PDF → vai funcionar no Bloco 9 (por enquanto deve mostrar placeholder ou alerta).

Claude Code, quando eu executar isso, eu reporto aqui em texto se funcionou. Se houver bug, você investiga.

Se tudo ok, commit chore(acne): validação end-to-end manual OK.
```

---

## Bloco 9 — Exportação PDF

### Prompt 9.1

```
Implemente app/acne/_lib/acnePdfExport.ts que gera o PDF de relatório específico do módulo.

Usa pdfExportBase.ts do _shared/report/.

Função principal:
exportAcnePdf(data: {
  imageBitmap: ImageBitmap;
  annotatedCanvas: HTMLCanvasElement;
  detections: Detection[];
  rois: SkinROI[];
  severity: SeverityResult;
  regionCounts: RegionCount[];
  sessionInfo?: { patientId?: string; age?: number; fitzpatrick?: string; consultation?: string };
}): void

Conteúdo do PDF (A4, retrato):
1. Header: logo + "Análise de Acne" + data/hora.
2. Se sessionInfo presente: bloco com dados do paciente (pseudônimo, idade, fototipo, consulta).
3. Foto anotada centralizada (addImageWithCaption helper).
4. Seção "Resumo" com:
   - Perfil: {severity.label}
   - Total de lesões: N
   - Distribuição por região (tabela: região | contagem | %)
5. Seção "Observações":
   - Descrição do SeverityResult.
   - Texto: "As regiões anatômicas avaliadas foram: testa, bochechas (E e D), mento, nariz. Lesões detectadas fora dessas regiões (cabelo, olhos, lábios) foram excluídas."
6. Footer: disclaimer base + atribuição ao modelo ("Modelo derivado de Tinny-Robot/acne, Apache 2.0").
7. Nome do arquivo: dermapro-acne-{YYYY-MM-DD-HHmmss}.pdf (helper do pdfExportBase).

Conecte ao botão "Exportar PDF" do AcneResultPanel.

Commit: "feat(acne): exportação de relatório PDF com detecções, severidade e distribuição".
```

---

## Bloco 10 — Testes e Polimento

### Prompt 10.1

```
Polimento final do módulo antes de deploy:

1. Responsividade:
   - Testa em 375px (mobile), 768px (tablet), 1440px (desktop).
   - Ajusta layout do AcneResultPanel: em mobile, canvas no topo e painel embaixo.
   - Cards, botões e tipografia escalam adequadamente.

2. Modo apresentação:
   - Tecla P alterna.
   - Canvas expande, tipografia +20%, chrome reduzido.
   - Bboxes com espessura maior.

3. Acessibilidade:
   - Foco visível em todos botões.
   - Alt text em canvas (fallback "Análise de acne com N lesões detectadas").
   - Contraste WCAG AA+ em textos sobre badges.

4. Loading states:
   - Skeleton durante download do modelo.
   - Spinner durante inferência com texto "Analisando..." e "Isso pode levar alguns segundos na primeira vez".

5. Error states:
   - Modelo falhou em baixar: "Não conseguimos carregar o modelo. Verifique sua conexão e recarregue."
   - Imagem sem face: "Não detectamos um rosto na foto. Tente outra imagem frontal."
   - Múltiplas faces: "Detectamos mais de um rosto. Envie uma foto com apenas uma pessoa."
   - Quality check falhou: mensagens específicas do imageQuality.

6. Testes unitários faltantes:
   - Rode npm run test:shared. Adicione testes para gaps óbvios.
   - Componentes React não exigem testes obrigatórios, mas snapshot simples em AcneResultPanel é bem-vindo.

7. Build production: npm run build. Analise bundle size. Se /acne passar de 800kb JS, investigar e code-splittar.

Commit: "chore(acne): polimento responsividade + modo apresentação + estados de erro".
```

---

## Bloco 11 — Deploy e Validação em Produção

### Prompt 11.1

```
Deploy do módulo Acne.

Pré-checks:
1. npm run build passa limpo.
2. npm run test:shared passa 100%.
3. Validação manual OK em localhost:3000/acne.
4. Modelo ONNX disponível em GitHub Release (URL respondendo 200).

Ajustes no next.config.ts (se necessário):
- Headers COOP/COEP já estão configurados desde Fase 1. Verificar se continuam.
- Se ort-wasm precisar de configuração especial de CORS ou MIME type, investigar.

Push:
git push origin main

A Vercel dispara deploy automaticamente. Aguarde 3-5 minutos.

Depois do deploy:
1. Abra https://dermapro-nine.vercel.app/acne
2. Passe pelo fluxo completo em produção.
3. Verifique DevTools > Network:
   - Modelo .onnx baixando do GitHub Releases.
   - Sem upload de imagens a servidor.
   - WASM do ONNX Runtime carregando.
4. Verifique DevTools > Console:
   - Sem erros.
   - Backend (webgpu ou wasm) logado.
5. Exporte PDF → verifica que baixa correto.

Se tudo ok, crie tag:
git tag -a v0.2.0-acne -m "Fase 2: Módulo Acne concluído — detecção, severidade Hayashi, PDF"
git push origin v0.2.0-acne

Commit prévio (antes do tag): "chore: deploy do módulo Acne em produção".
```

---

## Bloco 12 — Retrospectiva da Fase 2

### Prompt 12.1

```
Crie docs/retrospectivas/FASE-2-RETROSPECTIVA.md com:

1. Resumo executivo (o que foi construído, período, resultado).
2. Tabela de blocos executados com commits.
3. Estatísticas de código (linhas novas, testes novos, bundle size do /acne).
4. Novo utilitários reutilizáveis adicionados ao _shared/ (yolo/).
5. Decisões tomadas durante execução:
   - Conversão do modelo: funcionou ou fallback para stub?
   - Validação de ROIs: aprovadas na primeira tentativa ou precisou corrigir?
   - Configuração WASM do ONNX no Next.js 16 (se teve que ajustar).
   - Outras.
6. Débitos técnicos identificados para próximas fases.
7. Preparação para Fase 3 — Módulo Melasma (docs/04-MODULO-MELASMA.md, a criar).
8. Reconhecimentos (o que funcionou bem).

Commit: "docs: retrospectiva da Fase 2 (módulo Acne em produção)".
```

---

## Critérios de Aceitação da Fase 2

Antes de considerar encerrada:

- [ ] Módulo Acne acessível via hub (/acne).
- [ ] Disclaimer específico do módulo aparece na primeira visita.
- [ ] Validação de ROIs concluída com sucesso (débito técnico Alto da Fase 1 resolvido).
- [ ] Upload de foto funciona (drag&drop + click).
- [ ] Quality check rejeita fotos inadequadas com mensagem clara.
- [ ] Modelo ONNX baixa do GitHub Releases na primeira análise (ou stub funciona se for fallback).
- [ ] Detecção retorna bboxes plausíveis.
- [ ] Overlay de bboxes aparece sobre a foto com devicePixelRatio correto.
- [ ] Severidade Hayashi calculada e exibida com linguagem neutra.
- [ ] Contagem por região funcionando com gráfico Recharts.
- [ ] DownloadPhotoButton baixa foto original e foto anotada.
- [ ] Exportar PDF gera arquivo com conteúdo correto.
- [ ] Modo apresentação funciona no módulo (tecla P).
- [ ] Responsivo em 3 breakpoints.
- [ ] Deploy em produção funcional.
- [ ] Testes em _shared/ passando 100%.
- [ ] Zero upload de imagens a servidor (verificado no DevTools).

---

## Observações Finais

Este é o módulo mais complexo dos quatro. Melasma, Textura e Sinais de Expressão usarão as mesmas peças (`_shared/ml/*`, `_shared/components/*`, `pdfExportBase`, etc) mas com algoritmos clássicos mais simples (colorimetria, morfologia, Frangi) em vez de deep learning. O investimento feito aqui — especialmente o utilitário YOLO genérico em `_shared/ml/yolo/` — não será reutilizado nos outros três módulos, mas ficará disponível caso haja módulos futuros com detecção de objetos.

A validação visual de ROIs neste módulo é o momento em que o débito técnico Alto da Fase 1 é resolvido de vez — após confirmação, todos os módulos seguintes assumem que as ROIs estão corretas e não repetem essa validação.

---

*Fim da Fase 2. Versão 1.0 — 18 de abril de 2026.*
