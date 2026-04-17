# Fase 1 — Infraestrutura Base e `_shared/`

**Propósito:** construir a fundação do DermaPro. Nada específico de módulo ainda. Ao final desta fase, você tem um Next.js rodando com hub funcional (4 cards ativos + 2 "Em breve"), páginas legais, `_shared/` completo com todos os utilitários e seus testes, design tokens aplicados e deploy na Vercel funcionando.

**Executor:** Claude Code, sessão 1.

**Tempo estimado:** 3-5 dias úteis em tempo parcial.

**Pré-requisito:** Fase 0 concluída. Pasta `design/` existe no repo com `tokens.ts`, `DESIGN_SYSTEM.md`, logo e mockups.

---

## Antes de começar a sessão

1. Confirme que `design/tokens.ts` existe.
2. Rode `node --version` — deve ser 20.x (lts/iron).
3. Confirme `git remote -v` aponta para `reispaulosilva-boop/dermapro`.
4. Cole o prompt inicial de `00-PROMPT-INICIAL.md`. Após o relatório do Claude Code e sua confirmação, execute os blocos abaixo em ordem.

---

## Bloco 1 — Bootstrap do Projeto Next.js

### Prompt 1.1

```
Vamos criar o projeto Next.js do DermaPro. Repositório já clonado, docs/ já em src-of-truth, design/ com tokens prontos.

Faça:

1. Crie o projeto Next.js 14+ com App Router e TypeScript na RAIZ do repositório (não em subpasta):
   npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-eslint --use-npm
   Responda "No" para "Would you like to use `src/` directory?" (queremos app/ na raiz).
   Responda "Yes" para Tailwind, TypeScript, App Router.
   Responda "No" para Turbopack (estabilidade > velocidade).
   Se solicitado, responda "No" para ESLint (adicionaremos manualmente no próximo bloco).

2. Depois do create-next-app rodar:
   - Remova arquivos boilerplate: app/page.tsx (vai ser reescrito), app/favicon.ico, public/*.svg padrão, app/globals.css (será reescrito).
   - NÃO remova next.config.js nem tsconfig.json nem package.json.
   - Mantenha node_modules/ intacto.

3. Atualize package.json com scripts adicionais:
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint",
     "test": "vitest run",
     "test:shared": "vitest run app/_shared",
     "test:watch": "vitest"
   }

4. Atualize tsconfig.json para strict mode:
   - "strict": true
   - "noUncheckedIndexedAccess": true
   - "noImplicitReturns": true
   - Mantenha "moduleResolution": "bundler" e "paths": { "@/*": ["./*"] }

5. Crie/atualize .gitignore para incluir:
   node_modules/
   .next/
   out/
   .env.local
   .env*.local
   *.onnx
   *.task
   coverage/
   .DS_Store

6. Crie LICENSE na raiz com conteúdo AGPL-3.0 (use o template oficial da FSF; pode gerar via comando `curl -o LICENSE https://www.gnu.org/licenses/agpl-3.0.txt` ou similar).

7. Crie NOTICE na raiz com:
   DermaPro
   Copyright (C) 2026 Paulo Reis Silva

   This product includes software developed by third parties:

   - Ultralytics YOLOv8 (AGPL-3.0) — https://github.com/ultralytics/ultralytics
     Used only for converting the acne detection model to ONNX format.

   - Tinny-Robot/acne model (Apache 2.0) — https://huggingface.co/Tinny-Robot/acne
     Authors: Nathaniel Handan, Amina Shiga.

   - MediaPipe Face Landmarker (Apache 2.0) — Google LLC.

   - ONNX Runtime (MIT) — Microsoft Corporation.

   - shadcn/ui (MIT) — components/ui/ files.

   All other code is licensed under AGPL-3.0 (see LICENSE).

8. Sobrescreva README.md na raiz com:
   # DermaPro

   Análise visual da pele para uso em consultório dermatológico.

   ## Status
   Em desenvolvimento. Veja `docs/00-MASTER.md` para a arquitetura completa.

   ## Stack
   Next.js 14+ · TypeScript · Tailwind · MediaPipe · ONNX Runtime Web · Vitest.

   ## Como rodar localmente
   ```bash
   npm install
   npm run dev
   ```
   Abra http://localhost:3000.

   ## Documentação
   Toda a documentação está em `docs/`. Começar por `docs/00-MASTER.md`.

   ## Licença
   AGPL-3.0 (ver LICENSE). Atribuições de terceiros em NOTICE.

9. Execute `npm install` para garantir que tudo está OK.

10. Execute `npm run build` para validar que o projeto compila. Se der erro por app/page.tsx ausente, crie um placeholder temporário retornando <div>DermaPro em construção</div>.

11. Ao final, faça commit:
    git add -A
    git commit -m "chore: bootstrap do projeto Next.js com TypeScript, Tailwind e configs base"

Me devolva:
- Output do npm run build (resumido).
- Árvore de arquivos atual (ls recursivo até 2 níveis).
- Confirmação do commit.
```

**Verificação pelo humano:** `npm run dev` abre localhost:3000 mostrando "DermaPro em construção".

---

## Bloco 2 — Dependências do Projeto

### Prompt 2.1

```
Instale as dependências necessárias para o DermaPro. Execute em lotes para ficar rastreável:

1. UI e componentes:
   npm install @radix-ui/react-dialog @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-tooltip @radix-ui/react-progress @radix-ui/react-tabs class-variance-authority clsx tailwind-merge tailwindcss-animate lucide-react

2. ML e processamento:
   npm install @mediapipe/tasks-vision onnxruntime-web

3. Utilitários e exportação:
   npm install jspdf html2canvas recharts

4. Dev (testes):
   npm install -D vitest @vitest/ui happy-dom @testing-library/react @testing-library/jest-dom jsdom

5. Crie vitest.config.ts na raiz:
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';  // se este não existir, instale: npm install -D @vitejs/plugin-react
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'happy-dom',
       globals: true,
       setupFiles: ['./vitest.setup.ts'],
       include: ['**/*.test.{ts,tsx}'],
       exclude: ['node_modules', '.next', 'dist'],
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './'),
       },
     },
   });

6. Crie vitest.setup.ts na raiz:
   import '@testing-library/jest-dom/vitest';

7. Instale @vitejs/plugin-react se ainda não instalou:
   npm install -D @vitejs/plugin-react

8. Crie app/globals.css com:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   /* Variáveis CSS virão do design system via tokens.ts em bloco posterior. */

