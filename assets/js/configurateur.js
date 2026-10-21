// Configurateur 3D : l'utilisateur compose sa cuisine, la composition part chez FirstDiff pour chiffrage.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { $, $$, brancherFormulaire } from './site.js';
import { construireCuisine, installerStudio, Materiaux, MODELES, FACADES, PLANS, PROFILS, IMPLANTATIONS, CONFIG_DEFAUT } from './cuisine3d.js';

const HOTTES = { plafond: { nom: 'Plafond', note: 'Au-dessus de l’îlot' }, murale: { nom: 'Murale', note: 'Sur le mur' }, aucune: { nom: 'Aucune', note: 'Hotte intégrée au plan' } };
const CLES = Object.keys(CONFIG_DEFAUT);

// ---------- état : URL > dernière session > défaut ----------
function lireEtat() {
  const q = new URLSearchParams(location.search);
  let memo = {};
  try { memo = JSON.parse(localStorage.getItem('firstdiff-config') || '{}'); } catch { /* stockage indisponible */ }
  const cfg = { ...CONFIG_DEFAUT, ...memo };
  for (const k of CLES) {
    if (!q.has(k)) continue;
    const v = q.get(k); const d = CONFIG_DEFAUT[k];
    cfg[k] = typeof d === 'boolean' ? v === '1' : typeof d === 'number' ? +v : v;
  }
  if (!MODELES[cfg.modele]) cfg.modele = 'yota';
  return cfg;
}
const cfg = lireEtat();
const memoriser = () => { try { localStorage.setItem('firstdiff-config', JSON.stringify(cfg)); } catch { /* rien */ } };
const lienPartage = () => {
  const q = new URLSearchParams();
  for (const k of CLES) q.set(k, typeof cfg[k] === 'boolean' ? (cfg[k] ? '1' : '0') : cfg[k]);
  return `${location.origin}${location.pathname}?${q}`;
};

// ---------- scène ----------
const canvas = $('#config3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d9d4cb');
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
scene.fog = new THREE.Fog('#d9d4cb', 14, 30);
installerStudio(scene, { sombre: false, murs: true });

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
const controles = new OrbitControls(camera, canvas);
controles.enableDamping = true; controles.dampingFactor = 0.08;
controles.minDistance = 3; controles.maxDistance = 16;
controles.maxPolarAngle = Math.PI * 0.49; controles.minPolarAngle = 0.15;
controles.target.set(0, 0.9, 1.2);

const mats = new Materiaux();
let cuisine = null;
let besoinRendu = true;
function reconstruire() {
  if (cuisine) {
    scene.remove(cuisine);
    cuisine.traverse((o) => { if (o.geometry && o.geometry.type !== 'BoxGeometry') o.geometry.dispose(); });
  }
  cuisine = construireCuisine({ ...cfg, murLateral: true }, mats);
  scene.add(cuisine);
  besoinRendu = true;
}

function taille() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix(); besoinRendu = true;
}
new ResizeObserver(taille).observe(canvas);

// points de vue, animés
let anim = null;
function vue(nom, instant = false) {
  const L = cfg.longueur; const recul = Math.max(1, L / 4.2) * (camera.aspect < 1.3 ? 1.55 : 1);
  const ilot = cfg.implantation.includes('ilot');
  const vues = {
    ensemble: { pos: [-3.4 * recul, 3.1, 7.6 * recul], cible: [0, 0.9, ilot ? 1.2 : 0.4] },
    face: { pos: [0, 1.6, 7.8 * recul], cible: [0, 1.1, 0.6] },
    ilot: { pos: [-2.6, 1.9, 5.6], cible: [0, 0.9, 2.1] },
    haut: { pos: [0.3, 8.5 * recul, 4.6], cible: [0, 0, 1.4] },
  };
  const v = vues[nom] || vues.ensemble;
  const fin = { pos: new THREE.Vector3(...v.pos), cible: new THREE.Vector3(...v.cible) };
  if (instant) { camera.position.copy(fin.pos); controles.target.copy(fin.cible); controles.update(); besoinRendu = true; return; }
  anim = { t0: performance.now(), d: 1100, de: { pos: camera.position.clone(), cible: controles.target.clone() }, fin };
}
$$('[data-vue]').forEach((b) => b.addEventListener('click', () => vue(b.dataset.vue)));
controles.addEventListener('change', () => { besoinRendu = true; });

