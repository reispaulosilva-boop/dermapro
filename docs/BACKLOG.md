# Backlog DermaPro

Itens fora do escopo do MVP, a revisitar depois que a Fase 1 e os 4 módulos ativos estiverem funcionando.

## Visual
- Light mode / toggle dark-light: gerar versão light no Claude Design, implementar toggle no dropdown Ajustes, testar em consultório real. Prioridade: média.


## Módulos
- Módulo Rosácea (enabled: false no MVP): implementação completa.
- Módulo Estrutura Facial via MediaPipe FaceMesh (enabled: false no MVP): implementação completa.

## Calibração futura

- **Thresholds de QA por câmera**: `QA_BLUR_ERROR=40` e `QA_BLUR_WARN=80` foram calibrados com uma foto de consultório real (iPhone HEIC→JPG, pele oleosa, blur score 64.7 — passaria como warning). Com mais amostras reais (diferentes câmeras, iluminações, fototipos), refinar os valores. Prioridade: média, após uso real em consultório.
- **Calibração de brilho por fototipo**: `QA_BRIGHT_MIN=30` pode ser muito permissivo para fotos noturnas; `QA_BRIGHT_MAX=230` pode rejeitar levemente fotos com flash. Revisar com dados reais.
- **Score de blur adapativo por região**: calcular nitidez somente na ROI facial central (excluindo fundo) para evitar falsos negativos em fotos com fundo desfocado.

## Performance futura
- Reintroduzir WebGPU como opcional quando onnxruntime-web tiver patch para o bug de shader compilation em Apple Silicon.

## Funcionalidades
- Relatório combinado: PDF único agregando os 4 módulos quando rodados na mesma sessão.
- Histórico longitudinal com IndexedDB: acompanhar paciente entre consultas.
- Modo dinâmico vs estático (linhas): duas fotos para diferenciar rugas de expressão vs permanentes.