9. Atualize tailwind.config.ts (ou .js) para:
   - content inclui "./app/**/*.{ts,tsx}" e "./design/**/*.{ts,tsx}"
   - darkMode: 'class'
   - plugins: [require('tailwindcss-animate')]
   - theme.extend será preenchido no Bloco 4 (design tokens)

10. Configure o shadcn/ui (só setup; componentes individuais virão sob demanda):
    Crie components.json na raiz:
    {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "new-york",
      "rsc": true,
      "tsx": true,
      "tailwind": {
        "config": "tailwind.config.ts",
        "css": "app/globals.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils",
        "ui": "@/components/ui",
        "lib": "@/lib",
        "hooks": "@/hooks"
      },
      "iconLibrary": "lucide"
    }

11. Crie lib/utils.ts com:
    import { type ClassValue, clsx } from "clsx";
    import { twMerge } from "tailwind-merge";

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }

12. Rode npm run build para garantir que tudo ainda compila.

13. Commit:
    git add -A
    git commit -m "chore: instalar dependências (ui, ml, testes) e configurar shadcn/ui + vitest"

Me devolva:
- Lista de deps instaladas (de package.json).
- Output do npm run build.
- Confirmação do commit.
```

**Verificação:** build ainda passa, `npm test` roda (mesmo sem testes), nenhum erro de tipo.

---

## Bloco 3 — Design Tokens e Estilos Globais

### Prompt 3.1

```
Vamos aplicar o design system gerado na Fase 0.

Pré-requisito: a pasta design/ contém tokens.ts, DESIGN_SYSTEM.md, logo e mockups. Se qualquer um desses estiver faltando, PARE e me pergunte.

Faça:

1. Leia design/tokens.ts e design/DESIGN_SYSTEM.md.

2. Copie/adapte os tokens para app/_shared/design/tokens.ts. Se design/tokens.ts exporta exatamente no formato esperado, apenas reexporte. Se não, adapte para a estrutura:

   export const colors = {
     primary: { 50, 100, ..., 900 },
     secondary: { ... },
     accent: { ... },
     neutral: { ... },
     semantic: { info, success, warning, alert },
     modules: { acne, melasma, textura, linhas, rosacea, estrutura },
     overlays: { bbox, hiperpigmentacao, brilho, linhas },
   };

   export const typography = {
     fontFamily: { sans: ['Inter', ...] },  // adapte à fonte escolhida
     fontSize: { xs, sm, base, lg, xl, '2xl', '3xl', '4xl' },
     fontWeight: { regular: 400, medium: 500, semibold: 600 },
     lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
   };

   export const spacing = {
     // escala 4px do Tailwind, basta reexportar conceitualmente
   };

   export const radius = { sm, md, lg, xl, full };
   export const shadow = { sm, md, lg, xl };

   export const presentationMode = {
     fontSizeMultiplier: 1.2,
     contrastBoost: 1.15,
   };

3. Atualize tailwind.config.ts para consumir esses tokens:
   import { colors, typography, spacing, radius, shadow } from './app/_shared/design/tokens';

   module.exports = {
     content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
     darkMode: 'class',
     theme: {
       extend: {
         colors,
         fontFamily: typography.fontFamily,
         fontSize: typography.fontSize,
         fontWeight: typography.fontWeight,
         borderRadius: radius,
         boxShadow: shadow,
       },
     },
     plugins: [require('tailwindcss-animate')],
   };

4. Atualize app/globals.css:
   - Adicione @tailwind directives (já estão).
   - Adicione variáveis CSS semânticas derivadas dos tokens (para suportar dark mode via class="dark").
   - Adicione classe utilitária .presentation-mode que aplica os multiplicadores de presentationMode.
   - Importe fonte do Google Fonts (ou localmente se design/fonts/ existir) via @font-face ou link no layout.tsx.

5. Atualize app/layout.tsx:
   - Configure a fonte (via next/font se for Google Fonts).
   - Adicione <body className={inter.variable}> ou equivalente.
   - Meta tags básicas: title="DermaPro", description coerente.
   - Favicon: se design/logo/ tem favicon, use-o. Senão, crie app/favicon.ico temporário a partir do logo-mark.svg.
   - lang="pt-BR".

6. Valide visualmente:
   - Rode npm run dev.
   - Abra localhost:3000 e confirme que a fonte carregou, que as cores primárias estão aplicáveis.
   - Reporte qualquer erro de console.

7. Commit:
   git add -A
   git commit -m "feat: aplicar design system (tokens, tipografia, cores, fontes)"

Me devolva:
- Conteúdo final de tokens.ts (após adaptação).
- Confirmação de que a fonte carrega corretamente.
- Screenshot conceitual (descreva em palavras) do layout em localhost.
```

**Verificação pelo humano:** abra localhost e compare visualmente com os mockups da Fase 0. Se houver divergências, ajuste tokens antes de prosseguir.

---

## Bloco 4 — Registro Central de Módulos

### Prompt 4.1

```
Crie o registro central de módulos, que alimenta o hub e permite ativar/desativar módulos via flag.

Faça:

1. Crie app/_shared/config/modules.ts exatamente conforme a especificação do 00-MASTER.md seção 3.2. Isto é:

   export type ModuleConfig = {
     id: string;
     enabled: boolean;
     name: string;
     description: string;
     href: string;
     icon: string;              // nome Lucide
     order: number;
     badge?: 'beta' | 'em-breve' | null;
   };

   export const MODULES: ModuleConfig[] = [
     // acne, melasma, textura, linhas (enabled: true, badge: 'beta')
     // rosacea, estrutura-facial (enabled: false, badge: 'em-breve')
   ];

   export const getEnabledModules = () => MODULES.filter(m => m.enabled).sort((a, b) => a.order - b.order);
   export const getAllModules = () => [...MODULES].sort((a, b) => a.order - b.order);
   export const getModuleById = (id: string) => MODULES.find(m => m.id === id);

2. Crie app/_shared/config/modules.test.ts com testes básicos:
   - Deve retornar exatamente 6 módulos em getAllModules.
   - Deve retornar exatamente 4 módulos em getEnabledModules.
   - Todos os módulos têm campos obrigatórios preenchidos.
   - IDs são únicos.
   - Ordens são únicas.
   - Hrefs começam com "/".

3. Rode npm run test:shared e confirme que passa.

4. Commit:
   git add -A
   git commit -m "feat: registro central de módulos com feature flags"
