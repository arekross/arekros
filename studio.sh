#!/usr/bin/env bash
# Dermokozmetik ve Takviye — Tek Tıkla Stüdyo Fotoğraf Pipeline'ı
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$DIR/.venv" ]; then
    echo "⚠️ Python sanal ortamı hazırlanıyor..."
    python3 -m venv "$DIR/.venv"
    "$DIR/.venv/bin/pip" install --upgrade pip
    "$DIR/.venv/bin/pip" install "rembg[cpu]" pillow onnxruntime
fi

"$DIR/.venv/bin/python3" "$DIR/tools/studio_pipeline.py" "$@"
