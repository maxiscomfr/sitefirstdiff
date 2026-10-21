// Configurateur : le visiteur dessine sa pièce (cotes, forme, portes et fenêtres), y pose ses meubles Armony
// avec les finitions du catalogue 2026, puis envoie sa composition à FirstDiff pour chiffrage.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { $, $$, brancherFormulaire } from './site.js?v=20261021d';
import { FINITIONS } from './finitions.js?v=20261021d';
import { FIN, MODELES, POIGNEES, TEINTES_POIGNEE, FAMILLES_PLAN, MEUBLES, FAMILLES_MEUBLES, ALIAS, PROFONDEUR,
  HAUTEURS_COLONNE, Materiaux, construireMeuble, emprise, vertical, accentParDefaut } from './meubles3d.js?v=20261021d';
import { FORMES, OUVERTURES, PIECE_DEFAUT, contour, murs, projeter, surMur, dedans, coins, recouvrement,
  empriseOuverture } from './piece.js?v=20261021d';

const QUART = Math.PI / 2;
const DEFAUT = { modele: 'yota', facade: 'laccato-micalizzato--talco', accent: 'noce--noce', plan: 'gres--pietra-grey',
  poignee: 'gorge', teinte: 'noir', ...PIECE_DEFAUT };
const fmt = (m) => m.toFixed(2).replace('.', ',') + ' m';
const cm = (l) => Math.round(l * 100) + ' cm';
const deg = (r) => Math.round((r * 180) / Math.PI);

// ---------- état : URL > dernière session > défaut ----------
let cfg = { ...DEFAUT };
let meubles = [];
let ouvertures = [];
let compteur = 0;
const nouvelId = () => 'm' + (++compteur);

function encoderMeubles() {
  return meubles.map((m) => [m.type, m.x.toFixed(2), m.z.toFixed(2), deg(m.r), m.accent ? 1 : 0].join('~')).join('_');
}
function decoderMeubles(s, enDegres) {
  return s.split('_').filter(Boolean).map((t) => {
    let [type, x, z, r, a] = t.split('~');
    type = ALIAS[type] || type;
    // les anciens liens notaient la rotation en quarts de tour
    const angle = enDegres ? (+r * Math.PI) / 180 : +r * QUART;
    return MEUBLES[type] ? { id: nouvelId(), type, x: +x, z: +z, r: angle, accent: a === '1' } : null;
  }).filter(Boolean);
}
const encoderOuvertures = () => ouvertures.map((o) => [o.type, o.mur, o.t.toFixed(2), o.l.toFixed(2), o.h.toFixed(2), o.y.toFixed(2)].join('~')).join('_');
const decoderOuvertures = (s) => s.split('_').filter(Boolean).map((t) => {
  const [type, mur, ...v] = t.split('~'); const [tt, l, h, y] = v.map(Number);
  return OUVERTURES[type] ? { id: nouvelId(), type, mur: +mur, t: tt, l, h, y } : null;
}).filter(Boolean);

function lireEtat() {
  const q = new URLSearchParams(location.search);
  let memo = null;
  try { memo = JSON.parse(localStorage.getItem('firstdiff-config-v3') || 'null'); } catch { /* stockage indisponible */ }
  if (memo?.cfg) cfg = { ...cfg, ...memo.cfg };
  for (const k of Object.keys(DEFAUT)) if (q.has(k)) cfg[k] = typeof DEFAUT[k] === 'number' ? +q.get(k) : q.get(k);
  if (q.has('m')) meubles = decoderMeubles(q.get('m'), q.has('v3'));
  else if (memo?.m != null) meubles = decoderMeubles(memo.m, true);
  else meubles = null;
  if (q.has('o')) ouvertures = decoderOuvertures(q.get('o'));
  else if (memo?.o != null) ouvertures = decoderOuvertures(memo.o);
  if (!MODELES[cfg.modele]) cfg.modele = 'yota';
  if (!FORMES[cfg.forme]) cfg.forme = 'rect';
  for (const k of ['facade', 'accent', 'plan']) if (!FIN[cfg[k]]) cfg[k] = DEFAUT[k];
}
lireEtat();
const memoriser = () => { try { localStorage.setItem('firstdiff-config-v3', JSON.stringify({ cfg, m: encoderMeubles(), o: encoderOuvertures() })); } catch { /* rien */ } };
const lienPartage = () => {
  const q = new URLSearchParams(Object.entries(cfg).map(([k, v]) => [k, String(v)]));
  q.set('m', encoderMeubles()); q.set('o', encoderOuvertures()); q.set('v3', '1');
  return `${location.origin}${location.pathname}?${q}`;
};

let MURS = murs(cfg);
let CONTOUR = contour(cfg);
const boiteSol = () => {
  const xs = CONTOUR.map((p) => p[0]), zs = CONTOUR.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
};

// ---------- scène ----------
const canvas = $('#config3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d9d4cb');
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.8;
scene.add(new THREE.HemisphereLight('#fffaf2', '#8f8a82', 0.55));
// lumière du jour venant d'une fenêtre à gauche, plus douce en face
const soleil = new THREE.DirectionalLight('#fff1dc', 2.2);
soleil.position.set(-4, 6, 6); soleil.castShadow = true;
const appoint = new THREE.DirectionalLight('#e8eef5', 0.45); appoint.position.set(5, 4, 8); scene.add(appoint);
soleil.shadow.mapSize.set(2048, 2048);
Object.assign(soleil.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.02;
scene.add(soleil, soleil.target);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
const controles = new OrbitControls(camera, canvas);
controles.enableDamping = true; controles.dampingFactor = 0.08;
controles.minDistance = 2; controles.maxDistance = 20; controles.maxPolarAngle = Math.PI * 0.495;

// occlusion ambiante (ombres de contact entre meubles, murs et sol) sur ordinateur et tablette
const composer = matchMedia('(max-width: 760px)').matches ? null : new EffectComposer(renderer);
if (composer) {
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, 1, 1);
  ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.1 });
  ao.blendIntensity = 0.85;
  composer.addPass(ao);
  composer.addPass(new OutputPass());
}
const dessiner = () => (composer ? composer.render() : renderer.render(scene, camera));

let besoinRendu = true;
const rendre = () => { besoinRendu = true; };
const mats = new Materiaux(rendre);

// ---------- la pièce : sol, murs percés des portes et fenêtres ----------
const piece = new THREE.Group(); scene.add(piece);
// la grille n'apparaît qu'en vue de dessus et pendant qu'on déplace un meuble
let vueCourante = 'perspective';
let glisse = null;
const grilleVisible = () => vueCourante === 'dessus' || !!glisse?.bouge;
const majGrille = () => { if (piece.userData.grille) piece.userData.grille.visible = grilleVisible(); rendre(); };

