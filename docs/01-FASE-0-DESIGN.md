# Fase 0 — Design System no Claude Design

**Propósito:** usar o Claude Design (produto novo da Anthropic, disponível no seu plano Pro) para gerar o design system completo do DermaPro antes de qualquer linha de código. O resultado entra em `app/_shared/design/tokens.ts` e orienta toda a estética subsequente.

**Executor:** você (humano), no Claude Design. Não é feito no Claude Code.

**Tempo estimado:** 1-2 sessões de 30-60 min.

---

## 1. Por que essa fase existe

A estética do DermaPro não é decorativa — é funcional. A interface será vista em Apple TV em consultório médico, a alguns metros de distância, durante conversa com o paciente. Cores, tipografia, hierarquia e contraste afetam diretamente a qualidade da consulta.

Gerar o design system primeiro, antes do Claude Code implementar, traz:

- Coesão visual entre os 4 módulos desde o dia 1.
- Menos retrabalho de CSS durante a implementação.
- Tokens reutilizáveis (o Claude Code referencia `tokens.ts` ao criar componentes).
- Linguagem visual consistente com a linguagem verbal neutra que definimos.

---

## 2. Antes de abrir o Claude Design

Tenha em mente estas restrições e preferências:

### Restrições duras

- **Uso em consultório**, tela espelhada em Apple TV.
- **Paciente presente na tela** — linguagem e cores precisam acolher, nunca alarmar.
- **Proibido vermelho intenso** em qualquer sinalização de estado (mesmo "grave" ou "marcante"). Usar âmbar-vinho suave no máximo.
- **Tipografia legível a distância**: nenhuma fonte com peso 300 ou menor em texto importante.
- **Contraste AA+ em todos os pares texto/fundo** (WCAG).
- **Sem emojis em produção** (exceto em legendas ilustrativas bem controladas).
- **Sem ilustrações caricatas** — registro sério, mas não frio.

### Preferências de tom visual

- Sóbrio, mas não frio.
- Clínico, mas não hospitalar.
- Moderno, mas não "tech bro".
- Acolhedor, mas não infantilizado.

### Referências de inspiração (passar ao Claude Design)

- Notion (limpeza tipográfica).
- Linear (sofisticação e sutileza).
- Aesop (apothecary moderno, paleta quente).
- Headspace (acolhimento profissional).
- Prontuários médicos modernos (TrustMedic, Doctoralia).

---

## 3. Prompt recomendado para o Claude Design

Cole no Claude Design (no Claude na web, via botão "Design" ou pela interface dedicada, dependendo do rollout no seu plano):

---

```
Estou criando o design system de um produto chamado DermaPro.

Contexto:
- Aplicação web Next.js de análise visual da pele.
- Usada em consultório dermatológico durante a consulta.
- A tela é espelhada em Apple TV — o paciente e o médico veem juntos.
- Tem 4 módulos principais: Acne, Melasma, Textura (poros e oleosidade), Sinais de Expressão.
- Mais 2 módulos preparados mas desativados por enquanto: Rosácea, Estrutura Facial.

O que preciso gerar:

1. PALETA COMPLETA:
   - Primária (profissional clínica, sóbria mas não fria) — azul-petróleo profundo é minha hipótese, mas estou aberto.
   - Secundária (acolhedora) — bege quente é minha hipótese.
   - Acento (destaque sutil) — âmbar suave.
   - Semânticas: info, sucesso, atenção, alerta — SEM vermelho intenso. Pode usar verde oliva, âmbar-laranja, vinho suave, azul info.
   - Neutros: escala de cinzas com leve temperatura quente.
   - Cores por módulo: quatro tons distintos mas harmônicos entre si (um para cada módulo ativo). Esses tons serão usados como "identidade visual" de cada card no hub.
   - Cores para overlays de análise: cor para "bounding box de lesão acneica", cor para "área com hiperpigmentação", cor para "área com brilho", cor para "linhas detectadas" — sempre semitransparentes e não agressivas.

2. TIPOGRAFIA:
   - Uma família principal (sans serif geométrica, humanista). Sugiro Inter, DM Sans ou Space Grotesk. Escolha uma.
   - Escala modular: H1, H2, H3, body, small, caption. Otimizada para leitura a distância em TV mas também funcionar bem em laptop.
   - Pesos usados: Regular, Medium, Semibold (sem Light ou Extra Light).

3. ESPAÇAMENTO E GEOMETRIA:
   - Escala 4px / 8px compatível com Tailwind.
   - Bordas arredondadas: raio padrão (sugiro 8-12px — nada de bordas quadradas ríspidas, nem bolhas infantis).
   - Sombras: sutis, com blur generoso e opacidade baixa.

4. COMPONENTES-CHAVE (mockups visuais):
   a) Hub: tela principal com 6 cards de módulos (4 ativos, 2 com badge "Em breve" esmaecidos). Grid responsivo.
   b) Página de módulo de análise: header com título, área de upload de foto, área de resultado com imagem + overlays + painel de métricas.
   c) Modal de disclaimer de primeiro uso.
   d) Badge de classificação (ex: "Severidade: Leve" / "Sinais Suaves" / "Perfil: Pele Mista").
   e) Gráfico de distribuição por região (barras horizontais com cores do módulo).
   f) Painel de resultado em "Modo apresentação" (fullscreen, tipografia amplificada).
   g) Botão de download de foto (primário e secundário).

5. LOGO:
   - Nome: DermaPro.
   - Conceito: círculo representando rosto visto de frente + linha curva sutil (análise + sorriso discreto) + pequeno ponto (landmark MediaPipe).
   - Silhueta minimalista, monocromática. Deve funcionar em fundo claro e escuro.
   - Wordmark com tipografia escolhida acima, com "Derma" e "Pro" em pesos ligeiramente diferentes.

6. TOM GERAL A SEGUIR:
   - Sóbrio, não frio.
   - Clínico, não hospitalar.
   - Moderno, não tech bro.
   - Acolhedor, não infantilizado.

Referências de inspiração: Notion, Linear, Aesop, Headspace, interfaces de prontuário eletrônico moderno.

Restrições fortes:
- Proibido vermelho intenso em qualquer sinalização.
- Tipografia legível a distância em TV.
- WCAG AA+ em todos os pares texto/fundo.
- Sem emojis em produção.

Gere uma primeira versão do design system completo, com mockups das telas-chave listadas. Depois vou refinar via conversa.
```

