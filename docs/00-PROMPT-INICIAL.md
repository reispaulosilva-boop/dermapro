# Prompt Inicial — Para colar no Claude Code na primeira sessão

**Use este prompt UMA vez** para iniciar o projeto DermaPro no Claude Code. Ele faz o onboarding completo: Claude Code lê o master, entende o escopo, valida o ambiente e te devolve o plano de execução.

---

## Instruções para você (humano)

1. Abra o terminal no seu MacBook M1.
2. Clone o repositório (se ainda não clonou):
   ```bash
   git clone https://github.com/reispaulosilva-boop/dermapro.git
   cd dermapro
   ```
3. Copie toda esta pasta `docs/` para dentro do repositório clonado (se ainda não copiou).
4. Se estiver começando do zero, o repo deve estar vazio além de `.git/` e `docs/`. Se tiver outros arquivos de inicializações antigas, mova para `.arquivo/` ou remova — o Claude Code vai criar tudo do zero.
5. Inicie o Claude Code na raiz do repo:
   ```bash
   claude
   ```
6. Cole o prompt abaixo integralmente.

---

## Prompt a colar (copie tudo entre as linhas)

---

```
Você está no diretório raiz do projeto DermaPro — uma aplicação Next.js 14+ de análise visual da pele para uso em consultório dermatológico. Não escreva código nem execute comandos de modificação ainda. Primeiro faça o onboarding abaixo, em ordem.

PASSO 1 — Leia os seguintes documentos na pasta docs/, nesta ordem exata, e resuma cada um em 2-3 linhas:
1. docs/00-MASTER.md
2. docs/01-FASE-0-DESIGN.md (leitura rápida — você não vai executar esta fase, ela é feita fora do Claude Code)
3. docs/02-FASE-1-INFRA-BASE.md

Os demais documentos (03-MODULO-ACNE.md, 04-MODULO-MELASMA.md, 05-MODULO-TEXTURA.md, 06-MODULO-SINAIS-EXPRESSAO.md, 07-MODULOS-FUTUROS.md) serão lidos em suas respectivas sessões futuras. NÃO os leia agora.

PASSO 2 — Verifique o estado atual do projeto:
1. Execute `ls -la` e me mostre o que há no diretório.
2. Confirme que a pasta docs/ existe e contém os arquivos citados.
3. Verifique se há package.json (não deveria haver ainda — é projeto do zero).
4. Verifique a versão do Node (`node --version`). Precisamos v20.x (lts/iron). Se for diferente, ALERTE antes de prosseguir.
5. Confirme o remote git (`git remote -v`). Deve apontar para github.com/reispaulosilva-boop/dermapro.

PASSO 3 — Me devolva um relatório com:
- Resumo do propósito do projeto (conforme 00-MASTER).
- Os 4 módulos ativos + 2 desativados listados.
- Os requisitos transversais obrigatórios (download de foto, modo apresentação, testes em _shared/, linguagem neutra, commit ao final de cada bloco).
- Stack confirmada.
- Qualquer inconsistência ou dúvida que você identificou nos documentos.
- Status do ambiente (node version, git remote, estado do diretório).
- Confirmação de que você está pronto para iniciar a Fase 1 (Infra Base) quando eu colar os prompts dela.

PASSO 4 — Aguarde. Não execute NENHUMA modificação no sistema de arquivos nem no git ainda. Apenas leia, analise e reporte.

Após meu "ok", começaremos a Fase 1 colando os blocos de prompts de docs/02-FASE-1-INFRA-BASE.md, um por vez.

Lembretes operacionais globais, válidos para todas as fases futuras:
- Ao final de cada bloco de prompts, Claude Code executa `git add -A && git commit -m "..."` com mensagem clara no padrão feat/fix/chore/docs.
- Jamais avance para um próximo bloco sem eu autorizar.
- Se algo parecer contradizer 00-MASTER.md, pergunte antes de agir.
- Se um teste falhar de forma não trivial, pergunte.
- Linguagem da UI sempre em pt-BR e respeitando as regras de termos proibidos do master (seção 4.4).
- Todo código novo em _shared/ deve ter arquivo de teste irmão (Vitest).
- Canvas sempre respeitando devicePixelRatio.

Comece pelo Passo 1.
```

---

## Fim do prompt

Depois desse primeiro turno, o Claude Code vai te devolver o relatório. Você valida, responde "ok, pode começar a Fase 1" e cola os blocos de `02-FASE-1-INFRA-BASE.md`.

**Para as sessões seguintes (Fases 2 a 6)**, o prompt inicial é mais curto, porque o contexto básico já está nos docs. Use algo como:

```
Você está no projeto DermaPro. Leia docs/00-MASTER.md e docs/0X-MODULO-XXX.md (substitua X). Resuma o escopo deste módulo, verifique que os módulos anteriores estão funcionando (npm run build + npm run dev passando), e aguarde os blocos de prompts que vou colar.
```

---

*Fim. Versão 1.0 — 17 de abril de 2026.*