const MAT_MUR = new THREE.MeshStandardMaterial({ color: '#ebe6dd', roughness: 0.95 });
const MAT_PLINTHE = new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.6 });
const MAT_MENUISERIE = new THREE.MeshStandardMaterial({ color: '#f4f2ee', roughness: 0.45 });
const MAT_PORTE = new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 0.5 });
const MAT_VITRE = new THREE.MeshPhysicalMaterial({ color: '#dfe9ee', roughness: 0.04, transparent: true, opacity: 0.25, depthWrite: false });
const MAT_JOUR = new THREE.MeshBasicMaterial({ color: '#f6f3ec' });
const EP_MUR = 0.16;

const groupesMurs = [];
function construirePiece() {
  piece.clear(); groupesMurs.length = 0;
  MURS = murs(cfg); CONTOUR = contour(cfg);
  const H = cfg.H; const bb = boiteSol();
  // sol taillé selon le contour
  const forme = new THREE.Shape(CONTOUR.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geoSol = new THREE.ShapeGeometry(forme);
  const sol = new THREE.Mesh(geoSol, matSol());
  sol.rotation.x = -QUART; sol.receiveShadow = true;
  const dehors = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#d9d4cb', roughness: 1 }));
  dehors.rotation.x = -QUART; dehors.position.y = -0.003;
  const tailleG = Math.ceil(Math.max(bb.x1 - bb.x0, bb.z1 - bb.z0) / 0.5) * 0.5 + 1;
  const n = Math.round(tailleG / 0.5);
  const grille = new THREE.GridHelper(n * 0.5, n, '#b4ac9e', '#bfb8ab');
  grille.material.transparent = true; grille.material.opacity = 0.35;
  grille.position.set(Math.round((bb.x0 + bb.x1) / 2 * 2) / 2, 0.002, Math.round((bb.z0 + bb.z1) / 2 * 2) / 2);
  grille.material.clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -bb.x0), new THREE.Plane(new THREE.Vector3(-1, 0, 0), bb.x1),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -bb.z0), new THREE.Plane(new THREE.Vector3(0, 0, -1), bb.z1),
  ];
  grille.visible = grilleVisible(); piece.userData.grille = grille;
  piece.add(dehors, sol, grille);

  for (const mur of MURS) {
    // repère du mur : x le long du mur, y vers le haut, z vers l'intérieur de la pièce
    const g = new THREE.Group();
    const base = new THREE.Matrix4().makeBasis(new THREE.Vector3(mur.dir.x, 0, mur.dir.z), new THREE.Vector3(0, 1, 0), new THREE.Vector3(mur.n.x, 0, mur.n.z));
    g.quaternion.setFromRotationMatrix(base); g.position.set(mur.a.x, 0, mur.a.z);
    const trous = ouvertures.filter((o) => o.mur === mur.i);
    const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(mur.len, 0), new THREE.Vector2(mur.len, H), new THREE.Vector2(0, H)]);
    for (const o of trous) {
      const x0 = Math.max(0.02, o.t - o.l / 2), x1 = Math.min(mur.len - 0.02, o.t + o.l / 2), y0 = Math.max(0.001, o.y), y1 = Math.min(H - 0.02, o.y + o.h);
      s.holes.push(new THREE.Path([new THREE.Vector2(x0, y0), new THREE.Vector2(x1, y0), new THREE.Vector2(x1, y1), new THREE.Vector2(x0, y1)]));
    }
    const paroi = new THREE.Mesh(new THREE.ShapeGeometry(s), MAT_MUR); paroi.receiveShadow = true; g.add(paroi);
    // plinthe, interrompue au droit des portes
    const segments = []; let debut = 0;
    for (const o of trous.filter((x) => x.y < 0.08).sort((a, b) => a.t - b.t)) { segments.push([debut, o.t - o.l / 2]); debut = o.t + o.l / 2; }
    segments.push([debut, mur.len]);
    for (const [a, b] of segments) {
      if (b - a < 0.02) continue;
      const p = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.08, 0.012), MAT_PLINTHE); p.position.set((a + b) / 2, 0.04, 0.006); g.add(p);
    }
    for (const o of trous) g.add(menuiserie(o));
    piece.add(g); groupesMurs.push({ g, mur });
  }
  soleil.target.position.set((bb.x0 + bb.x1) / 2, 0, (bb.z0 + bb.z1) / 2);
  rendre();
}

// Ébrasement, cadre et vitrage ou porte, dessinés dans le repère du mur
function menuiserie(o) {
  const g = new THREE.Group(); const x = o.t, y0 = o.y, y1 = o.y + o.h, l = o.l, f = 0.05;
  const plaque = (w, h, d, px, py, pz, m = MAT_MENUISERIE) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(px, py, pz); b.castShadow = true; b.receiveShadow = true; g.add(b); };
  // épaisseur du mur dans l'ouverture
  plaque(l, 0.01, EP_MUR, x, y1, -EP_MUR / 2, MAT_MUR);
  if (y0 > 0.01) plaque(l, 0.01, EP_MUR, x, y0, -EP_MUR / 2, MAT_MUR);
  for (const s of [-1, 1]) plaque(0.01, o.h, EP_MUR, x + s * l / 2, (y0 + y1) / 2, -EP_MUR / 2, MAT_MUR);
  // lumière du jour derrière
  const jour = new THREE.Mesh(new THREE.PlaneGeometry(l, o.h), o.type === 'porte' ? MAT_PORTE : MAT_JOUR);
  jour.position.set(x, (y0 + y1) / 2, -EP_MUR); g.add(jour);
  // cadre
  plaque(l + 2 * f, f, 0.03, x, y1 + f / 2, 0.012);
  for (const s of [-1, 1]) plaque(f, o.h + f, 0.03, x + s * (l / 2 + f / 2), (y0 + y1 + f) / 2, 0.012);
  if (o.type === 'porte') {
    plaque(l - 0.01, o.h - 0.01, 0.04, x, (y0 + y1) / 2, -0.05, MAT_PORTE);
    plaque(0.14, 0.02, 0.05, x + l / 2 - 0.12, 1.02, -0.02, mats.fixe('inox'));
  } else {
    if (y0 > 0.01) plaque(l + 0.06, 0.03, 0.2, x, y0 - 0.015, 0.05, MAT_MENUISERIE);
    const nb = l > 1.4 ? 3 : 2; const w = l / nb;
    for (let i = 0; i < nb; i++) {
      const cx = x - l / 2 + w * (i + 0.5);
      plaque(0.05, o.h, 0.06, cx - w / 2 + 0.025, (y0 + y1) / 2, -0.07);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, o.h - 0.1), MAT_VITRE); v.position.set(cx, (y0 + y1) / 2, -0.07); g.add(v);
    }
    plaque(l, 0.05, 0.06, x, y1 - 0.025, -0.07); plaque(l, 0.05, 0.06, x, y0 + 0.025, -0.07);
  }
  return g;
}