```

**Verificação:** testes passam, 6 módulos listados com flags corretas.

---

## Bloco 5 — Utilitários do `_shared/ml/`

Este é o bloco mais extenso. Cada arquivo tem seu teste correspondente. Vou dividir em sub-blocos para o Claude Code não se perder.

### Prompt 5.1 — FaceLandmarker (MediaPipe)

```
Crie app/_shared/ml/faceLandmarker.ts que encapsula o MediaPipe Face Landmarker.

Requisitos:
1. Singleton com lazy-load do WASM (para carregar só quando necessário).
2. Método principal: detect(canvas: HTMLCanvasElement | OffscreenCanvas | ImageBitmap): Promise<{ landmarks: Array<{x, y, z}>; faceCount: number; rotation?: { yaw, pitch, roll } }>
3. Coordenadas normalizadas [0,1] convertidas para pixels da imagem ORIGINAL.
4. Suportar até 1 face por vez (reject se detectar múltiplas, devolvendo faceCount no resultado).
5. Modelo: face_landmarker.task do MediaPipe. Carregue a partir de CDN oficial (https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task) E com fallback para cópia local em public/models/face_landmarker.task se offline.
6. outputFaceBlendshapes: false, outputFacialTransformationMatrixes: true (para yaw/pitch/roll).

Crie também app/_shared/ml/faceLandmarker.test.ts com:
- Mock da biblioteca MediaPipe.
- Teste que detect() retorna estrutura correta.
- Teste que singleton não inicializa duas vezes.
- NÃO faça teste de integração real (exigiria GPU + WASM).

Rode `npm run test:shared` — passa?

Commit:
git add -A
git commit -m "feat(_shared): wrapper do MediaPipe Face Landmarker com testes"
```

### Prompt 5.2 — ROI Extractor

```
Crie app/_shared/ml/roiExtractor.ts.

Conteúdo:

1. Tipos exportados:
   export type FacialPoint = { x: number; y: number; z?: number };
   export type SkinROI = {
     name: string;              // 'forehead', 'leftCheek', etc.
     polygon: FacialPoint[];    // ordem horária
     holes?: FacialPoint[][];   // polígonos a subtrair (ex: narinas, olhos)
     bbox: { x1: number; y1: number; x2: number; y2: number };
   };

2. Funções utilitárias:
   - isPointInPolygon(point, polygon): boolean (ray casting).
   - isPointInROI(point, roi): boolean (dentro do polygon E fora de todos os holes).
   - polygonToBbox(polygon): { x1, y1, x2, y2 }.
   - polygonArea(polygon): number (pixels²).

3. Funções de extração de ROIs base (reutilizadas pelos módulos):
   - extractForeheadROI(landmarks, width, height): SkinROI
   - extractLeftCheekROI(landmarks, width, height): SkinROI
   - extractRightCheekROI(landmarks, width, height): SkinROI
   - extractChinROI(landmarks, width, height): SkinROI
   - extractNoseROI(landmarks, width, height): SkinROI  // com holes das narinas
   - extractSupralabialROI(landmarks, width, height): SkinROI  // usado em melasma

4. Função de utilidade geométrica:
   - interpupillaryDistancePx(landmarks): number (distância entre centros dos olhos, 468 e 473 se disponíveis; senão 33 e 263).
   - estimateFaceRotation(landmarks, transformationMatrix?): { yaw, pitch, roll } em graus.
   - estimateFaceAreaCm2(landmarks, interpupillaryPx, referenceMm = 63): number (polígono do contorno facial).

5. JSDoc detalhado com índices MediaPipe em comentários.

Crie app/_shared/ml/roiExtractor.test.ts com:
- Teste isPointInPolygon com casos simples (quadrado, triângulo).
- Teste isPointInROI com hole no meio.
- Teste extractForeheadROI com landmarks mockados (array de 478 pontos sintéticos).
- Teste interpupillaryDistancePx retorna valor positivo com mocks.
- Teste estimateFaceAreaCm2 retorna valor plausível (20-200 cm²).

Rode testes, commit com mensagem "feat(_shared): extrator de ROIs faciais com testes".
```

### Prompt 5.3 — Color Space (RGB ↔ Lab)

```
Crie app/_shared/ml/colorSpace.ts com conversões RGB ↔ Lab usando sRGB standard (D65).

Tipos:
- RGBColor = { r: number; g: number; b: number };  // 0-255
- LabColor = { L: number; a: number; b: number };  // L 0-100, a/b -128 a +127

Funções:
- rgbToXyz(rgb: RGBColor): { X, Y, Z }
- xyzToLab(xyz: { X, Y, Z }): LabColor
- rgbToLab(rgb: RGBColor): LabColor (compõe as duas acima)
- labToXyz, xyzToRgb, labToRgb (inversos)
- imageDataToLab(imageData: ImageData): LabColor[] (pula alpha, retorna array paralelo)

Referência: http://www.brucelindbloom.com/index.html?Equations.html

Crie colorSpace.test.ts com:
- rgbToLab({r:255, g:0, b:0}) ≈ {L: 53.24, a: 80.09, b: 67.20} (vermelho puro).
- rgbToLab({r:255, g:255, b:255}) ≈ {L: 100, a: 0, b: 0} (branco puro).
- rgbToLab({r:0, g:0, b:0}) ≈ {L: 0, a: 0, b: 0} (preto).
- Round trip: rgbToLab → labToRgb deve retornar valores ~iguais aos originais (tolerância ±1).

Commit: "feat(_shared): conversão de espaço de cor RGB/Lab com testes".
```

### Prompt 5.4 — HSV Color Space

```
Crie app/_shared/ml/hsvColorSpace.ts.

Tipo: HSVColor = { h: number; s: number; v: number };  // h 0-360°, s/v 0-255.

Funções:
- rgbToHsv(rgb: RGBColor): HSVColor (fórmula padrão).
- hsvToRgb(hsv: HSVColor): RGBColor (inverso).
- imageDataToHsv(imageData: ImageData): HSVColor[].

Crie hsvColorSpace.test.ts:
- rgbToHsv({255,0,0}) ≈ {h: 0, s: 255, v: 255}.
- rgbToHsv({0,255,0}) ≈ {h: 120, s: 255, v: 255}.
- rgbToHsv({0,0,255}) ≈ {h: 240, s: 255, v: 255}.
- rgbToHsv({128,128,128}) ≈ {h: 0, s: 0, v: 128}.
- Round trip tolerância ±1.

