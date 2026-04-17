# DermaPro — Documento Master

**Versão:** 1.0
**Data:** 17 de abril de 2026
**Repositório:** https://github.com/reispaulosilva-boop/dermapro
**Propósito:** este é o documento organizacional central do projeto. Toda decisão arquitetural, padrão transversal, convenção e ordem de execução estão registrados aqui. Demais documentos desta pasta são apêndices que detalham fases específicas ou módulos.

---

## 1. Visão do Produto

### 1.1 O que é o DermaPro

DermaPro é uma aplicação web de análise visual da pele, construída para uso em consultório dermatológico. Roda em Next.js, 100% client-side (imagens nunca saem do dispositivo), hospedada gratuitamente na Vercel.

### 1.2 Perfil do usuário principal

Médico dermatologista (proprietário do projeto) que atende em consultório e utiliza a ferramenta durante a consulta, com foto tirada do celular, enviada ao notebook (MacBook M1) e espelhada em Apple TV para conversa visual com o paciente.

**Implicações desse cenário de uso** (muito importantes, permeiam toda a arquitetura):

- **Estética clínica moderna** é tão importante quanto a precisão dos algoritmos.
- **Legibilidade a distância**: interface será vista em TV, a alguns metros de distância.
- **Ambiente emocionalmente sensível**: paciente está presente, vê a tela. Linguagem e cores importam.
- **Velocidade importa**: análise em poucos segundos para não travar o fluxo da consulta.
- **Download da foto analisada a qualquer momento**: requisito transversal obrigatório.

### 1.3 Filosofia do produto

- **Privacidade radical**: zero imagem transmitida a servidor.
- **Interpretabilidade**: cada número é rastreável até uma medida geométrica ou fotométrica concreta.
- **Linguagem respeitosa**: ferramenta assiste a conversa clínica, nunca julga o paciente.
- **Custo zero operacional**: Vercel Hobby + GitHub + inferência no navegador.
- **Arquitetura evolutiva**: módulos novos (Rosácea, FaceMesh, relatório combinado) plugam sem refatoração.

---

## 2. Arquitetura Global

### 2.1 Stack

- **Next.js 14+** com App Router.
- **TypeScript** estrito.
- **Tailwind CSS** + **shadcn/ui** para componentes base.
- **MediaPipe Face Landmarker** para segmentação facial (utilizado em todos os módulos).
- **ONNX Runtime Web** apenas no módulo Acne (único com modelo ML).
- **jsPDF** para exportação de relatórios.
- **Recharts** para gráficos.
- **Vitest** para testes unitários (obrigatório em `_shared/`).

### 2.2 Hospedagem

- **GitHub**: `reispaulosilva-boop/dermapro` (repositório único, branch `main`).
- **Vercel Hobby**: deploy automático no push para `main`. Domínio: `dermapro.vercel.app` (ou variante disponibilizada pela Vercel no deploy).
- **GitHub Releases**: armazenamento do modelo ONNX do Acne (~6 MB), baixado no build ou via fetch no primeiro uso.
- **Custo operacional total**: R$ 0,00/mês.

### 2.3 Estrutura de pastas

