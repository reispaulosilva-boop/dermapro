# Conversão do Modelo Acne: PyTorch → ONNX

**Modelo fonte:** `Tinny-Robot/acne` (Hugging Face)
**Variante:** YOLOv8m (medium, 25.8M parâmetros) — maior precisão que nano, especialmente em lesões pequenas
**Tamanho do .onnx:** ~99 MB
**Licença:** Apache 2.0
**Autores:** Nathaniel Handan + Amina Shiga
**Atribuição:** registrada em `NOTICE` na raiz do repositório

> **Nota sobre tamanho:** o modelo é maior que o inicialmente previsto (~6 MB nano → ~99 MB medium).
> O usuário verá download mais longo na primeira análise (~5–30 s em banda larga, ~30–60 s em 4G).
> O Service Worker cacheia o modelo após o primeiro download — usos subsequentes são instantâneos.

Este script baixa os pesos PyTorch originais localmente, converte para ONNX e **não redistribui os pesos `.pt` originais**. O arquivo `.onnx` resultante é publicado como GitHub Release do projeto DermaPro, mantendo a atribuição conforme a Apache 2.0.

---

## Pré-requisitos

- Python 3.10 ou superior (`python3 --version`)
- pip atualizado (`pip install --upgrade pip`)
- Conexão à internet (~200 MB para Ultralytics + ~25 MB para pesos)
- Estar na raiz do repositório (`~/Projetos/dermapro`)

---

## Passo a passo

### 1. Criar ambiente virtual

```bash
cd ~/Projetos/dermapro
python3 -m venv scripts/.venv
source scripts/.venv/bin/activate
```

### 2. Instalar dependências

```bash
pip install ultralytics huggingface_hub onnx onnxsim
```

Tempo esperado: 3–8 minutos (Ultralytics ~200 MB).

### 3. Rodar o script de conversão

```bash
python scripts/convert-acne-model.py
```

Saída esperada no terminal:
```
Baixando pesos PyTorch do Hugging Face...
Baixado: scripts/output/acne.pt
Carregando modelo com Ultralytics...
Classes: {0: 'lesao_acneiforme'}   ← nome pode variar; registre o nome real
Imgsz: 640
Exportando para ONNX (opset=12, simplify=True, imgsz=640, dynamic=False)...
ONNX gerado: scripts/output/acne.onnx
Arquivo final: scripts/output/acne-yolov8m.onnx
Tamanho: ~99.XX MB
Conversão concluída com sucesso.
```

Tempo esperado: 2–5 minutos.

---

## Validação do arquivo gerado

Verifique que `scripts/output/acne-yolov8m.onnx` existe e tem entre 50–200 MB (esperado ~99 MB):

```bash
ls -lh scripts/output/acne-yolov8m.onnx
```

Teste de inferência com imagem dummy (opcional mas recomendado):

```bash
python - <<'EOF'
import onnxruntime as ort
import numpy as np

session = ort.InferenceSession("scripts/output/acne-yolov8m.onnx")
inp = session.get_inputs()[0]
print(f"Input name: {inp.name}, shape: {inp.shape}, type: {inp.type}")

dummy = np.random.rand(1, 3, 640, 640).astype(np.float32)
outputs = session.run(None, {inp.name: dummy})
print(f"Output shape: {outputs[0].shape}")
print("Inferência de validação OK.")
EOF
```

Saída esperada do output shape: `(1, 5, 8400)` — confirma que é YOLOv8n single-class com 8400 anchors.

**Registre aqui o nome real da classe** (campo `Classes:` no terminal) para atualizar `app/_shared/config/models.ts` se diferir de `lesao_acneiforme`.

---

## Upload como GitHub Release

### Opção 1 — Via gh CLI (recomendado)

```bash
gh release create v0.2.0-acne-model \
  scripts/output/acne-yolov8m.onnx \
  --title "Modelo Acne YOLOv8m v0.2.0" \
  --notes "Modelo ONNX derivado de Tinny-Robot/acne (Apache 2.0, Nathaniel Handan + Amina Shiga). YOLOv8m single-class ('lesao_acneiforme'), input 640x640, exportado com opset 12. Tamanho: ~99 MB."
```

### Opção 2 — Via navegador

1. Abra <https://github.com/reispaulosilva-boop/dermapro/releases/new>
2. **Choose a tag:** digite `v0.2.0-acne-model` e clique "Create new tag"
3. **Release title:** `Modelo Acne YOLOv8m v0.2.0`
4. **Description:** cole o texto do `--notes` acima
5. **Attach binaries:** arraste `scripts/output/acne-yolov8m.onnx`
6. Clique **Publish release**

> **Atenção:** o arquivo tem ~99 MB. O upload via navegador pode levar 1–3 minutos dependendo da conexão. Aguarde a confirmação "Release published" antes de fechar.

### Verificação após upload

```bash
curl -sI "https://github.com/reispaulosilva-boop/dermapro/releases/download/v0.2.0-acne-model/acne-yolov8m.onnx" | head -5
```

Deve retornar `HTTP/2 302` (redirect do GitHub) ou `200 OK`. Se retornar `404`, verifique o nome da tag e o nome do arquivo no release.

---

## Se a conversão falhar (Cenário B)

Erros comuns e soluções:

| Erro | Solução |
|------|---------|
| `No module named 'ultralytics'` | Confirme que o venv está ativo (`source scripts/.venv/bin/activate`) |
| `Repository not found` (Hugging Face) | Confirme que `Tinny-Robot/acne` ainda existe; tente `hf_hub_download(..., token=None)` |
| `onnxsim` falha no simplify | Rode sem simplify: troque `simplify=True` por `simplify=False` no script |
| Modelo corrompido / tamanho < 1 MB | Apague `scripts/output/best.pt` e rode novamente |
| Python < 3.10 | `pyenv install 3.11 && pyenv local 3.11` |

Se nenhuma dessas soluções funcionar, **reporte ao Claude Code** — seguiremos para o **Bloco 1B** (stub simulado), que permite desenvolver toda a UI sem o modelo real.

---

## Deactivar o ambiente ao terminar

```bash
deactivate
```

O diretório `scripts/.venv/` e `scripts/output/` estão no `.gitignore` e não serão commitados.
