#!/usr/bin/env bash
# ==============================================================================
# arekros GitHub Yükleme & Eşitleme Yardımcısı
# ==============================================================================

set -e

REPO_NAME="arekros"
USERNAME="arekross"
REMOTE_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "=========================================================="
echo "  ◈ arekros — GitHub Otomatik Bağlantı ve Yükleme Aracı"
echo "=========================================================="

# 1. Remote origin kontrolü
if ! git remote | grep -q "origin"; then
    echo "  [+] Git origin ekleniyor: ${REMOTE_URL}"
    git remote add origin "${REMOTE_URL}"
else
    git remote set-url origin "${REMOTE_URL}"
    echo "  [✓] Git remote origin tanımlı: ${REMOTE_URL}"
fi

# 2. GitHub CLI Giriş Kontrolü
if gh auth status &>/dev/null; then
    echo "  [✓] GitHub CLI aktif ve giriş yapılmış."
    # Repo yoksa oluştur
    if ! gh repo view "${USERNAME}/${REPO_NAME}" &>/dev/null; then
        echo "  [+] GitHub'da '${REPO_NAME}' deposu oluşturuluyor (Public)..."
        gh repo create "${USERNAME}/${REPO_NAME}" --public --source=. --remote=origin --push
        echo "  [✓] Başarıyla GitHub'a yüklendi: https://github.com/${USERNAME}/${REPO_NAME}"
        exit 0
    fi
else
    echo ""
    echo "  [!] Tarayıcınızda GitHub açık olduğu için 2 yöntemle hemen bağlayabilirsiniz:"
    echo ""
    echo "  YÖNTEM 1 (En Kolay — Tek Komutla Yetkilendirme):"
    echo "    Terminalde şu komutu yazıp Enter'a basın:"
    echo "      gh auth login -w"
    echo "    (Tarayıcınızda açılan sayfada 1 tıkla 'Authorize' butonuna basın, otomatik bağlanır)"
    echo ""
    echo "  YÖNTEM 2 (Doğrudan Tarayıcıdan):"
    echo "    1. Tarayıcınızda şu linki açın: https://github.com/new?name=${REPO_NAME}"
    echo "    2. 'Create repository' butonuna tıklayın."
    echo "    3. Terminale şunu yazın: git push -u origin main"
    echo "----------------------------------------------------------"
fi

echo ""
echo "  [i] Kodlar yüklenmeye çalışılıyor..."
git push -u origin main || true