---

## 4. Como iterar

Depois da primeira versão gerada pelo Claude Design, iteração em 2-4 rodadas:

### Rodada 1 — Paleta e tipografia
- Ajuste cores que soarem frias ou agressivas.
- Confirme que a tipografia escolhida tem pesos completos disponíveis no Google Fonts ou equivalente (para ser importada no projeto).
- Teste um texto curto em cada nível tipográfico.

### Rodada 2 — Componentes principais
- Hub (6 cards).
- Tela de módulo (antes e depois do upload).
- Modal de disclaimer.

### Rodada 3 — Estados e overlays
- Como uma bounding box de lesão acneica aparece sobre a foto.
- Como áreas de brilho/oleosidade aparecem.
- Como linhas faciais são destacadas.
- Verificar que todos os overlays mantêm legibilidade da foto subjacente.

### Rodada 4 — Modo apresentação e logo
- Como a tela de resultado fica em "Modo Apresentação" (fullscreen).
- Versões do logo: lockup horizontal, símbolo isolado, versão reversa (fundo escuro).

---

## 5. Entregáveis dessa Fase

Ao final, você deve ter em mãos (baixados do Claude Design):

1. **Arquivo de design tokens em JSON ou TypeScript** (o Claude Design exporta — se não, use o próprio Claude na interface de chat para gerar). Será a base do `app/_shared/design/tokens.ts`.
2. **Mockups exportados em PNG/SVG** das telas-chave (hub, módulo, modal, modo apresentação).
3. **Logo em SVG** (símbolo + wordmark + versões).
4. **Paleta em formato hex com nomes semânticos**.
5. **Um arquivo `DESIGN_SYSTEM.md`** que você cria manualmente, resumindo as decisões tomadas (útil para o Claude Code consultar).

### Onde salvar

Crie uma pasta `design/` **dentro do repositório**, na raiz (ao lado de `docs/`):

```
dermapro/
├── design/
│   ├── DESIGN_SYSTEM.md             # resumo das decisões
│   ├── tokens.ts                    # copiado de Claude Design
│   ├── logo/
│   │   ├── logo-horizontal.svg
│   │   ├── logo-mark.svg
│   │   └── logo-reverse.svg
│   ├── mockups/
│   │   ├── hub.png
│   │   ├── modulo-acne-resultado.png
│   │   ├── modal-disclaimer.png
│   │   └── modo-apresentacao.png
│   └── palette.txt
├── docs/
└── ...
```

O Claude Code na Fase 1 vai ler esses arquivos e importar os tokens para `app/_shared/design/tokens.ts`.

---

## 6. Handoff para o Claude Code

Na Fase 1, no primeiro prompt relevante, você instrui o Claude Code a ler `design/DESIGN_SYSTEM.md` e `design/tokens.ts` antes de gerar componentes base. O Claude Code respeita automaticamente a paleta, tipografia e espaçamento definidos.

---

## 7. Se o Claude Design não estiver disponível

Se por algum motivo o Claude Design ainda não tiver chegado na sua conta (rollout gradual), Plano B:

1. Use o Claude normal no chat com Artifacts habilitado.
2. Peça um design system em formato de Artifact HTML/React que renderize todos os tokens, paleta e mockups de componentes.
3. O resultado fica menos rico do que o Claude Design (sem sliders de refinamento, sem export nativo), mas é 80% tão útil para nosso caso.

---

*Fim da Fase 0. Versão 1.0 — 17 de abril de 2026.*