// parquet chêne clair dessiné à la volée : lames de 18 cm, nuances et fil du bois
let texParquet = null;
function matSol() {
  if (!texParquet) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024;
    const g = c.getContext('2d'); const lames = 8, lg = 1024 / lames;
    let graine = 7; const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < lames; i++) {
      let y = -alea() * 1024;
      while (y < 1024) {
        const h = 380 + alea() * 420, t = 0.9 + alea() * 0.16;
        g.fillStyle = `rgb(${Math.round(196 * t)},${Math.round(170 * t)},${Math.round(134 * t)})`;
        g.fillRect(i * lg, y, lg, h);
        for (let k = 0; k < 26; k++) {
          g.strokeStyle = `rgba(110,80,50,${0.04 + alea() * 0.07})`; g.lineWidth = 0.6 + alea() * 1.4;
          const x = i * lg + alea() * lg; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 6 * (alea() - 0.5), y + h / 3, x + 6 * (alea() - 0.5), y + h * 2 / 3, x, y + h); g.stroke();
        }
        g.fillStyle = 'rgba(60,40,25,.35)'; g.fillRect(i * lg, y, lg, 2); g.fillRect(i * lg, y, 1.5, h);
        y += h;
      }
    }
    texParquet = new THREE.CanvasTexture(c);
    texParquet.colorSpace = THREE.SRGBColorSpace; texParquet.wrapS = texParquet.wrapT = THREE.RepeatWrapping;
    texParquet.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texParquet.repeat.set(1 / 1.44, 1 / 1.44);
  }
  // les UV du sol sont en mètres : une image couvre 1,44 m
  return new THREE.MeshStandardMaterial({ map: texParquet, roughness: 0.55, bumpMap: texParquet, bumpScale: 0.3 });
}

// ---------- meubles dans la scène ----------
const groupes = new Map();
const calqueMeubles = new THREE.Group(); scene.add(calqueMeubles);
let selection = null;
const surligne = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats.fixe('selection'));
surligne.visible = false; surligne.renderOrder = 2; scene.add(surligne);
const conflits = new THREE.Group(); scene.add(conflits);
const GEO_CONFLIT = new THREE.BoxGeometry(1, 1, 1);

const def = (m) => MEUBLES[m.type];
const libre = (m) => ['ilot', 'table'].includes(def(m).type);
const plage = (m) => vertical(def(m), cfg.hc);
const chevauchentEnHauteur = (a, b) => Math.min(a[1], b[1]) - Math.max(a[0], b[0]) > 0.02;
const rect = (m) => coins(emprise(m.type), m.x, m.z, m.r);

function poser(m) {
  let g = groupes.get(m.id);
  if (!g) { g = construireMeuble(m, cfg, mats); g.userData.id = m.id; groupes.set(m.id, g); calqueMeubles.add(g); }
  g.position.set(m.x, 0, m.z); g.rotation.y = m.r;
}
function oublier(id) {
  const g = groupes.get(id); if (!g) return;
  calqueMeubles.remove(g); groupes.delete(id);
  g.traverse((o) => { if (o.geometry && o.geometry.type !== 'BoxGeometry') o.geometry.dispose(); });
}
function reconstruire() {
  for (const id of [...groupes.keys()]) oublier(id);
  meubles.forEach(poser);
  majSelection(); majConflits(); rendre();
}

// boîte orientée qui entoure un meuble (sélection, conflits)
function boiteOrientee(mesh, m, marge = 0.02) {
  const e = emprise(m.type); const [y0, y1] = plage(m);
  const cx = (e.x0 + e.x1) / 2, cz = (e.z0 + e.z1) / 2, c = Math.cos(m.r), s = Math.sin(m.r);
  mesh.scale.set(e.x1 - e.x0 + marge, y1 - y0 + marge, e.z1 - e.z0 + marge);
  mesh.position.set(m.x + cx * c + cz * s, (y0 + y1) / 2, m.z - cx * s + cz * c);
  mesh.rotation.set(0, m.r, 0);
}

function majSelection() {
  const m = meubles.find((x) => x.id === selection);
  $('#selection').hidden = !m;
  surligne.visible = !!m;
  if (m) {
    boiteOrientee(surligne, m, 0.04);
    $('#sel-nom').textContent = `${def(m).nom} · ${cm(def(m).l)}`;
    $('#sel-finition').textContent = m.accent ? 'Principale' : 'Accent';
    $('#sel-finition').title = m.accent ? 'Passer en finition principale' : 'Passer en finition d’accent';
  }
  $$('#liste-meubles li').forEach((li) => li.classList.toggle('choisi', li.dataset.id === selection));
  rendre();
}

// Meubles qui se chevauchent, ou qui gênent une porte ou une fenêtre : surlignés en rouge
function majConflits() {
  conflits.clear();
  const genants = new Set();
  const R = meubles.map(rect);
  for (let i = 0; i < meubles.length; i++) for (let j = i + 1; j < meubles.length; j++) {
    const a = meubles[i], b = meubles[j];
    if (!chevauchentEnHauteur(plage(a), plage(b))) continue;
    if (recouvrement(R[i], R[j]) > 0.02) { genants.add(a); genants.add(b); }
  }
  for (const o of ouvertures) {
    const e = empriseOuverture(o, MURS); if (!e) continue;
    meubles.forEach((m, i) => { if (chevauchentEnHauteur(plage(m), [e.y0, e.y1]) && recouvrement(R[i], e.coins) > 0.02) genants.add(m); });
  }
  for (const m of genants) { const box = new THREE.Mesh(GEO_CONFLIT, mats.fixe('conflit')); boiteOrientee(box, m, 0.03); conflits.add(box); }
  const n = genants.size;
  $('#alerte-conflits').hidden = !n;
  $('#alerte-conflits').textContent = n ? `${n} meuble${n > 1 ? 's se chevauchent ou gênent' : ' chevauche ou gêne'} une ouverture` : '';
}