```
dermapro/
├── app/
│   ├── layout.tsx                         # layout global (inclui DisclaimerModal de primeiro uso geral)
│   ├── page.tsx                           # HUB — lista os 6 módulos (4 ativos + 2 desativados)
│   ├── sobre/page.tsx                     # Sobre o DermaPro (global)
│   ├── privacidade/page.tsx               # Política de privacidade
│   ├── termos/page.tsx                    # Termos de uso
│   ├── _shared/                           # Biblioteca interna (obrigatoriamente testada)
│   │   ├── ml/
│   │   │   ├── faceLandmarker.ts          # wrapper MediaPipe
│   │   │   ├── roiExtractor.ts            # ROIs faciais base
│   │   │   ├── colorSpace.ts              # RGB ↔ Lab
│   │   │   ├── hsvColorSpace.ts           # RGB ↔ HSV
│   │   │   ├── morphology.ts              # erode, dilate, open, close
│   │   │   ├── clahe.ts                   # Contrast Limited Adaptive Histogram Eq.
│   │   │   ├── connectedComponents.ts     # labeling two-pass
│   │   │   ├── gaussianBlur.ts            # blur 2D separável
│   │   │   ├── hessianMatrix.ts           # derivadas 2ª ordem + autovalores
│   │   │   ├── itaCalculator.ts           # Individual Typology Angle
│   │   │   └── index.ts                   # barrel exports
│   │   ├── qa/
│   │   │   └── imageQuality.ts            # blur/brilho/face única/resolução
│   │   ├── components/
│   │   │   ├── DisclaimerModal.tsx        # modal com props moduleType
│   │   │   ├── UploadCard.tsx             # drag/drop + câmera
│   │   │   ├── UncertaintyBanner.tsx      # avisos contextuais
│   │   │   ├── DownloadPhotoButton.tsx    # NOVO — download de foto/overlay
│   │   │   ├── PresentationModeToggle.tsx # NOVO — modo Apple TV
│   │   │   └── ModuleCard.tsx             # card do hub
│   │   ├── report/
│   │   │   └── pdfExportBase.ts           # helpers comuns de PDF
│   │   ├── design/
│   │   │   ├── tokens.ts                  # design tokens (cores, spacing, tipografia)
│   │   │   └── index.ts
│   │   └── config/
│   │       └── modules.ts                 # registro centralizado de módulos (com flags)
│   ├── acne/                              # Módulo 1 — ATIVO
│   ├── melasma/                           # Módulo 2 — ATIVO
│   ├── textura/                           # Módulo 3 — ATIVO (Poros + Oleosidade)
│   ├── linhas/                            # Módulo 4 — ATIVO (Sinais de Expressão)
│   ├── rosacea/                           # Módulo 5 — DESATIVADO
│   └── estrutura-facial/                  # Módulo 6 — DESATIVADO (FaceMesh)
├── public/
│   ├── models/                            # .onnx, .task (via Releases ou fetch on-demand)
│   └── wasm/                              # runtime do onnxruntime-web
├── docs/                                  # ESTA PASTA (copiada ao repo)
│   ├── 00-MASTER.md                       # este documento
│   ├── 00-PROMPT-INICIAL.md               # prompt para iniciar o projeto
│   ├── 01-FASE-0-DESIGN.md                # Claude Design guide
│   ├── 02-FASE-1-INFRA-BASE.md            # setup + _shared
│   ├── 03-MODULO-ACNE.md
│   ├── 04-MODULO-MELASMA.md
│   ├── 05-MODULO-TEXTURA.md
│   ├── 06-MODULO-SINAIS-EXPRESSAO.md
│   ├── 07-MODULOS-FUTUROS.md              # Rosácea + FaceMesh preparação
│   └── 99-APENDICE-PESQUISA.md            # planos científicos originais
├── .github/
│   └── workflows/                         # CI mínimo (opcional: testes + build)
├── next.config.js
├── tsconfig.json
├── package.json
├── README.md                              # curto, aponta para docs/
├── LICENSE                                # AGPL-3.0 (por causa de Ultralytics YOLOv8)
└── NOTICE                                 # atribuições de modelos/libs de terceiros
```

---

## 3. Registro de Módulos e Feature Flags

### 3.1 Filosofia de flags

Todos os módulos existem fisicamente na pasta (inclusive os desativados), mas o hub só exibe aqueles com `enabled: true`. Módulos desativados têm uma rota mínima que mostra tela "Em desenvolvimento" caso alguém acesse via URL direta.

### 3.2 Arquivo central: `app/_shared/config/modules.ts`

