"""
Converte o modelo Tinny-Robot/acne (YOLOv8n, Apache 2.0, autores: Nathaniel Handan + Amina Shiga)
de PyTorch (.pt) para ONNX (.onnx) para uso no navegador via ONNX Runtime Web.

Uso:
    source scripts/.venv/bin/activate
    python scripts/convert-acne-model.py

Saída esperada: scripts/output/acne-yolov8n.onnx (~6 MB)
"""
import os
import shutil

OUTPUT_DIR = "scripts/output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Baixando pesos PyTorch do Hugging Face...")
from huggingface_hub import hf_hub_download
pt_path = hf_hub_download(repo_id="Tinny-Robot/acne", filename="best.pt", local_dir=OUTPUT_DIR)
print(f"Baixado: {pt_path}")

print("Carregando modelo com Ultralytics...")
from ultralytics import YOLO
model = YOLO(pt_path)
print(f"Classes: {model.names}")
print(f"Imgsz: {model.args.get('imgsz', 640)}")

print("Exportando para ONNX (opset=12, simplify=True, imgsz=640, dynamic=False)...")
onnx_path = model.export(format="onnx", opset=12, simplify=True, dynamic=False, imgsz=640)
print(f"ONNX gerado: {onnx_path}")

target = os.path.join(OUTPUT_DIR, "acne-yolov8n.onnx")
shutil.copy(onnx_path, target)
size_mb = os.path.getsize(target) / (1024 * 1024)
print(f"\nArquivo final: {target}")
print(f"Tamanho: {size_mb:.2f} MB")

if size_mb < 2 or size_mb > 20:
    print(f"AVISO: tamanho fora do esperado (~6 MB). Verifique se o modelo baixou corretamente.")
else:
    print("Tamanho dentro do esperado. Conversão concluída com sucesso.")

print("\nPróximo passo: siga scripts/convert-acne-model.md — seção 'Validação' e 'Upload como GitHub Release'.")