// Aimantation : contre le mur le plus proche, puis bord à bord avec les voisins du même mur.
function placer(m, x, z) {
  const d = def(m); const l = d.l;
  if (!libre(m)) {
    let mieux = null;
    for (const mur of MURS) {
      const p = projeter(mur, x, z);
      if (p.cote > -0.3 && (!mieux || p.dist < mieux.p.dist)) mieux = { mur, p };
    }
    if (mieux && mieux.p.dist < 0.6 && mieux.mur.len >= l) {
      const { mur } = mieux;
      let t = Math.min(mur.len - l / 2, Math.max(l / 2, mieux.p.t));
      m.r = mur.r;
      // voisins sur le même mur dont la hauteur croise la sienne
      let meilleur = 0.1, cible = null;
      for (const o of meubles) {
        if (o === m || libre(o) || !chevauchentEnHauteur(plage(o), plage(m))) continue;
        const po = projeter(mur, o.x, o.z);
        if (po.dist > 0.01 || Math.abs(Math.sin(o.r - m.r)) > 0.01 || Math.cos(o.r - m.r) < 0) continue;
        const ol = def(o).l;
        for (const c of [po.t + ol / 2 + l / 2, po.t - ol / 2 - l / 2]) if (Math.abs(c - t) < meilleur) { meilleur = Math.abs(c - t); cible = c; }
      }
      // dans un angle : se caler juste après la profondeur des meubles du mur voisin
      if (cible == null && Math.abs(t - l / 2 - 0.6) < 0.1) cible = 0.6 + l / 2;
      if (cible == null && Math.abs(mur.len - t - l / 2 - 0.6) < 0.1) cible = mur.len - 0.6 - l / 2;
      if (cible != null && cible >= l / 2 - 0.001 && cible <= mur.len - l / 2 + 0.001) t = cible;
      ({ x, z } = surMur(mur, t));
    } else {
      [x, z] = garderDedans(m, x, z);
    }
  } else {
    [x, z] = garderDedans(m, x, z);
  }
  m.x = Math.round(x * 100) / 100; m.z = Math.round(z * 100) / 100;
}
// ramène le meuble dans la pièce s'il en sort
function garderDedans(m, x, z) {
  for (let k = 0; k < 8; k++) {
    const dehors = coins(emprise(m.type), x, z, m.r).filter(([px, pz]) => !dedans(CONTOUR, px, pz));
    if (!dehors.length) break;
    let pire = null;
    for (const [px, pz] of dehors) for (const mur of MURS) {
      const p = projeter(mur, px, pz);
      if (p.cote < 0 && p.t > -0.01 && p.t < mur.len + 0.01 && (!pire || p.cote < pire.c)) pire = { c: p.cote, n: mur.n };
    }
    if (!pire) break;
    x -= pire.n.x * (pire.c - 0.005); z -= pire.n.z * (pire.c - 0.005);
  }
  return [x, z];
}

// Première place libre le long des murs pour un nouveau meuble
function placeLibre(m) {
  const d = def(m);
  if (libre(m)) { m.r = 0; placeDegagee(m); return; }
  for (const { i } of MURS) {
    const mur = MURS[i];
    const occupe = meubles.filter((o) => o !== m && !libre(o) && chevauchentEnHauteur(plage(o), plage(m)))
      .map((o) => ({ o, p: projeter(mur, o.x, o.z) })).filter(({ o, p }) => p.dist < 0.01 && Math.abs(o.r - mur.r) < 0.01)
      .map(({ o, p }) => [p.t - def(o).l / 2, p.t + def(o).l / 2]);
    // les ouvertures du mur sont aussi des places prises (sauf fenêtre au-dessus d'un meuble bas)
    for (const o of ouvertures) if (o.mur === i && chevauchentEnHauteur(plage(m), [o.y, o.y + o.h])) occupe.push([o.t - o.l / 2, o.t + o.l / 2]);
    occupe.sort((a, b) => a[0] - b[0]);
    let c = i === 0 ? 0 : 0.6;
    for (const [a, b] of occupe) { if (a - c >= d.l - 0.001) break; c = Math.max(c, b); }
    if (c + d.l <= mur.len - (i === 0 ? 0 : 0.6) + 0.001) { Object.assign(m, surMur(mur, c + d.l / 2), { r: mur.r }); return; }
  }
  const bb = boiteSol(); m.r = 0; placer(m, (bb.x0 + bb.x1) / 2, (bb.z0 + bb.z1) * 0.6);
}

// Pour un îlot ou une table : la place la plus centrale qui ne touche aucun autre meuble
function placeDegagee(m) {
  const bb = boiteSol(); const cx = (bb.x0 + bb.x1) / 2, cz = (bb.z0 + bb.z1) / 2;
  const essais = [];
  for (let x = bb.x0; x <= bb.x1; x += 0.1) for (let z = bb.z0; z <= bb.z1; z += 0.1) essais.push([x, z]);
  essais.sort((a, b) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(b[0] - cx, b[1] - cz));
  const autres = meubles.filter((o) => o !== m).map((o) => ({ o, r: rect(o) }));
  for (const [x, z] of essais) {
    const R = coins(emprise(m.type), x, z, m.r);
    if (!R.every(([px, pz]) => dedans(CONTOUR, px, pz))) continue;
    // 80 cm de passage autour, comme dans une vraie cuisine
    const large = coins((({ x0, x1, z0, z1 }) => ({ x0: x0 - 0.8, x1: x1 + 0.8, z0: z0 - 0.8, z1: z1 + 0.8 }))(emprise(m.type)), x, z, m.r);
    if (autres.every(({ r }) => recouvrement(large, r) <= 0.01)) { m.x = Math.round(x * 100) / 100; m.z = Math.round(z * 100) / 100; return; }
  }
  for (const [x, z] of essais) {
    const R = coins(emprise(m.type), x, z, m.r);
    if (R.every(([px, pz]) => dedans(CONTOUR, px, pz)) && autres.every(({ r }) => recouvrement(R, r) <= 0.01)) { m.x = x; m.z = z; return; }
  }
  placer(m, cx, cz);
}