```typescript
export type ModuleConfig = {
  id: string;
  enabled: boolean;
  name: string;               // nome exibido
  description: string;        // descrição no card
  href: string;               // rota
  icon: string;               // nome do ícone (lucide-react)
  order: number;              // ordem no hub
  badge?: 'beta' | 'em-breve' | null;
};

export const MODULES: ModuleConfig[] = [
  {
    id: 'acne',
    enabled: true,
    name: 'Análise de Acne',
    description: 'Detecção e contagem de lesões acneiformes.',
    href: '/acne',
    icon: 'Target',
    order: 1,
    badge: 'beta',
  },
  {
    id: 'melasma',
    enabled: true,
    name: 'Análise de Melasma',
    description: 'Avaliação de hiperpigmentação por região facial.',
    href: '/melasma',
    icon: 'Sun',
    order: 2,
    badge: 'beta',
  },
  {
    id: 'textura',
    enabled: true,
    name: 'Análise de Textura',
    description: 'Poros e oleosidade por região da Zona T.',
    href: '/textura',
    icon: 'Sparkles',
    order: 3,
    badge: 'beta',
  },
  {
    id: 'linhas',
    enabled: true,
    name: 'Análise de Sinais de Expressão',
    description: 'Linhas faciais por região anatômica.',
    href: '/linhas',
    icon: 'LineChart',
    order: 4,
    badge: 'beta',
  },
  {
    id: 'rosacea',
    enabled: false,
    name: 'Análise de Rosácea',
    description: 'Vermelhidão e teleangiectasias.',
    href: '/rosacea',
    icon: 'Flame',
    order: 5,
    badge: 'em-breve',
  },
  {
    id: 'estrutura-facial',
    enabled: false,
    name: 'Análise de Estrutura Facial',
    description: 'Proporções e harmonia via MediaPipe FaceMesh.',
    href: '/estrutura-facial',
    icon: 'Grid3x3',
    order: 6,
    badge: 'em-breve',
  },
];

export const getEnabledModules = () => MODULES.filter(m => m.enabled).sort((a, b) => a.order - b.order);
export const getAllModules = () => [...MODULES].sort((a, b) => a.order - b.order);
export const getModuleById = (id: string) => MODULES.find(m => m.id === id);
```

### 3.3 Hub (`app/page.tsx`) usa esse registro

O hub lê `MODULES`, renderiza card para cada um. Cards com `enabled: false` ficam esmaecidos, com badge "Em breve", e o clique leva para uma tela que apenas explica "módulo em desenvolvimento".

---

## 4. Padrões Transversais

### 4.1 Download de foto (novo requisito)

**Todos** os módulos de análise devem expor, no painel de resultados, um botão `<DownloadPhotoButton />` com as opções:

- **Baixar foto original** (arquivo original que o usuário subiu, sem alterações).
- **Baixar foto anotada** (canvas final com todos os overlays/bboxes/máscaras já desenhados — útil para anexar ao prontuário).
- **Baixar apenas anotações** (PNG transparente só com as marcações — opcional, V2).

Nome sugerido do arquivo: `dermapro-{modulo}-{YYYY-MM-DD-HHMMSS}.{ext}`.

### 4.2 Modo Apresentação (novo requisito)

Pensado para a Apple TV do consultório. Um toggle no canto superior direito de cada tela de resultado que:

- Esconde chrome de navegação (header, menu, footer).
- Amplia painéis principais para ocupar tela cheia.
- Aumenta tipografia em 20%.
- Aumenta contraste dos overlays.
- Atalho de teclado: `P` para alternar.

Componente: `<PresentationModeToggle />` no `_shared/components/`.

### 4.3 Design System (ver Fase 0)

Tokens de design centralizados em `app/_shared/design/tokens.ts`:

- **Paleta**: cores primárias, cores semânticas (info/atenção/sucesso), cores por módulo, cores de overlay.
- **Tipografia**: famílias, tamanhos, pesos, line-heights.
- **Espaçamento**: escala 4px baseada em Tailwind.
- **Sombras, bordas, raios**: consistentes.
- **Tokens específicos de "modo apresentação"**: escalas amplificadas.

