#!/bin/bash
# Eczane Pro Workspace - Telefonda Başlatma Scripti

cd "$(dirname "$0")/app" || exit 1

IP=$(ip -4 addr show scope global | grep inet | awk '{print $2}' | cut -d/ -f1 | head -n1)
PORT=8080

if [ -z "$IP" ]; then
  IP="127.0.0.1"
fi

URL="http://${IP}:${PORT}"

clear
echo "=========================================================="
echo "⚡ ECZANE PRO WORKSPACE — TELEFONDA AÇMA REHBERİ"
echo "=========================================================="
echo ""
echo "1. Telefonunun, bu bilgisayarla AYNI Wi-Fi ağına bağlı olduğundan emin ol."
echo "2. Telefonunun kamerasını aç ve aşağıdaki QR KODU OKUT:"
echo ""
qrencode -t UTF8 "$URL"
echo ""
echo "Veya telefonunun tarayıcısına (Chrome / Safari) şu adresi yaz:"
echo "👉 $URL"
echo ""
echo "💡 İpucu: Telefondan girdiğinde tarayıcı menüsünden 'Ana Ekrana Ekle'"
echo "   (Add to Home Screen) dersen tam bir mobil uygulama gibi ana ekrana ikon olur!"
echo ""
echo "Durdurmak için Ctrl+C tuşlarına basabilirsin."
echo "=========================================================="
echo ""

python3 -m http.server $PORT --bind 0.0.0.0