// Implantations de départ, posées le long des murs réels de la pièce
function depart(nom) {
  const L = [];
  const ligne = (types, i, t0) => {
    const mur = MURS[i]; let t = t0;
    for (const type of types) {
      const l = MEUBLES[type].l; if (t + l > mur.len + 0.001) break;
      L.push({ type, ...surMur(mur, t + l / 2), r: mur.r, accent: accentParDefaut(MEUBLES[type].type) }); t += l;
    }
    return t;
  };
  if (nom === 'vide') return L;
  const fond = MURS[0];
  if (nom === 'lineaire') {
    const types = ['cfrigo-60', 'cfour-60', 'b3t-60', 'plaque-90', 'b3t-60', 'evier-90', 'lv-60', 'b3t-60'];
    const long = types.reduce((s, t) => s + MEUBLES[t].l, 0);
    const t0 = Math.max(0, (fond.len - long) / 2);
    ligne(types, 0, t0);
    ligne(['h1p-60', 'hotte-90', 'h1p-60', 'h2p-90'], 0, t0 + 1.8);
  }
  if (nom === 'angle') {
    ligne(['cfrigo-60', 'cfour-60', 'b3t-60', 'evier-90', 'lv-60', 'b3t-60', 'b3t-60'], 0, 0);
    ligne(['b3t-60', 'plaque-90', 'b3t-60', 'b2p-90'], 1, 0.6);
    ligne(['habat-90', 'hotte-90', 'habat-90'], 1, 0.6 + 0.6);
  }
  if (nom === 'ilot') {
    const types = ['cfrigo-60', 'cfour-60', 'crgt-60', 'b3t-60', 'evier-90', 'lv-60', 'b3t-60'];
    const long = types.reduce((s, t) => s + MEUBLES[t].l, 0);
    ligne(types, 0, Math.max(0, (fond.len - long) / 2));
    const bb = boiteSol();
    L.push({ type: fond.len > 4.4 ? 'ilot-240' : 'ilot-180', x: (bb.x0 + bb.x1) / 2, z: 2.0, r: 0, accent: true });
  }
  return L;
}

// ---------- caméra ----------
let anim = null;
function vue(nom, instant = false) {
  const bb = boiteSol(); const W = bb.x1 - bb.x0, D = bb.z1 - bb.z0, cx = (bb.x0 + bb.x1) / 2;
  const k = camera.aspect < 1.1 ? 1.6 : 1;
  const vues = {
    perspective: { pos: [cx - W * 0.3, 2.9 * k, D + (W * 0.55 + 1.6) * k], cible: [cx, 0.8, D * 0.42] },
    face: { pos: [cx, 1.5, D + (W * 0.7 + 1.6) * k], cible: [cx, 1.1, D * 0.3] },
    dessus: { pos: [cx, Math.max(W, D) * 1.3 * k + 1.5, D / 2 + 0.01], cible: [cx, 0, D / 2] },
  };
  const v = vues[nom] || vues.perspective;
  vueCourante = vues[nom] ? nom : 'perspective'; majGrille();
  const fin = { pos: new THREE.Vector3(...v.pos), cible: new THREE.Vector3(...v.cible) };
  $$('[data-vue]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.vue === nom));
  if (instant) { camera.position.copy(fin.pos); controles.target.copy(fin.cible); controles.update(); rendre(); return; }
  anim = { t0: performance.now(), d: 900, de: { pos: camera.position.clone(), cible: controles.target.clone() }, fin };
}
$$('[data-vue]').forEach((b) => b.addEventListener('click', () => vue(b.dataset.vue)));
controles.addEventListener('change', rendre);

let premierCadrage = true;
function taille() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
  if (premierCadrage) { premierCadrage = false; vue('perspective', true); }
  rendre();
}
new ResizeObserver(taille).observe(canvas);

function boucle(t) {
  requestAnimationFrame(boucle);
  if (anim) {
    const k = Math.min(1, (t - anim.t0) / anim.d); const e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(anim.de.pos, anim.fin.pos, e); controles.target.lerpVectors(anim.de.cible, anim.fin.cible, e);
    if (k === 1) anim = null;
    rendre();
  }
  if (controles.update()) rendre();
  if (besoinRendu) { masquerMursDevant(); dessiner(); besoinRendu = false; }
}

// Vue en coupe : un mur placé entre la caméra et la pièce s'efface pour laisser voir la cuisine
function masquerMursDevant() {
  const bb = boiteSol(); const cx = (bb.x0 + bb.x1) / 2, cz = (bb.z0 + bb.z1) / 2;
  const dCentre = Math.hypot(camera.position.x - cx, camera.position.z - cz);
  for (const { g, mur } of groupesMurs) {
    const mx = (mur.a.x + mur.b.x) / 2, mz = (mur.a.z + mur.b.z) / 2;
    const face = (camera.position.x - mur.a.x) * mur.n.x + (camera.position.z - mur.a.z) * mur.n.z > 0;
    g.visible = !(face && Math.hypot(camera.position.x - mx, camera.position.z - mz) < dCentre - 1);
  }
}

// ---------- glisser-déposer ----------
const rayon = new THREE.Raycaster();
const solPlan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ptr = new THREE.Vector2();
function versPointeur(e) {
  const r = canvas.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  rayon.setFromCamera(ptr, camera);
}
function meubleSous(e) {
  versPointeur(e);
  const hit = rayon.intersectObjects(calqueMeubles.children, true)[0];
  let o = hit?.object;
  while (o && !o.userData.id) o = o.parent;
  return o ? meubles.find((m) => m.id === o.userData.id) : null;
}
canvas.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  const m = meubleSous(e);
  glisse = { x0: e.clientX, y0: e.clientY, m, bouge: false };
  if (!m) return;
  selection = m.id; majSelection();
  const p = new THREE.Vector3(); rayon.ray.intersectPlane(solPlan, p);
  glisse.dx = m.x - p.x; glisse.dz = m.z - p.z;
  controles.enabled = false;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!glisse?.m) {
    if (e.pointerType === 'mouse' && !glisse) canvas.style.cursor = meubleSous(e) ? 'grab' : '';
    return;
  }
  if (!glisse.bouge && Math.hypot(e.clientX - glisse.x0, e.clientY - glisse.y0) > 3) { glisse.bouge = true; majGrille(); }
  if (!glisse.bouge) return;
  versPointeur(e);
  const p = new THREE.Vector3(); if (!rayon.ray.intersectPlane(solPlan, p)) return;
  placer(glisse.m, p.x + glisse.dx, p.z + glisse.dz);
  poser(glisse.m); majSelection(); majConflits();
  canvas.style.cursor = 'grabbing';
});
const finGlisse = (e) => {
  if (!glisse) return;
  if (!glisse.m && Math.hypot(e.clientX - glisse.x0, e.clientY - glisse.y0) < 4) { selection = null; majSelection(); }
  if (glisse.m && glisse.bouge) { memoriser(); majListe(); }
  glisse = null; controles.enabled = true; canvas.style.cursor = ''; majGrille();
};
canvas.addEventListener('pointerup', finGlisse);
canvas.addEventListener('pointercancel', finGlisse);