Commit: "feat(_shared): conversão RGB/HSV com testes".
```

### Prompt 5.5 — Morfologia

```
Crie app/_shared/ml/morphology.ts com operações morfológicas em imagens binárias e em grayscale.

Funções:

Binário:
- erode(binary: Uint8Array, width, height, kernelSize: number): Uint8Array (3x3 ou 5x5).
- dilate(binary: Uint8Array, width, height, kernelSize: number): Uint8Array.
- morphOpen(binary, width, height, kernelSize): Uint8Array (erode + dilate).
- morphClose(binary, width, height, kernelSize): Uint8Array (dilate + erode).

Grayscale (para black top-hat, white top-hat):
- grayErode(img: Uint8Array, width, height, kernel: {mask, size}): Uint8ClampedArray.
- grayDilate(img, width, height, kernel): Uint8ClampedArray.
- grayClose(img, width, height, kernel): Uint8ClampedArray.
- grayOpen(img, width, height, kernel): Uint8ClampedArray.

Kernels:
- createBoxKernel(size): {mask, size} (tudo 1).
- createDiskKernel(radius): {mask, size} (pixels dentro do círculo de radius).

Threshold:
- otsuThreshold(img: Uint8Array, factor: number = 1.0): { threshold: number; binary: Uint8Array }.

Teste morphology.test.ts:
- erode 3x3 em imagem 5x5 com blob central 3x3 → resulta em ponto 1x1.
- dilate 3x3 em ponto único 1x1 → resulta em blob 3x3.
- morphOpen + morphClose deve ser aproximadamente identidade (teste com blob isolado).
- grayDilate de imagem com pico localizado produz pico maior.
- otsuThreshold em imagem bimodal separa as duas classes.
- createDiskKernel(3) retorna mask 7x7 com pontos corretos dentro do círculo.

Commit: "feat(_shared): operações morfológicas (erode/dilate/open/close) binárias e grayscale com testes".
```

### Prompt 5.6 — CLAHE

```
Crie app/_shared/ml/clahe.ts (Contrast Limited Adaptive Histogram Equalization, Zuiderveld 1994).

Função principal:
clahe(gray: Uint8Array | Uint8ClampedArray, width: number, height: number, clipLimit: number = 2.0, tileSize: number = 8): Uint8ClampedArray

Algoritmo:
1. Divide imagem em tiles tileSize × tileSize.
2. Para cada tile:
   a. Histograma (256 bins).
   b. Clip: valores acima de (clipLimit × tileArea / 256) → redistribui excesso.
   c. CDF acumulada normalizada.
3. Para cada pixel, interpolação bilinear entre as 4 CDFs dos tiles vizinhos.

Se bilinear for complexo demais na primeira versão, implemente SEM interpolação (só aplica CDF do tile local) e deixe TODO para otimização futura.

Teste clahe.test.ts:
- Imagem uniforme (todos pixels = 128) permanece uniforme.
- Imagem com baixo contraste (valores 100-140) ganha contraste (variância aumenta).
- Pixels individuais permanecem no intervalo [0, 255].
- Dimensões preservadas.

Commit: "feat(_shared): CLAHE com testes (versão simplificada/bilinear)".
```

### Prompt 5.7 — Connected Components

```
Crie app/_shared/ml/connectedComponents.ts com rotulação two-pass (Rosenfeld-Pfaltz 1966).

Tipo:
export type ConnectedComponent = {
  id: number;
  pixels: number[];          // índices lineares no array de entrada
  area: number;
  bbox: { x1, y1, x2, y2 };
  centroid: { x, y };
};

Funções:
- connectedComponents(binary: Uint8Array, width, height, connectivity: 4 | 8 = 8): ConnectedComponent[]
- calculateEccentricity(pixels: number[], width: number): number (momentos 2ª ordem).
- calculateOrientation(pixels: number[], width: number): number (graus, 0 = horizontal).
- filterComponents(components, opts: { minArea?, maxArea?, maxEccentricity?, minFillRatio? }): ConnectedComponent[]

Use union-find com path compression.

Teste connectedComponents.test.ts:
- Imagem 10x10 com 3 blobs separados → 3 componentes.
- Áreas calculadas corretamente.
- Centróides calculados corretamente.
- Conectividade 4 vs 8 (teste com diagonal: 4 dá 2 componentes, 8 dá 1).
- Eccentricity de círculo ≈ 0, de linha reta ≈ 1.
- filterComponents descarta componentes fora dos critérios.

Commit: "feat(_shared): rotulação de componentes conectados com testes".
```

### Prompt 5.8 — Gaussian Blur

```
Crie app/_shared/ml/gaussianBlur.ts (2D separável para performance).

Funções:
- createGaussianKernel1D(sigma: number): Float32Array (normalizada).
- convolve1DHorizontal(img: Float32Array, width, height, kernel): Float32Array.
- convolve1DVertical(img: Float32Array, width, height, kernel): Float32Array.
- gaussianBlur(img: Uint8Array | Uint8ClampedArray | Float32Array, width, height, sigma): Float32Array.

Bordas por replicação (reflect).

Teste gaussianBlur.test.ts:
- Kernel com sigma=1 tem soma ≈ 1.
- Imagem uniforme permanece uniforme após blur.
- Imagem com impulso unitário → resultado aproxima-se de uma Gaussiana discreta.
- Dimensões preservadas.
- sigma=0.5 preserva mais detalhe que sigma=3.

Commit: "feat(_shared): Gaussian blur 2D separável com testes".
```

### Prompt 5.9 — Hessian Matrix

```
Crie app/_shared/ml/hessianMatrix.ts.

Funções:
- createGaussianDerivativeKernel1D(sigma: number, order: 0 | 1 | 2): Float32Array
  order=0: G(x) gaussiano
  order=1: -x/σ² · G(x)
  order=2: (x²/σ⁴ − 1/σ²) · G(x)

- computeHessian2D(img: Float32Array, width, height, sigma): { Hxx, Hyy, Hxy: Float32Array }
  Hxx: G''_x ⊗ G_y
  Hyy: G_x ⊗ G''_y
  Hxy: G'_x ⊗ G'_y

- computeEigenvalues2x2(Hxx, Hyy, Hxy): { lambda1, lambda2: Float32Array } ordenados |λ1| ≤ |λ2|.

- computeGradient2D(img, width, height, sigma = 1.0): { gradMagnitude, gradOrientation: Float32Array }.

