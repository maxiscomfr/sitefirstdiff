#!/usr/bin/env bash
# Copie sur le site les photos Armony aujourd'hui chargées depuis armonycucine.it,
# puis bascule le site sur ces copies locales. À lancer depuis la racine du site :
#   bash outils/telecharger-photos-armony.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/img/armony
# Liste complète des images via Node (aucune dépendance)
node --input-type=module -e "
const m = await import(process.cwd() + '/assets/js/donnees.js');
const s = new Set([...m.COLLECTIONS.map(c => c.image), ...Object.values(m.PORTRAITS).flatMap(p => p.images),
  '2017/05/Portrait27-SKYLINE-YOTA-RIGA-1-WEB.webp', '2017/05/Portrait04-Rho-Jit-0-WEB.webp']);
console.log([...s].join('\n'));
" > /tmp/firstdiff-photos.txt
ok=0; ko=0
while read -r p; do
  [ -z "$p" ] && continue
  f="assets/img/armony/$(basename "$p")"
  if [ -s "$f" ] || curl -fsSL "https://www.armonycucine.it/wp-content/uploads/$p" -o "$f"; then ok=$((ok+1)); else ko=$((ko+1)); rm -f "$f"; echo "Échec : $p"; fi
done < /tmp/firstdiff-photos.txt
echo "$ok photos copiées, $ko échecs."
if [ "$ok" -gt 0 ]; then
  sed -i.bak 's/export const PHOTOS_LOCALES = false;/export const PHOTOS_LOCALES = true;/' assets/js/donnees.js && rm -f assets/js/donnees.js.bak
  echo "Le site utilise maintenant les copies locales (assets/img/armony/)."
fi