// ---------- actions sur la sélection ----------
function action(nom) {
  const m = meubles.find((x) => x.id === selection); if (!m) return;
  if (nom === 'pivoter') {
    // un meuble contre un mur s'en décolle pour tourner ; un îlot tourne d'un quart de tour sur place
    if (!libre(m)) { m.x += Math.sin(m.r) * 0.9; m.z += Math.cos(m.r) * 0.9; }
    m.r -= QUART; if (m.r < -Math.PI) m.r += 2 * Math.PI;
    [m.x, m.z] = garderDedans(m, m.x, m.z);
  }
  if (nom === 'dupliquer') {
    const c = { ...m, id: nouvelId() };
    const l = def(m).l;
    meubles.push(c); placer(c, m.x + Math.cos(m.r) * l, m.z - Math.sin(m.r) * l); selection = c.id;
  }
  if (nom === 'finition') { m.accent = !m.accent; oublier(m.id); }
  if (nom === 'supprimer') { meubles = meubles.filter((x) => x !== m); selection = null; }
  apresChangementMeubles();
}
$$('#selection [data-action]').forEach((b) => b.addEventListener('click', () => action(b.dataset.action)));
addEventListener('keydown', (e) => {
  if (!selection || e.target.closest('input, textarea, select')) return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); action('supprimer'); }
  if (e.key === 'r' || e.key === 'R') action('pivoter');
  if (e.key === 'Escape') { selection = null; majSelection(); }
});

function apresChangementMeubles() {
  for (const id of [...groupes.keys()]) if (!meubles.some((m) => m.id === id)) oublier(id);
  meubles.forEach(poser);
  majSelection(); majConflits(); majListe(); majTitre(); memoriser();
}

// ---------- panneau : pièce ----------
// les cotes se saisissent en centimètres, au centimètre près
const CHAMPS = {
  W: { min: 1.8, max: 12 }, D: { min: 1.8, max: 10 }, H: { min: 2.2, max: 3.6 },
  Lx: { min: 0.6, max: 8 }, Lz: { min: 0.6, max: 8 }, aG: { min: 60, max: 120, deg: true }, aD: { min: 60, max: 120, deg: true },
};
function majPiece() {
  $$('#opt-forme [data-forme]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.forme === cfg.forme));
  $$('[data-pour-forme]').forEach((el) => { el.hidden = el.dataset.pourForme !== cfg.forme; });
  for (const [k, c] of Object.entries(CHAMPS)) { const el = $(`#cote-${k}`); if (el && document.activeElement !== el) el.value = c.deg ? cfg[k] : Math.round(cfg[k] * 100); }
  $('#cote-hc').value = cfg.hc;
  $('#longueurs-murs').innerHTML = MURS.map((m) => `<li><span>${m.nom}</span><b>${Math.round(m.len * 100)} cm</b></li>`).join('');
  majOuvertures();
}
function apresChangementPiece() {
  construirePiece();
  meubles.forEach((m) => { placer(m, m.x, m.z); });
  reconstruire(); majPiece(); memoriser();
}
$('#opt-forme').addEventListener('click', (e) => {
  const b = e.target.closest('[data-forme]'); if (!b) return;
  cfg.forme = b.dataset.forme;
  ouvertures = ouvertures.filter((o) => o.mur < murs(cfg).length);
  apresChangementPiece(); vue('perspective');
});
for (const [k, c] of Object.entries(CHAMPS)) {
  const el = $(`#cote-${k}`); if (!el) continue;
  el.addEventListener('change', () => {
    const v = parseFloat(String(el.value).replace(',', '.'));
    if (!Number.isFinite(v)) { majPiece(); return; }
    cfg[k] = Math.min(c.max, Math.max(c.min, c.deg ? v : v / 100));
    apresChangementPiece();
  });
}
$('#cote-hc').innerHTML = HAUTEURS_COLONNE.map((h) => `<option value="${h}">${Math.round(h * 100)} cm</option>`).join('');
$('#cote-hc').addEventListener('change', (e) => { cfg.hc = +e.target.value; reconstruire(); memoriser(); });

// portes et fenêtres
function majOuvertures() {
  const options = MURS.map((m) => `<option value="${m.i}">${m.nom}</option>`).join('');
  $('#liste-ouvertures').innerHTML = ouvertures.length ? ouvertures.map((o) => {
    const mur = MURS[o.mur];
    return `<li data-id="${o.id}">
      <div class="ouv-tete"><b>${OUVERTURES[o.type].nom}</b><button type="button" class="retirer" aria-label="Retirer">×</button></div>
      <div class="ouv-champs">
        <label>Mur<select data-k="mur">${options.replace(`value="${o.mur}"`, `value="${o.mur}" selected`)}</select></label>
        <label>Depuis le coin<input data-k="debut" inputmode="numeric" value="${Math.round((o.t - o.l / 2) * 100)}"><i>cm</i></label>
        <label>Largeur<input data-k="l" inputmode="numeric" value="${Math.round(o.l * 100)}"><i>cm</i></label>
        <label>Hauteur<input data-k="h" inputmode="numeric" value="${Math.round(o.h * 100)}"><i>cm</i></label>
        ${o.type === 'fenetre' ? `<label>Allège<input data-k="y" inputmode="numeric" value="${Math.round(o.y * 100)}"><i>cm</i></label>` : ''}
      </div>
      ${mur ? `<small>Mur de ${Math.round(mur.len * 100)} cm, mesuré depuis son coin gauche vu de l’intérieur.</small>` : ''}
    </li>`;
  }).join('') : '<li class="vide">Aucune porte ni fenêtre pour l’instant.</li>';
}
// une nouvelle ouverture se place là où elle ne gêne aucun meuble, au plus près du milieu du mur
function placeOuverture(o) {
  const mur = MURS[o.mur]; const R = meubles.map(rect);
  const essais = [];
  for (let t = o.l / 2 + 0.05; t <= mur.len - o.l / 2 - 0.05; t += 0.05) essais.push(t);
  essais.sort((a, b) => Math.abs(a - mur.len / 2) - Math.abs(b - mur.len / 2));
  for (const t of essais) {
    const e = empriseOuverture({ ...o, t }, MURS);
    if (meubles.every((m, i) => !chevauchentEnHauteur(plage(m), [e.y0, e.y1]) || recouvrement(R[i], e.coins) <= 0.02)) { o.t = t; return; }
  }
}
function borner(o) {
  const mur = MURS[o.mur] || MURS[0]; o.mur = mur.i;
  o.l = Math.min(Math.max(0.4, o.l), mur.len - 0.04);
  o.h = Math.min(Math.max(0.3, o.h), cfg.H - 0.05 - o.y);
  o.t = Math.min(mur.len - o.l / 2 - 0.02, Math.max(o.l / 2 + 0.02, o.t));
}
$('#ajout-ouverture').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ouverture]'); if (!b) return;
  const type = b.dataset.ouverture; const base = OUVERTURES[type];
  // par défaut : fenêtre sur le mur du fond, porte sur le mur de gauche
  const mur = type === 'fenetre' ? 0 : MURS.length - 1;
  const o = { id: nouvelId(), type, mur, t: MURS[mur].len / 2, l: base.l, h: base.h, y: base.y };
  borner(o); placeOuverture(o); ouvertures.push(o);
  construirePiece(); majConflits(); majOuvertures(); memoriser();
});
$('#liste-ouvertures').addEventListener('change', (e) => {
  const li = e.target.closest('li[data-id]'); const o = ouvertures.find((x) => x.id === li?.dataset.id); if (!o) return;
  const k = e.target.dataset.k; const v = parseFloat(String(e.target.value).replace(',', '.'));
  if (k === 'mur') { o.mur = +e.target.value; o.t = MURS[o.mur].len / 2; }
  else if (Number.isFinite(v)) {
    if (k === 'debut') o.t = v / 100 + o.l / 2;
    if (k === 'l') { const debut = o.t - o.l / 2; o.l = v / 100; o.t = debut + o.l / 2; }
    if (k === 'h') o.h = v / 100;
    if (k === 'y') o.y = v / 100;
  }
  borner(o); construirePiece(); majConflits(); majOuvertures(); memoriser();
});
$('#liste-ouvertures').addEventListener('click', (e) => {
  if (!e.target.closest('.retirer')) return;
  const id = e.target.closest('li[data-id]').dataset.id;
  ouvertures = ouvertures.filter((o) => o.id !== id);
  construirePiece(); majConflits(); majOuvertures(); memoriser();
});