Teste hessianMatrix.test.ts:
- createGaussianDerivativeKernel1D com sigma=1, order=0 soma ≈ 1.
- createGaussianDerivativeKernel1D com order=1 tem soma ≈ 0.
- Em imagem sem estrutura (uniforme), eigenvalues ≈ 0.
- Em imagem com linha vertical escura fina, lambda2 >> lambda1 na linha.
- Gradient de imagem uniforme tem magnitude ≈ 0.

Commit: "feat(_shared): matriz Hessiana 2D + autovalores + gradiente com testes".
```

### Prompt 5.10 — ITA Calculator

```
Crie app/_shared/ml/itaCalculator.ts (Individual Typology Angle).

ITA = arctan((L − 50) / b) × 180/π (referência: Chardon et al., Int J Cosmet Sci, 1991).

Tipo:
export type ITAResult = {
  angle: number;
  category: 'very_light' | 'light' | 'intermediate' | 'tan' | 'brown' | 'dark';
  avgL: number;
  avgB: number;
};

Funções:
- calculateITA(avgL: number, avgB: number): ITAResult
  angle = atan2(avgL - 50, avgB) * 180 / PI
  categoria por faixa:
    >55 → very_light
    41-55 → light
    28-41 → intermediate
    10-28 → tan
    -30 a 10 → brown
    < -30 → dark

- calculateITAFromPixels(labPixels: LabColor[]): ITAResult (calcula médias, exclui outliers por IQR opcional).

- calculateITAFromCanvas(canvas: HTMLCanvasElement, regions: SkinROI[]): ITAResult (converte pixels das ROIs para Lab, chama calculateITAFromPixels).

Teste itaCalculator.test.ts:
- calculateITA(70, 10) → angle=63.4°, category='very_light'.
- calculateITA(30, 5) → category='dark' (angle ~ -75°).
- Casos-limite nos thresholds.

Commit: "feat(_shared): calculadora ITA (tom de pele) com testes".
```

### Prompt 5.11 — Image Quality

```
Crie app/_shared/qa/imageQuality.ts para validar uploads.

Tipo:
export type QualityCheckResult = {
  passed: boolean;
  warnings: string[];
  errors: string[];
  metrics: {
    width: number;
    height: number;
    aspectRatio: number;
    blurScore: number;      // Laplacian variance
    avgBrightness: number;  // média de V do HSV (0-255)
    sideBias: number;       // diferença média esq vs dir (iluminação lateral)
  };
};

Função principal:
runQualityChecks(canvas: HTMLCanvasElement, opts: {
  minWidth: number;
  minHeight: number;
  maxBlurScore?: number;       // rejeita se < maxBlurScore
  minBrightness?: number;      // rejeita se < minBrightness
  maxBrightness?: number;      // rejeita se > maxBrightness
  maxSideBias?: number;        // warning se > maxSideBias
}): QualityCheckResult

Funções auxiliares:
- computeLaplacianVariance(gray, width, height): number (medida de foco).
- computeAvgBrightness(imageData): number.
- computeSideBias(imageData): number (compara metade esquerda vs direita).

Teste imageQuality.test.ts:
- Imagem muito pequena → error.
- Imagem muito borrada → warning ou error conforme threshold.
- Imagem muito escura → warning.
- Imagem com iluminação lateral forte → warning.
- Imagem boa → passed=true, warnings vazios.

Commit: "feat(_shared): QA de imagem com métricas de blur/brilho/lateralidade".
```

### Prompt 5.12 — Barrel exports

```
Crie app/_shared/ml/index.ts com barrel exports:

export * from './faceLandmarker';
export * from './roiExtractor';
export * from './colorSpace';
export * from './hsvColorSpace';
export * from './morphology';
export * from './clahe';
export * from './connectedComponents';
export * from './gaussianBlur';
export * from './hessianMatrix';
export * from './itaCalculator';

Crie app/_shared/qa/index.ts:
export * from './imageQuality';

Confira que todos os imports em futuros módulos podem usar:
import { rgbToLab, calculateITA, frangiFilter... } from '@/app/_shared/ml';

Commit: "chore(_shared): barrel exports para ml/ e qa/".
```

**Verificação global do Bloco 5:** `npm run test:shared` passa em TODOS os arquivos. Rode `npx vitest --coverage` opcionalmente para ver cobertura.

---

## Bloco 6 — Componentes UI Compartilhados

### Prompt 6.1 — shadcn/ui base

```
Adicione os componentes base do shadcn/ui que usaremos globalmente:

npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add tabs
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add tooltip
npx shadcn@latest add alert

Estes serão instalados em components/ui/ (padrão shadcn). Confirme que funciona importar:
import { Button } from "@/components/ui/button";

Commit: "chore: adicionar componentes base shadcn/ui".
```

### Prompt 6.2 — DisclaimerModal

```
Crie app/_shared/components/DisclaimerModal.tsx.

Props:
{
  moduleType: 'general' | 'acne' | 'melasma' | 'textura' | 'linhas' | 'rosacea' | 'estrutura';
  open: boolean;
  onAccept: () => void;
}

Comportamento:
- Usa Dialog do shadcn/ui.
- Título: "Antes de começar"
- Texto específico por moduleType (placeholder por enquanto; será preenchido ao implementar cada módulo).
- Texto geral obrigatório: "O DermaPro é uma ferramenta de análise visual estética e educacional. Não constitui dispositivo médico nem substitui avaliação clínica presencial. Imagens processadas localmente, nunca enviadas a servidores."
- Botão "Entendi e quero prosseguir" chama onAccept.
- Link "Saber mais" aponta para /sobre.

Texto por moduleType (pt-BR, neutro, sem termos proibidos):
- general: texto padrão global.
- acne: adaptação focada em contagem de lesões.
- melasma: adaptação focada em hiperpigmentação.
- textura: adaptação focada em poros e oleosidade.
- linhas: adaptação focada em sinais de expressão, com ênfase em normalização.
- rosacea/estrutura: placeholder "em desenvolvimento".

Sem testes renderizados (componentes visuais → teste manual). Se Claude quiser, adicionar teste de snapshot simples com Vitest.

Commit: "feat(_shared): DisclaimerModal reutilizável por módulo".
```

### Prompt 6.3 — UploadCard

```
Crie app/_shared/components/UploadCard.tsx.

Props:
{
  onFileSelected: (file: File, bitmap: ImageBitmap) => void;
  moduleType?: string;
  minWidth?: number;
  minHeight?: number;
  instructions?: string[];  // lista de orientações específicas
}

