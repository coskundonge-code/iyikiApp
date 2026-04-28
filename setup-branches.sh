#!/bin/bash
# iyikiApp - Git Branch Yapısı Kurulum Scripti
# =============================================
# Bu script şu yapıyı kurar:
#   main     → Canlı (production)
#   develop  → Test ortamı
#   coskun   → Coskun'un geliştirme branch'i
#   onur     → Onur'un geliştirme branch'i
#
# Kullanım: cd iyikiApp && bash setup-branches.sh

set -e

echo "🚀 iyikiApp Branch Yapısı Kuruluyor..."
echo ""

# 1. Lock dosyalarını temizle (varsa)
echo "📋 Lock dosyaları temizleniyor..."
find .git -name "*.lock" -delete 2>/dev/null || true

# 2. Mevcut değişiklikleri coskun branch'inde commit et
echo "💾 Mevcut değişiklikler coskun branch'ine commit ediliyor..."
git checkout coskun 2>/dev/null || git checkout -b coskun
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "chore: save work-in-progress before branch restructuring"
    echo "   ✅ Değişiklikler commit edildi"
else
    echo "   ℹ️  Commit edilecek değişiklik yok"
fi

# 3. master → main (rename)
echo ""
echo "🔄 master branch'i main olarak yeniden adlandırılıyor..."
git checkout master
git branch -m master main
git push origin main 2>/dev/null || echo "   ⚠️  main push edilemedi, elle push edin: git push origin main"
git push origin --delete master 2>/dev/null || echo "   ⚠️  Remote master silinemedi, GitHub'dan elle silebilirsiniz"

# 4. GitHub'da default branch'i main olarak ayarla
echo ""
echo "⚙️  GitHub'da default branch'i main olarak ayarlayın:"
echo "   → https://github.com/coskundonge-code/iyikiApp/settings → Default branch → main"
echo ""

# 5. develop branch'ini main'den oluştur
echo "🌿 develop branch'i oluşturuluyor (main'den)..."
git checkout main
git checkout -b develop 2>/dev/null || git checkout develop
git push -u origin develop 2>/dev/null || echo "   ⚠️  develop push edilemedi"
echo "   ✅ develop branch hazır"

# 6. onur branch'ini develop'dan oluştur
echo ""
echo "🌿 onur branch'i oluşturuluyor (develop'dan)..."
git checkout develop
git checkout -b onur 2>/dev/null || git checkout onur
git push -u origin onur 2>/dev/null || echo "   ⚠️  onur push edilemedi"
echo "   ✅ onur branch hazır"

# 7. coskun branch'ini develop ile güncelle
echo ""
echo "🌿 coskun branch'i güncelleniyor..."
git checkout coskun
git push -u origin coskun 2>/dev/null || echo "   ⚠️  coskun push edilemedi"
echo "   ✅ coskun branch hazır"

# 8. develop'a geri dön
git checkout develop

echo ""
echo "============================================"
echo "✅ Branch yapısı kuruldu!"
echo "============================================"
echo ""
echo "📊 Branch Yapısı:"
echo ""
echo "   main (canlı/production)"
echo "    └── develop (test)"
echo "         ├── coskun (Coskun'un branch'i)"
echo "         └── onur (Onur'un branch'i)"
echo ""
echo "📌 Çalışma Akışı:"
echo "   1. Kendi branch'inde çalış (coskun veya onur)"
echo "   2. Hazır olunca develop'a merge et → test et"
echo "   3. Her şey OK ise develop → main merge → canlıya al"
echo ""
echo "🔧 Sık Kullanılacak Komutlar:"
echo ""
echo "   # Coskun'un günlük akışı:"
echo "   git checkout coskun"
echo "   git merge develop          # develop'taki güncellemeleri al"
echo "   # ... çalış, commit et ..."
echo "   git checkout develop"
echo "   git merge coskun           # çalışmanı develop'a aktar"
echo "   git push origin develop"
echo ""
echo "   # Canlıya alma:"
echo "   git checkout main"
echo "   git merge develop"
echo "   git push origin main"
echo ""