$('#opt-depart').addEventListener('click', (e) => {
  const b = e.target.closest('[data-depart]'); if (!b) return;
  if (meubles.length && !confirm('Remplacer les meubles posés par ce point de départ ?')) return;
  meubles = depart(b.dataset.depart).map((m) => ({ ...m, id: nouvelId() }));
  meubles.forEach((m) => placer(m, m.x, m.z));
  selection = null; apresChangementMeubles(); vue('perspective');
});

$('#opt-modele').innerHTML = Object.entries(MODELES).map(([id, o]) => `<button class="opt" data-modele="${id}"><b>${o.nom}</b><small>${o.note}</small></button>`).join('');
$('#opt-modele').addEventListener('click', (e) => {
  const b = e.target.closest('[data-modele]'); if (!b) return;
  cfg.modele = b.dataset.modele;
  for (const k of ['facade', 'accent']) if (!compatible(FIN[cfg[k]])) cfg[k] = premiereCompatible(k === 'accent');
  majFinitions(); reconstruire();
});

// ---------- palette de meubles : une ligne par type, une pastille par largeur ----------
const groupesPalette = [...new Set(FAMILLES_MEUBLES.map((f) => f.groupe))];
$('#palette').innerHTML = `<p class="compte-meubles">${Object.keys(MEUBLES).length} meubles, en ${FAMILLES_MEUBLES.length} types.</p>` + groupesPalette.map((gp, i) => `
  <details class="groupe-meubles"${i < 2 ? ' open' : ''}>
    <summary>${gp}<small>${FAMILLES_MEUBLES.filter((f) => f.groupe === gp).length}</small></summary>
    <ul class="types-meubles">${FAMILLES_MEUBLES.filter((f) => f.groupe === gp).map((f) => `
      <li><span>${f.nom}</span><div class="largeurs">${f.largeurs.map((l) => `<button type="button" data-ajout="${f.id}-${l}" aria-label="Ajouter ${f.nom} ${l} cm">${l}</button>`).join('')}</div></li>`).join('')}
    </ul>
  </details>`).join('');
$('#palette').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ajout]'); if (!b) return;
  const type = b.dataset.ajout;
  const m = { id: nouvelId(), type, x: 0, z: 0, r: 0, accent: accentParDefaut(MEUBLES[type].type) };
  placeLibre(m); meubles.push(m); selection = m.id;
  apresChangementMeubles();
  b.classList.add('ajoute'); setTimeout(() => b.classList.remove('ajoute'), 600);
});

function majListe() {
  $('#nb-meubles').textContent = meubles.length ? `(${meubles.length})` : '';
  $('#liste-meubles').innerHTML = meubles.length ? meubles.map((m) => {
    const d = def(m);
    return `<li data-id="${m.id}"><button type="button" class="choisir">${d.nom} <small>${cm(d.l)}${m.accent ? ' · accent' : ''}</small></button><button type="button" class="retirer" aria-label="Retirer ${d.nom}">×</button></li>`;
  }).join('') : '<li class="vide">Aucun meuble pour l’instant.</li>';
  $$('#liste-meubles li').forEach((li) => li.classList.toggle('choisi', li.dataset.id === selection));
}
$('#liste-meubles').addEventListener('click', (e) => {
  const li = e.target.closest('li[data-id]'); if (!li) return;
  selection = li.dataset.id;
  if (e.target.closest('.retirer')) action('supprimer'); else majSelection();
});