Esses tokens serão gerados na Fase 0 usando Claude Design (ver documento `01-FASE-0-DESIGN.md`).

### 4.4 Linguagem (regras absolutas de UI)

Proibido em qualquer string exibida ao usuário:

- "problema", "defeito", "anormal", "danificado".
- "diagnóstico", "doença", "tratamento" (exceto quando redirecionando ao dermato).
- "antienvelhecimento", "envelhecido", "velho" (em strings de UI; ok em docs técnicas).
- Estimativa de idade do paciente a partir da análise.

Preferidos:

- "sinais", "característica", "padrão observado", "marca natural".
- Linguagem descritiva, nunca prescritiva.
- Normalização explícita quando cabível.

Cada módulo tem suas particularidades listadas no documento respectivo.

### 4.5 Licenças e atribuições

- **Código do projeto**: AGPL-3.0 (arquivo `LICENSE` na raiz). Motivo: Ultralytics YOLOv8 é AGPL, e o script de export do modelo de Acne invoca Ultralytics. Para projeto não-comercial/uso próprio, não há impacto prático.
- **Modelo `Tinny-Robot/acne`** (Acne): Apache 2.0. Atribuição em `NOTICE`: Nathaniel Handan, Amina Shiga.
- **MediaPipe** (todos os módulos): Apache 2.0.
- **ONNX Runtime**: MIT.
- **FFHQ-Wrinkle dataset** (se usado em V2 de Sinais de Expressão): CC BY-NC-SA 4.0. Liberado porque DermaPro é **não-comercial, uso próprio** — essa natureza do projeto precisa ser mantida para não violar a licença. Se um dia o projeto monetizar, o dataset precisa ser substituído.

### 4.6 Git e commits

- **Branch única**: `main`. Sem develop, sem feature branches (desenvolvedor solo).
- **Convenção de mensagens**: simples, porém consistente. Padrão sugerido:
  - `feat: <descrição>` para novidades.
  - `fix: <descrição>` para correções.
  - `chore: <descrição>` para infra/config.
  - `docs: <descrição>` para documentação.
  - Sem escopo obrigatório, mas pode usar `feat(acne): ...` quando útil.
- **Frequência**: commit ao final de cada bloco dos prompts. Nunca trabalhar horas sem commitar.
- **.gitignore**: `node_modules/`, `.next/`, `*.onnx` (baixado via release), `.env.local`.

### 4.7 Testes

- **Obrigatório em `app/_shared/`**: cada arquivo de `_shared/ml/` e `_shared/qa/` tem `.test.ts` irmão com cobertura mínima de casos principais.
- **Opcional em módulos**: bem-vindo mas não bloqueia MVP.
- **Framework**: Vitest (mais leve e rápido que Jest com Next.js).
- **Script**: `npm test` roda todos; `npm run test:shared` roda só os críticos.

### 4.8 Renderização de alta qualidade (Apple TV)

Todos os canvases do projeto devem respeitar `devicePixelRatio`:

```typescript
const dpr = window.devicePixelRatio || 1;
canvas.width = logicalWidth * dpr;
canvas.height = logicalHeight * dpr;
canvas.style.width = `${logicalWidth}px`;
canvas.style.height = `${logicalHeight}px`;
ctx.scale(dpr, dpr);
```

Sem isso, a análise fica borrada em TV 4K.

---

## 5. Ordem de Execução e Sessões

### 5.1 Ordem lógica

Decisão: **infra base primeiro, depois módulos em ordem de dependência crescente**. A razão: cada módulo adiciona utilitários ao `_shared/`, então construir na ordem correta evita retrabalho.

**Sequência recomendada**:

1. **Fase 0 — Design System** (Claude Design, não Claude Code): uma sessão curta no Claude Design para gerar tokens, paleta, layouts-chave.
2. **Fase 1 — Infra Base** (Claude Code, sessão 1): Next.js setup, `_shared/` com todos os utilitários que os módulos reutilizam, testes, config de módulos, hub, páginas legais.
3. **Fase 2 — Módulo Acne** (Claude Code, sessão 2): primeiro módulo implementado. Introduz ONNX Runtime e YOLOv8.
4. **Fase 3 — Módulo Melasma** (Claude Code, sessão 3): reusa `_shared`, adiciona `colorSpace` e `itaCalculator` se ainda não tiverem sido criados na Fase 1.
5. **Fase 4 — Módulo Textura** (Claude Code, sessão 4): reusa `_shared`, pode adicionar `clahe`, `connectedComponents`, `hsvColorSpace`.
6. **Fase 5 — Módulo Sinais de Expressão** (Claude Code, sessão 5): reusa `_shared`, adiciona `gaussianBlur` e `hessianMatrix`.
7. **Fase 6 — Módulos Futuros preparados** (Claude Code, sessão 6): cria pastas mínimas de Rosácea e Estrutura Facial com `enabled: false`.

### 5.2 Sessões separadas (decisão do usuário)

Cada fase acima é **uma sessão independente do Claude Code**. Motivos:

- Evita perda de contexto em sessões muito longas.
- Permite validação humana entre fases.
- Facilita rollback se algo der errado.

**Protocolo de início de cada nova sessão do Claude Code**:

```
1. Claude Code abre no diretório /dermapro.
2. Primeiro prompt sempre começa com:
   "Leia docs/00-MASTER.md e docs/0X-FASE-XXX.md antes de prosseguir."
3. Claude Code confirma que leu.
4. Usuário cola o próximo bloco de prompts da fase.
```

### 5.3 Commits durante a execução

Cada bloco de prompts termina com `git add -A && git commit -m "..."`. Usuário acompanha progresso localmente e pode fazer `git log` a qualquer momento.

---

## 6. Logo e Identidade Visual do DermaPro

### 6.1 Sugestão de logo

Proponho um logo conceitual simples que pode ser gerado no Claude Design:

**Conceito**: um **círculo simplificado representando uma face vista de frente**, com uma linha curva sutil (que evoca tanto uma linha de análise quanto um sorriso discreto) e um pequeno ponto (que pode representar um landmark MediaPipe). Tudo em silhueta minimalista, monocromático.

**Tipografia do wordmark**: "DermaPro" em sans-serif geométrica (ex: Inter, DM Sans ou Space Grotesk), peso Semibold. "Derma" e "Pro" com pesos ligeiramente diferentes para destacar a composição da palavra.

**Paleta sugerida (ajustar no Claude Design)**:

- **Primária**: azul-petróleo profundo (`#0F4C5C` ou similar) — transmite profissionalismo clínico sem ser estéril.
- **Secundária**: bege quente (`#F5E6D3`) — acolhimento, pele saudável, não-clínico.
- **Acento**: âmbar suave (`#F4A261`) — destaque em momentos importantes.
- **Semânticas**: verde oliva (info), âmbar-laranja (atenção), vinho suave (alerta mais sério) — **nunca vermelho puro**.
- **Neutros**: cinzas com leve temperatura quente.

Paleta completa e final será gerada na Fase 0 com Claude Design.

### 6.2 Slogan opcional

- "Análise visual da pele em consulta."
- "Precisão ao lado do paciente."
- "Conversa clínica apoiada por visão computacional."

Você escolhe, ou nenhum — o produto também funciona sem slogan.

### 6.3 Tom visual geral

- **Sóbrio**, mas não frio.
- **Clínico**, mas não hospitalar.
- **Moderno**, mas não tech-bro.
- **Acolhedor**, mas não infantilizado.

Referências visuais (para passar ao Claude Design):

- Notion (limpeza tipográfica).
- Linear (sofisticação e sutileza).
- Aesop (apothecary moderno, paleta quente).
- Headspace (acolhimento sem infantilização).
- Interfaces médicas de prontuário eletrônico modernos (ex: Doctoralia, TrustMedic — pela contenção).

