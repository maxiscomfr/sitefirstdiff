// Espace particuliers : grille des collections, carrousel des portraits, aperçu 3D.
import { $, $$, chargerPhotos, ouvrirVisionneuse, brancherFormulaire, glisser, observer } from './site.js?v=20261023c';
import { COLLECTIONS, PORTRAITS, ORDRE_PORTRAITS } from './donnees.js?v=20261023c';

const fleche = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1v14M1 8h14" stroke="currentColor"/></svg>';

// ---------- collections ----------
const grille = $('#grille-collections');
grille.innerHTML = COLLECTIONS.map((c, i) => `
  <button class="carte-collection revele${i % 3 ? ' revele-d' + (i % 3) : ''}" data-id="${c.id}" aria-label="Voir la collection ${c.nom}">
    <div class="photo" data-photo="${c.image}" data-alt="Cuisine Armony ${c.nom}" data-libelle="Armony ${c.nom}"></div>
    <div class="legende">
      <div><span class="num">${String(i + 1).padStart(2, '0')} — Armony</span><h3>${c.nom}</h3><span class="style">${c.style}</span></div>
      <span class="ouvrir" aria-hidden="true">${fleche}</span>
    </div>
  </button>`).join('');
chargerPhotos(grille);
$$('.revele', grille).forEach(observer);

grille.addEventListener('click', (e) => {
  const b = e.target.closest('.carte-collection'); if (!b) return;
  const c = COLLECTIONS.find((x) => x.id === b.dataset.id);
  const images = [c.image, ...c.portraits.flatMap((p) => PORTRAITS[p].images.slice(0, 3))];
  ouvrirVisionneuse({
    surtitre: 'Collection Armony', titre: c.nom, sousTitre: c.style,
    lignes: [c.accroche, ...(c.portraits.length ? [`Portraits : ${c.portraits.map((p) => PORTRAITS[p].titre.replace('Portrait ', 'n° ')).join(', ')}`] : [])],
    images, lien: `configurateur.html?modele=${c.id}`,
  });
});

// ---------- portraits ----------
const piste = $('#piste-portraits');
piste.innerHTML = ORDRE_PORTRAITS.map((id) => {
  const p = PORTRAITS[id];
  return `<article class="portrait" data-id="${id}" tabindex="0" role="button" aria-label="Ouvrir ${p.titre}">
    <div class="photo" data-photo="${p.images[0]}" data-alt="${p.titre}, cuisine Armony ${p.modeles}" data-libelle="${p.titre}"></div>
    <div class="meta"><h3>${p.titre}</h3><span class="modeles">${p.modeles}</span></div>
    <ul>${p.finitions.slice(0, 3).map((f) => `<li>${f}</li>`).join('')}</ul>
  </article>`;
}).join('');
chargerPhotos(piste);
glisser(piste);
const ouvrirPortrait = (el) => {
  const p = PORTRAITS[el.dataset.id];
  ouvrirVisionneuse({ surtitre: 'Portrait Armony', titre: p.titre, sousTitre: p.modeles, lignes: p.finitions, images: p.images });
};
piste.addEventListener('click', (e) => { const el = e.target.closest('.portrait'); if (el) ouvrirPortrait(el); });
piste.addEventListener('keydown', (e) => { const el = e.target.closest('.portrait'); if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ouvrirPortrait(el); } });
$$('.portraits-nav button').forEach((b) => b.addEventListener('click', () => {
  piste.scrollBy({ left: +b.dataset.dir * piste.clientWidth * 0.8, behavior: 'smooth' });
}));

// ---------- formulaire ----------
brancherFormulaire($('form[name="rappel-particulier"]'));

// ---------- aperçu 3D, chargé seulement quand il devient visible ----------
const mini = $('#mini3d');
const io = new IntersectionObserver(async ([e]) => {
  if (!e.isIntersecting) return;
  io.disconnect();
  try {
    const THREE = await import('three');
    const { RoomEnvironment } = await import('three/addons/RoomEnvironment.js');
    const { construireCuisine, installerStudio } = await import('./cuisine3d.js');
    const r = new THREE.WebGLRenderer({ canvas: mini, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    r.toneMapping = THREE.ACESFilmicToneMapping; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.4;
    scene.fog = new THREE.Fog('#141210', 8, 16);
    const l = installerStudio(scene, { sombre: true, murs: false });
    l.sol.material.color.set('#16130f');
    const cuisine = construireCuisine({ modele: 'yota', implantation: 'ilot', longueur: 4.2, facade: 'talco', accent: 'blu-petrolio', plan: 'calacatta-black', profil: 'or-antique', colonnes: 2, hotte: 'aucune' });
    cuisine.position.z = -1.2;
    scene.add(cuisine);
    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    const taille = () => { const w = mini.clientWidth, h = mini.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    addEventListener('resize', taille); taille();
    let visible = true;
    new IntersectionObserver(([x]) => { visible = x.isIntersecting; }).observe(mini);
    const boucle = (t) => {
      requestAnimationFrame(boucle);
      if (!visible) return;
      const a = t / 9000;
      cam.position.set(Math.sin(a) * 8, 3, Math.cos(a) * 8);
      cam.lookAt(0, 0.9, 0);
      r.render(scene, cam);
    };
    requestAnimationFrame(boucle);
  } catch (err) { console.warn('Aperçu 3D indisponible', err); }
}, { rootMargin: '200px' });
io.observe(mini);