// ---------- nuanciers ----------
let cible = 'facade';
const compatible = (f) => !!f && f.modeles.includes(cfg.modele);
const premiereCompatible = (texture) => {
  const l = FINITIONS.filter(compatible);
  return ((texture && l.find((f) => f.tex)) || l[0] || FIN[DEFAUT.facade]).id;
};
function nuancier(liste, actif, attr) {
  const familles = [...new Set(liste.map((f) => f.famille))];
  return familles.map((fa) => `
    <div class="famille"><h4>${fa}</h4><div class="echantillons">${liste.filter((f) => f.famille === fa).map((f) => `
      <button type="button" class="echantillon" ${attr}="${f.id}" aria-pressed="${f.id === actif}" title="${f.nom}" style="background-color:${f.couleur};background-image:url(assets/img/finitions/${f.id}.jpg)"><span>${f.nom}</span></button>`).join('')}</div></div>`).join('');
}
function majTitre() {
  $('#nom-modele').textContent = MODELES[cfg.modele].nom;
  $('#sous-modele').textContent = `${FIN[cfg.facade].nom} & ${FIN[cfg.accent].nom} · ${meubles.length} meuble${meubles.length > 1 ? 's' : ''}`;
}
function majFinitions() {
  const m = MODELES[cfg.modele];
  $$('#opt-modele [data-modele]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.modele === cfg.modele));
  majTitre();
  $('#note-modele').textContent = `${FINITIONS.filter(compatible).length} finitions du catalogue Armony 2026 disponibles pour ${m.nom}.`;
  $('#nom-facade').textContent = `${FIN[cfg.facade].nom} · ${FIN[cfg.facade].famille}`;
  $('#nom-accent').textContent = `${FIN[cfg.accent].nom} · ${FIN[cfg.accent].famille}`;
  $$('[data-cible]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cible === cible));
  $('#nuancier-facades').innerHTML = nuancier(FINITIONS.filter(compatible), cfg[cible], 'data-fin');
  $('#nuancier-plans').innerHTML = nuancier(FINITIONS.filter((f) => FAMILLES_PLAN.includes(f.fid)), cfg.plan, 'data-plan');
  $('#nom-plan').textContent = `— ${FIN[cfg.plan].nom}, ${FIN[cfg.plan].famille}`;
  $('#opt-poignee').innerHTML = Object.entries(POIGNEES).map(([id, o]) => `<button class="opt" data-poignee="${id}" aria-pressed="${id === cfg.poignee && m.porte !== 'profil'}"${m.porte === 'profil' ? ' disabled' : ''}><b>${o.nom}</b><small>${o.note}</small></button>`).join('');
  $('#nu-teinte').innerHTML = Object.entries(TEINTES_POIGNEE).map(([id, o]) => `<button class="teinte" data-teinte="${id}" aria-pressed="${id === cfg.teinte}" style="background:${o.couleur}" title="${o.nom}" aria-label="${o.nom}"></button>`).join('');
  $('#nom-teinte').innerHTML = m.porte === 'profil' ? `<b>${TEINTES_POIGNEE[cfg.teinte].nom}</b> — profilés et poignée System` : `<b>${TEINTES_POIGNEE[cfg.teinte].nom}</b>`;
  memoriser();
}
$$('[data-cible]').forEach((b) => b.addEventListener('click', () => { cible = b.dataset.cible; majFinitions(); }));
document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-fin]'), p = e.target.closest('[data-plan]'), h = e.target.closest('[data-poignee]'), t = e.target.closest('[data-teinte]');
  if (!(f || p || h || t)) return;
  if (f) cfg[cible] = f.dataset.fin;
  if (p) cfg.plan = p.dataset.plan;
  if (h) cfg.poignee = h.dataset.poignee;
  if (t) cfg.teinte = t.dataset.teinte;
  const panneau = $('.panneaux'); const haut = panneau.scrollTop;
  majFinitions(); reconstruire(); panneau.scrollTop = haut;
});

// ---------- récapitulatif ----------
function lignesRecap() {
  const m = MODELES[cfg.modele];
  const compte = {};
  for (const x of meubles) { const d = def(x); const k = `${d.nom} ${cm(d.l)}${x.accent ? ' (accent)' : ''}`; compte[k] = (compte[k] || 0) + 1; }
  const lineaire = meubles.filter((x) => ['bas', 'colonne'].includes(def(x).type)).reduce((s, x) => s + def(x).l, 0);
  const forme = cfg.forme === 'L' ? `en L (découpe ${cm(cfg.Lx)} × ${cm(cfg.Lz)})` : cfg.forme === 'biais' ? `murs en biais (angles ${cfg.aG}° et ${cfg.aD}°)` : 'rectangulaire';
  return [
    ['Modèle', `Armony ${m.nom}`],
    ['Façades', `${FIN[cfg.facade].nom} (${FIN[cfg.facade].famille})`],
    ['Accent', `${FIN[cfg.accent].nom} (${FIN[cfg.accent].famille})`],
    ['Plan de travail', `${FIN[cfg.plan].nom} (${FIN[cfg.plan].famille})`],
    ['Poignées', m.porte === 'profil' ? `Poignée System, ${TEINTES_POIGNEE[cfg.teinte].nom}` : `${POIGNEES[cfg.poignee].nom}, ${TEINTES_POIGNEE[cfg.teinte].nom}`],
    ['Pièce', `${forme}, ${cm(cfg.W)} × ${cm(cfg.D)}, ${cm(cfg.H)} sous plafond`],
    ['Murs', MURS.map((w) => `${w.nom} ${cm(w.len)}`).join(' ; ')],
    ['Colonnes', `hauteur ${cm(cfg.hc)}`],
    ...ouvertures.map((o) => [OUVERTURES[o.type].nom, `${MURS[o.mur]?.nom || ''}, à ${cm(o.t - o.l / 2)} du coin, ${cm(o.l)} × ${cm(o.h)}${o.type === 'fenetre' ? `, allège ${cm(o.y)}` : ''}`]),
    ['Linéaire au sol', fmt(lineaire)],
    ...Object.entries(compte).map(([k, n]) => [`${n} ×`, k]),
  ];
}
function majRecap() { $('#recap').innerHTML = lignesRecap().map(([a, b]) => `<li><span>${a}</span><b>${b}</b></li>`).join(''); }

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
  if (etape === 4) majRecap();
}
$$('.onglets button').forEach((b) => b.addEventListener('click', () => aller(+b.dataset.onglet)));
$('#prec').addEventListener('click', () => aller(etape - 1));
$('#suiv').addEventListener('click', () => aller(etape + 1));

// ---------- envoi ----------
function capture() {
  const sel = surligne.visible; surligne.visible = false; conflits.visible = false;
  dessiner();
  surligne.visible = sel; conflits.visible = true;
  return new Promise((ok) => canvas.toBlob((b) => ok(b), 'image/jpeg', 0.86));
}
brancherFormulaire($('form[name="configuration-cuisine"]'), {
  avant: async () => {
    const extra = {
      configuration: lignesRecap().map(([a, b]) => (a.endsWith('×') ? `${a} ${b}` : `${a} : ${b}`)).join('\n'),
      lien_3d: lienPartage(),
    };
    const image = await capture();
    if (image) extra.apercu = image;
    return extra;
  },
});

// ---------- démarrage ----------
construirePiece();
if (meubles === null) meubles = depart('ilot').map((m) => ({ ...m, id: nouvelId() }));
ouvertures.forEach(borner);
meubles.forEach((m) => placer(m, m.x, m.z));
majPiece(); construirePiece(); majFinitions(); reconstruire(); majListe();
aller(0);
requestAnimationFrame(boucle);
