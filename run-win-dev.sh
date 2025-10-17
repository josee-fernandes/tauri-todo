#!/usr/bin/env bash

set -e

# 1️⃣ Descobre IP do WSL
IP=$(hostname -I | awk '{print $1}')
DEV_URL="http://$IP:5173"

echo "🟢 Iniciando frontend..."
pnpm run dev -- --host 0.0.0.0 &

# 2️⃣ Compila o backend Windows (dentro de src-tauri)
echo "🟣 Compilando backend (target Windows)..."
cd src-tauri
cargo xwin build --target x86_64-pc-windows-msvc
cd ..

# 3️⃣ Localiza o executável gerado
EXE_DIR="$(pwd)/src-tauri/target/x86_64-pc-windows-msvc/debug"
EXE_FILE=$(find "$EXE_DIR" -maxdepth 1 -type f -name "*.exe" | head -n 1)

if [ -z "$EXE_FILE" ]; then
  echo "❌ Nenhum executável encontrado em $EXE_DIR"
  exit 1
fi

EXE_PATH_WIN="$(wslpath -w "$EXE_FILE")"

# 4️⃣ Abre o app no Windows
echo "🚀 Iniciando app Windows em modo dev..."
powershell.exe -Command "set TAURI_DEV_SERVER_URL=$DEV_URL; Start-Process '$EXE_PATH_WIN'"