Comportamento:
- Drag & drop de imagem OU clicar para abrir file picker.
- Validação inline:
  - Só aceita image/jpeg e image/png.
  - Tamanho máximo 20 MB.
  - Dimensões mínimas (minWidth/minHeight).
- Ao selecionar, cria ImageBitmap e chama onFileSelected.
- Exibe lista de `instructions` como bullets discretas abaixo da área de drop (orientações específicas como "sem maquiagem", "luz frontal difusa", "afaste o cabelo").
- Estado visual: hover, dragging, loading.
- Use Card do shadcn/ui como container.

Instruções padrão se não fornecido:
- "Use luz natural ou lâmpada difusa, sem flash direto."
- "Olhe frontalmente para a câmera, rosto desocluído."
- "Rosto sem maquiagem para melhor resultado."
- "Resolução mínima: {minWidth}×{minHeight}."

Commit: "feat(_shared): UploadCard com drag/drop e validação".
```

### Prompt 6.4 — UncertaintyBanner

```
Crie app/_shared/components/UncertaintyBanner.tsx.

Props:
{
  warnings: string[];
  severity?: 'info' | 'warning';
}

Comportamento:
- Se warnings vazio, retorna null.
- Renderiza banner discreto (usando Alert do shadcn/ui) com lista de warnings.
- Severidade 'info' (azul suave) para avisos gerais; 'warning' (âmbar suave) para alertas que afetam precisão.
- Ícone à esquerda (Info ou AlertCircle do Lucide).

Commit: "feat(_shared): UncertaintyBanner para alertas contextuais".
```

### Prompt 6.5 — ModuleCard (card do hub)

```
Crie app/_shared/components/ModuleCard.tsx.

Props:
{
  module: ModuleConfig;  // do config/modules.ts
}

Comportamento:
- Card do shadcn/ui.
- Header: ícone (Lucide, nome vindo de module.icon) em tamanho grande, cor do módulo (design/tokens).
- Título (module.name), descrição (module.description).
- Badge à direita: se module.badge === 'beta' mostra "Beta" em azul; se 'em-breve' mostra "Em breve" em cinza.
- Se module.enabled → card clicável (usa next/link para href). Hover com leve elevação.
- Se !module.enabled → card esmaecido (opacity-60), cursor-not-allowed, sem ação.
- Respeita design tokens: cor do card varia sutilmente por módulo (backgroundColor: module color com alpha baixo).

Commit: "feat(_shared): ModuleCard para o hub".
```

### Prompt 6.6 — DownloadPhotoButton

```
Crie app/_shared/components/DownloadPhotoButton.tsx.

Props:
{
  originalCanvas?: HTMLCanvasElement | null;
  annotatedCanvas?: HTMLCanvasElement | null;
  moduleId: string;  // para nome do arquivo
  filenamePrefix?: string;
}

Comportamento:
- Dropdown menu (shadcn DropdownMenu, instale se não tiver) com opções:
  a. "Baixar foto original" (desabilita se !originalCanvas).
  b. "Baixar foto com marcações" (desabilita se !annotatedCanvas).
- Formato: PNG por padrão, qualidade 0.95 para JPEG.
- Nome do arquivo: `dermapro-{moduleId}-{YYYY-MM-DD-HHmmss}.png`.
- Trigger: Button do shadcn com ícone Download do Lucide + texto "Baixar".

Implementação do download: cria blob do canvas, usa URL.createObjectURL + link <a download>. Revoga o URL após uso.

Commit: "feat(_shared): DownloadPhotoButton com opções original e anotada".
```

### Prompt 6.7 — PresentationModeToggle

```
Crie app/_shared/components/PresentationModeToggle.tsx.

Comportamento:
- Toggle visual (ícone Maximize / Minimize do Lucide).
- Ao ativar: adiciona classe `.presentation-mode` ao document.body (CSS já tem isso em globals.css do Bloco 3).
- Atalho de teclado: `P` alterna o modo.
- Use Context React (PresentationModeContext) para que outros componentes possam reagir.

Crie também app/_shared/components/PresentationModeProvider.tsx (Context):
- Estado: boolean presentationMode.
- Função togglePresentationMode.
- Listener global de keydown para tecla P.

Atualize app/layout.tsx para envolver <body> com <PresentationModeProvider>.

Commit: "feat(_shared): Modo Apresentação com Context + toggle + atalho P".
```

### Prompt 6.8 — Barrel exports de components/

```
Crie app/_shared/components/index.ts:

export { DisclaimerModal } from './DisclaimerModal';
export { UploadCard } from './UploadCard';
export { UncertaintyBanner } from './UncertaintyBanner';
export { ModuleCard } from './ModuleCard';
export { DownloadPhotoButton } from './DownloadPhotoButton';
export { PresentationModeToggle } from './PresentationModeToggle';
export { PresentationModeProvider, usePresentationMode } from './PresentationModeProvider';

Commit: "chore(_shared): barrel exports para components/".
```

---

## Bloco 7 — PDF Export Base

### Prompt 7.1

```
Crie app/_shared/report/pdfExportBase.ts com helpers genéricos reusáveis em todos os módulos.

Função:
createPdfDocument(): { doc: jsPDF; addHeader: (title: string) => void; addFooter: (pageNumber: number) => void; ... }

Helpers:
- addHeader(doc, title): logo + título (do DermaPro) + data.
- addFooter(doc, pageNumber, totalPages): numeração + disclaimer base ("Análise visual estética. Não constitui diagnóstico médico.").
- addImageWithCaption(doc, canvas, caption, y): adiciona imagem centralizada com legenda abaixo.
- addSection(doc, title, y): cabeçalho de seção.
- addTable(doc, headers, rows, y): tabela simples.
- downloadPdf(doc, filename): salva arquivo com nome dermapro-{modulo}-{timestamp}.pdf.

Configuração padrão: A4 retrato, margens 20mm, fonte Helvetica (embutida no jsPDF; para usar Inter, converter para base64 ou omitir por simplicidade no MVP).

Sem testes unitários (renderização de PDF é integração).

Commit: "feat(_shared): helpers base para exportação PDF".
```

---

## Bloco 8 — Páginas Legais e Sobre

### Prompt 8.1 — Página /sobre

```
Crie app/sobre/page.tsx.

Conteúdo (pt-BR, tom profissional e acolhedor):

# Sobre o DermaPro

