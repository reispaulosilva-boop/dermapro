# scripts/

Scripts utilitários para o projeto DermaPro. Nenhum deles é executado em produção — são ferramentas de desenvolvimento e preparação de assets.

## Arquivos rastreados no git

| Arquivo | Propósito |
|---------|-----------|
| `convert-acne-model.md` | Guia passo a passo para converter o modelo acne de PyTorch para ONNX |
| `convert-acne-model.py` | Script Python de download + conversão (Hugging Face → ONNX) |
| `README.md` | Este arquivo |

## Arquivos NÃO rastreados (`.gitignore`)

| Padrão | Conteúdo |
|--------|----------|
| `.venv/` | Ambiente virtual Python criado localmente |
| `output/` | Arquivos gerados (`.pt`, `.onnx`) — publicados via GitHub Releases |

## Como usar

Para converter o modelo acne, siga `convert-acne-model.md`.
