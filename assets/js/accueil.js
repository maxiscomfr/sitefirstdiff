// Accueil : la cuisine Armony en 3D sur ordinateur et tablette. Sur téléphone (ou en mode économie de données),
// des images fixes de la même scène, en fondu, pour un affichage immédiat sans charger la 3D.
const IMAGES = [
  ['Portrait 01 · System + Yota', 'Polaris Midnight · Noce Elegante · Onyx White'],
  ['Portrait 12 · Yota', 'Ambra · Noce Elegante · Travertino Bianco'],
  ['Portrait 27 · Skyline + Riga', 'Blu Petrolio · Noce Elegante · Pietra Grey'],
  ['Portrait 05 · Kappa + Rho', 'Satin Brass · Olmo Naturale · Taj Mahal'],
  ['Portrait 13 · Yota', 'Talco · Blu Petrolio · Calacatta Black'],
  ['Portrait 18 · Rho', 'X-Black Matt · Noce Elegante · Smoke Stone'],
];
const q = new URLSearchParams(location.search);
const leger = q.get('capture') == null && (matchMedia('(max-width: 760px)').matches || navigator.connection?.saveData);

if (!leger) {
  import('./portail.js?v=20261023c');
} else {
  const fond = document.createElement('div');
  fond.className = 'portail-fixe';
  fond.setAttribute('aria-hidden', 'true');
  fond.innerHTML = IMAGES.map((_, i) => `<img src="assets/img/accueil/portrait-${i}.jpg" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`).join('');
  document.getElementById('scene3d').replaceWith(fond);
  const imgs = fond.querySelectorAll('img');
  const etiquette = document.querySelector('.finition-courante');
  let i = 0;
  const montrer = () => {
    imgs.forEach((img, k) => img.classList.toggle('visible', k === i));
    if (etiquette) etiquette.innerHTML = `${IMAGES[i][0]}<b>${IMAGES[i][1]}</b>`;
  };
  montrer();
  document.body.classList.add('scene-prete');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { i = (i + 1) % IMAGES.length; montrer(); }, 7000);
}
