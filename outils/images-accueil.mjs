// Fabrique les images fixes de l'accueil pour téléphones (assets/img/accueil/portrait-N.jpg)
// à partir de la scène 3D du portail. Prérequis : le site servi en local sur le port 8765
// (python3 -m http.server 8765) et playwright-core ; CHROME = chemin d'un Chromium.
//   node outils/images-accueil.mjs
import { chromium } from 'playwright-core';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 414, height: 896 }, deviceScaleFactor: 2.6 });
for (let n = 0; n < 6; n++) {
  await p.goto(`http://localhost:8765/index.html?capture=${n}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const data = await p.evaluate(() => document.getElementById('scene3d').toDataURL('image/jpeg', 0.8));
  writeFileSync(`assets/img/accueil/portrait-${n}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
  console.log('portrait', n, await p.textContent('.finition-courante'));
}
await b.close();