function boucle(t) {
  requestAnimationFrame(boucle);
  if (anim) {
    const k = Math.min(1, (t - anim.t0) / anim.d); const e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(anim.de.pos, anim.fin.pos, e);
    controles.target.lerpVectors(anim.de.cible, anim.fin.cible, e);
    if (k === 1) anim = null;
    besoinRendu = true;
  }
  if (controles.update()) besoinRendu = true;
  if (besoinRendu) { renderer.render(scene, camera); besoinRendu = false; }
}

// ---------- panneau d'options ----------
function options(conteneur, dict, cle, rendu) {
  const el = $(conteneur);
  el.innerHTML = Object.entries(dict).map(([id, o]) => rendu(id, o)).join('');
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    cfg[cle] = b.dataset.v; maj();
  });
}
const opt = (id, o) => `<button class="opt" data-v="${id}"><b>${o.nom}</b><small>${o.note}</small></button>`;
const teinte = (classe) => (id, o) => {
  const fond = o.couleur || o.fond;
  const veine = o.veine && o.type !== 'uni' ? `background-image: linear-gradient(115deg, transparent 40%, ${o.veine} 42%, transparent 46%, transparent 70%, ${o.veine}99 71%, transparent 73%);` : '';
  return `<button class="teinte ${classe}${o.bois ? ' bois' : ''}" data-v="${id}" style="background-color:${fond};${veine}" aria-label="${o.nom}, ${o.famille || ''}" title="${o.nom}"></button>`;
};
options('#opt-modele', MODELES, 'modele', opt);
options('#opt-implantation', IMPLANTATIONS, 'implantation', opt);
options('#opt-hotte', HOTTES, 'hotte', opt);
options('#nu-facade', FACADES, 'facade', teinte(''));
options('#nu-accent', FACADES, 'accent', teinte(''));
options('#nu-plan', PLANS, 'plan', teinte('plan'));
options('#nu-profil', PROFILS, 'profil', teinte(''));

const longueur = $('#longueur'), colonnes = $('#colonnes');
longueur.addEventListener('input', () => { cfg.longueur = +longueur.value; maj(); });
colonnes.addEventListener('input', () => { cfg.colonnes = +colonnes.value; maj(); });
for (const k of ['hauts', 'bar', 'cascade', 'suspensions']) $('#' + k).addEventListener('change', (e) => { cfg[k] = e.target.checked; maj(); });

const fmt = (m) => m.toFixed(2).replace('.', ',') + ' m';
function lignesRecap() {
  const ilot = cfg.implantation.includes('ilot');
  return [
    ['Modèle', `Armony ${MODELES[cfg.modele].nom}`],
    ['Implantation', IMPLANTATIONS[cfg.implantation].nom],
    ['Mur principal', fmt(cfg.longueur)],
    ['Façades', `${FACADES[cfg.facade].nom} (${FACADES[cfg.facade].famille})`],
    ['Accent', `${FACADES[cfg.accent].nom} (${FACADES[cfg.accent].famille})`],
    ['Plan de travail', `${PLANS[cfg.plan].nom} (${PLANS[cfg.plan].famille})`],
    ['Profilés', PROFILS[cfg.profil].nom],
    ['Colonnes', cfg.colonnes ? `${cfg.colonnes}, dont four` : 'Aucune'],
    ['Meubles hauts', cfg.hauts ? 'Oui' : 'Non'],
    ...(ilot ? [['Îlot', [cfg.bar && 'coin repas', cfg.cascade && 'plan en cascade', cfg.suspensions && 'suspensions'].filter(Boolean).join(', ') || 'simple']] : []),
    ['Hotte', HOTTES[cfg.hotte].nom],
  ];
}