## O que é
O DermaPro é uma ferramenta web de análise visual da pele desenvolvida para uso em consulta dermatológica. Ele processa fotos faciais e gera estimativas quantitativas sobre características cutâneas — acne, melasma, textura (poros e oleosidade) e sinais de expressão — sempre apresentadas com linguagem descritiva, nunca prescritiva.

## Como funciona
1. Você envia uma foto frontal do paciente (tirada no celular, enviada ao notebook).
2. O DermaPro processa a imagem inteiramente no seu dispositivo. A foto NÃO é enviada a nenhum servidor.
3. Você recebe métricas por região e um overlay visual sobre a própria foto, que pode ser espelhado em Apple TV para conversa com o paciente.
4. Todos os resultados podem ser baixados em PDF para o prontuário e a foto anotada pode ser baixada separadamente.

## O que NÃO é
- Não é dispositivo médico registrado na ANVISA.
- Não substitui a avaliação clínica presencial.
- Não prescreve tratamentos.
- Não estabelece diagnósticos.

## Privacidade
- Imagens são processadas 100% no navegador do usuário.
- Nenhuma imagem é enviada a servidores externos.
- Nenhum dado pessoal é coletado ou armazenado.

## Propósito
Este é um projeto de uso próprio, não comercial, desenvolvido por dermatologista para apoiar suas próprias consultas. A natureza não-comercial é essencial para a licença de alguns componentes de terceiros e deve ser preservada.

## Módulos disponíveis
[Lista dos 4 módulos ativos + menção aos 2 em desenvolvimento, com breve descrição.]

## Créditos técnicos
[Lista de papers e bibliotecas usadas, por módulo. Será preenchida ao longo do desenvolvimento.]

## Tecnologia
- Next.js 14+ com App Router.
- TypeScript, Tailwind, shadcn/ui.
- MediaPipe Face Landmarker (Google, Apache 2.0).
- ONNX Runtime Web (Microsoft, MIT).
- Algoritmos clássicos de processamento de imagem (Frangi 1998, Ng 2014, Zuiderveld 1994, Rosenfeld-Pfaltz 1966).

## Licença
Código do projeto: AGPL-3.0 (ver repositório).

Commit: "feat: página /sobre com visão geral, privacidade e créditos".
```

### Prompt 8.2 — Páginas /privacidade e /termos

```
Crie app/privacidade/page.tsx com texto de privacidade adequado à LGPD:

# Política de Privacidade — DermaPro

Última atualização: [data].

## Natureza do processamento
O DermaPro processa imagens enviadas pelo usuário EXCLUSIVAMENTE no navegador do dispositivo local. Nenhuma imagem é transmitida a servidores externos.

## Dados coletados
Nenhum dado pessoal é coletado pelo DermaPro. Não há cadastro, login, cookies de rastreamento, analytics ou telemetria.

## Armazenamento
Nenhum dado é armazenado pelo DermaPro. Fotos enviadas permanecem apenas na memória do navegador durante a sessão e são descartadas quando a aba é fechada.

## Downloads
Quando o usuário decide baixar uma foto ou PDF, o arquivo é salvo no dispositivo dele, sem passar por nenhum servidor do projeto.

## Terceiros
O DermaPro usa CDN do Google (MediaPipe) e CDN genéricos (ONNX Runtime) apenas para baixar modelos estáticos de ML. Essas requisições não carregam dados do paciente.

## Base legal
Por não haver tratamento de dados pessoais, as obrigações da LGPD não se aplicam no uso comum.

## Contato
Para dúvidas, contate o responsável pelo repositório github.com/reispaulosilva-boop/dermapro.

---

Crie app/termos/page.tsx:

# Termos de Uso — DermaPro

Última atualização: [data].

## Propósito
O DermaPro é ferramenta de apoio visual para uso em consulta dermatológica. Não é dispositivo médico.

## Uso adequado
- O DermaPro é ferramenta auxiliar, não substitui avaliação clínica.
- Resultados são estimativas visuais baseadas em algoritmos de processamento de imagem, sujeitas a limitações documentadas em cada módulo.
- A responsabilidade clínica permanece integralmente com o profissional médico.

## Limitação de responsabilidade
O projeto é fornecido "como está", sem garantias. O autor não se responsabiliza por:
- Decisões clínicas tomadas com base nos resultados.
- Erros de algoritmo, limitações conhecidas ou imprecisões.
- Problemas técnicos de hardware ou navegador.

## Uso não-comercial
O DermaPro é mantido como projeto não-comercial. Uso comercial ou redistribuição modificada deve respeitar a licença AGPL-3.0 e as licenças dos componentes de terceiros (algumas das quais são CC BY-NC-SA 4.0, incompatíveis com uso comercial).

## Alterações
Estes termos podem ser atualizados. Mudanças significativas serão anunciadas no repositório GitHub.

Commit: "feat: páginas de privacidade e termos de uso".
```

---

## Bloco 9 — Hub (Página Principal)

### Prompt 9.1

```
Implemente app/page.tsx como o hub principal.

Comportamento:
- Header com logo DermaPro (importe do design/logo/ como SVG) e navegação mínima (Sobre, Privacidade, Termos).
- Hero breve: "Análise visual da pele em consulta." com subtítulo curto.
- Grid de ModuleCard para cada módulo de getAllModules() (4 ativos + 2 em breve).
  - Grid responsivo: 1 coluna mobile, 2 em tablet, 3 em desktop.
  - Cards ativos aparecem primeiro; "em breve" no final.
- Footer com:
  - Link para repositório GitHub.
  - Menção "Projeto de uso próprio, não comercial."
  - Versão (ler do package.json).

Importante:
- Use ModuleCard do _shared/components.
- Use getAllModules() do _shared/config/modules.
- Aplique design tokens em todos os elementos.
- Respeite modo apresentação (amplia cards, esconde header/footer).

Adicionar também:
- Botão PresentationModeToggle no header (canto superior direito).
- Primeira visita mostra DisclaimerModal com moduleType="general".
  - Use sessionStorage key 'dermapro-global-disclaimer-accepted'.

Valide:
- Rode npm run dev.
- Acesse localhost:3000, veja 6 cards.
- Clique em cards ativos → navega para rota (mesmo que a rota ainda não exista, Next.js mostra 404 — esperado).
- Clique em cards desativados → nada acontece (ou mostra tooltip "Em desenvolvimento").
- Pressione P → modo apresentação ativa.
- F5 → reabre disclaimer.