---

## 7. Checklist de Decisões Consolidadas

| Decisão | Valor |
|---|---|
| Nome do projeto | DermaPro |
| Repositório | github.com/reispaulosilva-boop/dermapro |
| Hospedagem | Vercel Hobby (`dermapro.vercel.app`) |
| Domínio próprio | Não (usa vercel.app) |
| Modelo ONNX armazenamento | GitHub Releases |
| Branch | main (única) |
| Convenção de commit | `feat:` / `fix:` / `chore:` / `docs:` simples |
| Commits intermediários | Ao final de cada bloco |
| Node.js | lts/iron (v20) |
| Idioma primário | pt-BR apenas |
| Testes obrigatórios | Em `_shared/` |
| Framework de testes | Vitest |
| Sessões do Claude Code | Uma por fase |
| Módulos MVP ativos | Acne, Melasma, Textura, Sinais de Expressão |
| Módulos desativados | Rosácea, Estrutura Facial |
| Estratégia de módulo desativado | Pasta criada + flag `enabled: false` |
| Licença do código | AGPL-3.0 |
| Licença do modelo Acne | Apache 2.0 (herdada de Tinny-Robot) |
| Requisitos novos transversais | Download de foto, Modo apresentação |
| Design System | Gerado na Fase 0 via Claude Design |

---

## 8. Como Proceder a Partir Daqui

### 8.1 Passo a passo completo

1. **Salve todos os arquivos desta pasta `docs/` no seu MacBook**, em um diretório local (ex: `~/Projetos/dermapro-docs/`).
2. **Clone o repositório GitHub**: `git clone https://github.com/reispaulosilva-boop/dermapro.git`.
3. **Copie a pasta `docs/`** para dentro do repositório clonado. Faça um primeiro commit com `docs: adicionar documentação inicial do projeto` e push.
4. **Execute a Fase 0** (Claude Design) — ver `01-FASE-0-DESIGN.md`. Resultado: tokens de design salvos em arquivo.
5. **Abra o Claude Code na raiz do repositório**: `cd dermapro && claude`.
6. **Cole o prompt inicial** de `00-PROMPT-INICIAL.md` no Claude Code. Este é o único prompt que você precisa decorar — ele mobiliza todo o resto.
7. **Siga o Claude Code** através das fases 1 a 6, uma sessão por vez, usando os documentos `02-` a `07-`.

### 8.2 Tempo estimado

Para desenvolvedor acompanhando em tempo parcial:

- Fase 0 (Design): 1-2 dias.
- Fase 1 (Infra base): 3-5 dias úteis.
- Fases 2-5 (Módulos): 8-12 dias úteis cada (total 32-48).
- Fase 6 (Futuros): 1-2 dias.

**Total: 45-70 dias úteis em tempo parcial** (~6-10 semanas calendário).

Tempo integral: 3-4 semanas.

### 8.3 Quando perguntar ao humano

Claude Code deve parar e perguntar sempre que:

- Uma decisão de arquitetura contradiga este documento master.
- Um teste falhe de forma não trivial.
- Uma licença/atribuição não esteja clara.
- Uma calibração de algoritmo precise de validação visual com foto real.

---

## 9. O Que NÃO Está Neste Documento

Este é um documento organizacional. Os detalhes científicos e técnicos de cada módulo estão em documentos dedicados:

- Fundamentação científica, papers, datasets, algoritmos matemáticos: ver `99-APENDICE-PESQUISA.md`.
- Passo a passo de implementação de cada módulo: ver `03-` até `06-`.
- Configuração inicial do Next.js e `_shared/`: ver `02-FASE-1-INFRA-BASE.md`.
- Como usar o Claude Design para gerar o design system: ver `01-FASE-0-DESIGN.md`.

---

*Fim do documento master. Versão 1.0 — 17 de abril de 2026.*