function maj() {
  const ilot = cfg.implantation.includes('ilot');
  if (!ilot && cfg.hotte === 'plafond') cfg.hotte = 'murale';
  $$('[data-v]').forEach((b) => {
    const cle = { 'opt-modele': 'modele', 'opt-implantation': 'implantation', 'opt-hotte': 'hotte', 'nu-facade': 'facade', 'nu-accent': 'accent', 'nu-plan': 'plan', 'nu-profil': 'profil' }[b.parentElement.id];
    b.setAttribute('aria-pressed', cfg[cle] === b.dataset.v);
  });
  $('#opt-hotte [data-v="plafond"]').disabled = !ilot;
  $('#opt-hotte [data-v="plafond"]').style.opacity = ilot ? 1 : 0.35;
  longueur.value = cfg.longueur; $('#val-longueur').textContent = fmt(cfg.longueur);
  colonnes.value = cfg.colonnes; $('#val-colonnes').textContent = cfg.colonnes ? `${cfg.colonnes} colonne${cfg.colonnes > 1 ? 's' : ''}` : 'Aucune';
  for (const k of ['hauts', 'bar', 'cascade', 'suspensions']) { $('#' + k).checked = cfg[k]; $('#' + k).disabled = !ilot && k !== 'hauts'; }
  const nom = (d, k) => `<b>${d[cfg[k]].nom}</b> — ${d[cfg[k]].famille}`;
  $('#nom-facade').innerHTML = nom(FACADES, 'facade');
  $('#nom-accent').innerHTML = nom(FACADES, 'accent');
  $('#nom-plan').innerHTML = nom(PLANS, 'plan');
  $('#nom-profil').innerHTML = `<b>${PROFILS[cfg.profil].nom}</b>`;
  $('#nom-modele').textContent = MODELES[cfg.modele].nom;
  $('#sous-modele').textContent = `${IMPLANTATIONS[cfg.implantation].nom} · ${FACADES[cfg.facade].nom} & ${FACADES[cfg.accent].nom}`;
  $('#recap').innerHTML = lignesRecap().map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join('');
  memoriser();
  reconstruire();
}

// ---------- étapes ----------
let etape = 0;
function aller(n) {
  etape = Math.max(0, Math.min(4, n));
  $$('.onglets button').forEach((b, i) => b.setAttribute('aria-selected', i === etape));
  $$('.panneau').forEach((p, i) => p.classList.toggle('actif', i === etape));
  $('#etape-txt').textContent = `Étape ${etape + 1} / 5`;
  $('#prec').style.visibility = etape ? 'visible' : 'hidden';
  $('#suiv').style.visibility = etape < 4 ? 'visible' : 'hidden';
  $('.panneaux').scrollTop = 0;
  if (etape === 4 && matchMedia('(max-width: 900px)').matches) $('.config-panneau').scrollIntoView({ behavior: 'smooth' });
}
$$('.onglets button').forEach((b) => b.addEventListener('click', () => aller(+b.dataset.onglet)));
$('#prec').addEventListener('click', () => aller(etape - 1));
$('#suiv').addEventListener('click', () => aller(etape + 1));

// ---------- envoi ----------
function capture() {
  renderer.render(scene, camera);
  return new Promise((ok) => canvas.toBlob((b) => ok(b), 'image/jpeg', 0.86));
}
brancherFormulaire($('form[name="configuration-cuisine"]'), {
  avant: async () => {
    const extra = {
      configuration: lignesRecap().map(([a, b]) => `${a} : ${b}`).join('\n'),
      lien_3d: lienPartage(),
    };
    const image = await capture();
    if (image) extra.apercu = image;
    return extra;
  },
});

// ---------- démarrage ----------
maj();
vue('ensemble', true);
aller(0);
requestAnimationFrame(boucle);