Commit: "feat: hub principal com ModuleCards, disclaimer global e modo apresentação".
```

---

## Bloco 10 — Rotas Placeholder dos Módulos

### Prompt 10.1

```
Para permitir deploy imediato sem esperar implementação completa dos módulos, crie placeholders em cada rota de módulo.

Para cada um dos 6 módulos (acne, melasma, textura, linhas, rosacea, estrutura-facial), crie:

app/{modulo}/page.tsx:
'use client';
export default function ModuloPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-2xl font-semibold">Módulo {NOME} em desenvolvimento</h1>
      <p className="text-muted-foreground">Este módulo será implementado em breve. Volte ao hub para explorar os outros.</p>
      <a href="/" className="text-primary underline">Voltar ao hub</a>
    </main>
  );
}

Os 4 módulos ativos (acne, melasma, textura, linhas) ganharão implementação nas próximas fases. Os 2 desativados (rosacea, estrutura-facial) permanecerão com esta tela mesmo após MVP — é o comportamento esperado quando enabled=false.

Commit: "feat: placeholder pages para os 6 módulos".
```

---

## Bloco 11 — Service Worker Básico

### Prompt 11.1

```
Implemente um Service Worker simples para cache de assets estáticos (não é obrigatório no MVP absoluto, mas ajuda performance).

Crie public/sw.js:
- Cache name: 'dermapro-assets-v1'.
- Cachear: HTML, CSS, JS bundles, fontes, ícones.
- Estratégia: cache-first para assets imutáveis; network-first para HTML.
- No activate, limpar caches antigos.

Registre em app/layout.tsx:
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);

Tome cuidado: Service Worker em desenvolvimento pode causar confusão de cache. Só registrar em produção.

Se preferir pular este bloco para simplificar e implementar depois, apenas crie public/sw.js vazio com comentário TODO e documente no README.

Commit: "feat: service worker básico para cache de assets".
```

---

## Bloco 12 — Deploy Vercel e Validação End-to-End

### Prompt 12.1

```
Prepare o projeto para deploy na Vercel.

Faça:

1. Rode npm run build localmente. Se der erro, corrija.

2. Crie/atualize vercel.json na raiz (se necessário para customizações):
   {
     "buildCommand": "npm run build",
     "devCommand": "npm run dev",
     "installCommand": "npm install",
     "framework": "nextjs"
   }

3. Atualize next.config.js:
   const nextConfig = {
     reactStrictMode: true,
     headers: async () => [
       {
         // Necessário para MediaPipe e ONNX Runtime Web (SharedArrayBuffer)
         source: '/(.*)',
         headers: [
           { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
           { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
         ],
       },
     ],
     // Permitir imagem de CDNs externos se necessário no futuro
   };
   module.exports = nextConfig;

4. Rode npm run build novamente e npm run start. Acesse localhost:3000 e valide:
   - Hub carrega com 6 cards.
   - Disclaimer aparece.
   - Modo apresentação funciona.
   - Navegação entre rotas funciona.
   - Páginas /sobre, /privacidade, /termos abrem.
   - Placeholder de cada módulo carrega.
   - npm run test:shared passa.

5. Commit final desta fase:
   git add -A
   git commit -m "chore: headers COOP/COEP e config Vercel para deploy"

6. Push:
   git push origin main

7. Instrua o humano a acessar vercel.com, conectar o repo GitHub e fazer primeiro deploy (operação manual, não automatizável pelo Claude Code).

Me devolva:
- Output do build final (sem erros).
- Confirmação de push.
- Lista de verificação validada.
- Instruções passo a passo para o humano fazer o deploy na Vercel (acesso à Vercel, login, "Add New Project", seleção do repositório, defaults do Next.js, click em deploy).
```

**Verificação pelo humano:**
1. Acesse https://vercel.com, login com GitHub, "Add New Project".
2. Selecione o repo `dermapro`. Vercel detecta Next.js automaticamente.
3. Clique em Deploy. Aguarde build.
4. Acesse a URL gerada (`dermapro-xxxxx.vercel.app`). Navegue no hub. Abra os placeholders.
5. Se tudo estiver ok, a Fase 1 está concluída.

---

## Bloco 13 — Retrospectiva da Fase 1

### Prompt 13.1

```
Para encerrar a Fase 1, gere um documento de retrospectiva.

Crie docs/retrospectivas/FASE-1-RETROSPECTIVA.md com:

1. Resumo do que foi construído (bullet list de arquivos criados por área).
2. Estatísticas:
   - Linhas de código em _shared/ (rode `wc -l app/_shared/**/*.ts`).
   - Linhas de testes.
   - Cobertura (se rodou --coverage).
   - Tamanho do bundle do hub.
3. Decisões arquiteturais tomadas durante a execução que divergem do MASTER (se houver).
4. Débitos técnicos identificados:
   - Service Worker simplificado (pode evoluir).
   - CLAHE sem interpolação bilinear (TODO futuro).
   - Skeletonize ainda não implementado (fica para módulo de linhas).
   - PDF export sem fonte Inter embutida (usa Helvetica padrão).
5. Próxima fase: Módulo Acne (docs/03-MODULO-ACNE.md).

Commit: "docs: retrospectiva da Fase 1".

Me devolva o resumo executivo da retrospectiva.
```

---

## Critérios de Aceitação da Fase 1

Antes de considerar encerrada e passar para o Módulo Acne, valide:

- [ ] `npm run build` passa sem erros.
- [ ] `npm run test:shared` passa 100%.
- [ ] Hub mostra 6 ModuleCards (4 ativos, 2 em breve).
- [ ] Cards ativos clicam e levam a placeholder; cards desativados não clicam.
- [ ] Páginas /sobre, /privacidade, /termos carregam.
- [ ] Disclaimer modal aparece na primeira visita.
- [ ] Modo apresentação ativa com tecla P (amplia tipografia, esconde chrome).
- [ ] Design tokens aplicados (cores coerentes com Fase 0 e mockups).
- [ ] Logo DermaPro presente no header e favicon.
- [ ] Deploy Vercel realizado, URL acessível.
- [ ] `_shared/ml/`, `_shared/qa/`, `_shared/components/`, `_shared/config/`, `_shared/design/`, `_shared/report/` têm index.ts funcionando (imports por barrel funcionam).
- [ ] LICENSE (AGPL-3.0), NOTICE, README atualizados.
- [ ] .gitignore correto (node_modules, .next, *.onnx fora do repo).

Se todos os itens estiverem marcados, você está pronto para a Fase 2.

---

*Fim da Fase 1. Versão 1.0 — 17 de abril de 2026.*
