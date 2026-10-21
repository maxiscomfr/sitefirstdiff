// Configurateur : le visiteur pose ses meubles Armony dans sa pièce, avec les finitions du catalogue 2026,
// puis envoie sa composition à FirstDiff pour chiffrage.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { $, $$, brancherFormulaire } from './site.js?v=20261021c';
import { FINITIONS } from './finitions.js?v=20261021c';
import { FIN, MODELES, POIGNEES, TEINTES_POIGNEE, FAMILLES_PLAN, MEUBLES, PROFONDEUR, Materiaux,
  construireMeuble, emprise, depart, accentParDefaut } from './meubles3d.js?v=20261021c';

const QUART = Math.PI / 2;
const DEFAUT = { modele: 'yota', facade: 'laccato-micalizzato--talco', accent: 'noce--noce', plan: 'gres--pietra-grey',
  poignee: 'gorge', teinte: 'noir', W: 5, D: 4.2 };
const fmt = (m) => m.toFixed(2).replace('.', ',') + ' m';
const cm = (l) => Math.round(l * 100) + ' cm';

// ---------- état : URL > dernière session > défaut ----------
let cfg = { ...DEFAUT };
let meubles = [];
let compteur = 0;
const nouvelId = () => 'm' + (++compteur);

function encoderMeubles() {
  return meubles.map((m) => [m.type, m.x.toFixed(2), m.z.toFixed(2), Math.round(m.r / QUART), m.accent ? 1 : 0].join('~')).join('_');
}
function decoderMeubles(s) {
  return s.split('_').filter(Boolean).map((t) => {
    const [type, x, z, r, a] = t.split('~');
    return MEUBLES[type] ? { id: nouvelId(), type, x: +x, z: +z, r: +r * QUART, accent: a === '1' } : null;
  }).filter(Boolean);
}
function lireEtat() {
  const q = new URLSearchParams(location.search);
  let memo = null;
  try { memo = JSON.parse(localStorage.getItem('firstdiff-config-v2') || 'null'); } catch { /* stockage indisponible */ }
  if (memo?.cfg) cfg = { ...cfg, ...memo.cfg };
  for (const k of Object.keys(DEFAUT)) if (q.has(k)) cfg[k] = typeof DEFAUT[k] === 'number' ? +q.get(k) : q.get(k);
  if (q.has('modele') && !q.has('m') && !memo) { /* lien depuis une collection : garder l'implantation par défaut */ }
  if (q.has('m')) meubles = decoderMeubles(q.get('m'));
  else if (memo?.m != null) meubles = decoderMeubles(memo.m);
  else meubles = depart('ilot', cfg.W).map((m) => ({ ...m, id: nouvelId() }));
  if (!MODELES[cfg.modele]) cfg.modele = 'yota';
  for (const k of ['facade', 'accent', 'plan']) if (!FIN[cfg[k]]) cfg[k] = DEFAUT[k];
}
lireEtat();
const memoriser = () => { try { localStorage.setItem('firstdiff-config-v2', JSON.stringify({ cfg, m: encoderMeubles() })); } catch { /* rien */ } };
const lienPartage = () => {
  const q = new URLSearchParams(Object.entries(cfg).map(([k, v]) => [k, String(v)]));
  q.set('m', encoderMeubles());
  return `${location.origin}${location.pathname}?${q}`;
};

// ---------- scène ----------
const canvas = $('#config3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
Object.assign(soleil.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.02;
scene.add(soleil, soleil.target);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
const controles = new OrbitControls(camera, canvas);
controles.enableDamping = true; controles.dampingFactor = 0.08;
controles.minDistance = 2; controles.maxDistance = 18; controles.maxPolarAngle = Math.PI * 0.495;

// occlusion ambiante (ombres de contact entre meubles, murs et sol) sur ordinateur et tablette
const composer = matchMedia('(max-width: 760px)').matches ? null : new EffectComposer(renderer);
let ao = null;
if (composer) {
  composer.addPass(new RenderPass(scene, camera));
  ao = new GTAOPass(scene, camera, 1, 1);
  ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.1 });
  ao.blendIntensity = 0.85;
  composer.addPass(ao);
  composer.addPass(new OutputPass());
}
const dessiner = () => (composer ? composer.render() : renderer.render(scene, camera));

let besoinRendu = true;
const rendre = () => { besoinRendu = true; };
const mats = new Materiaux(rendre);

// la pièce : sol et trois murs, visibles seulement de l'intérieur
const piece = new THREE.Group(); scene.add(piece);
// la grille n'apparaît qu'en vue de dessus et pendant qu'on déplace un meuble
let vueCourante = 'perspective';
const grilleVisible = () => vueCourante === 'dessus' || !!glisse?.bouge;
const majGrille = () => { if (piece.userData.grille) piece.userData.grille.visible = grilleVisible(); rendre(); };
function construirePiece() {
  piece.clear();
  const { W, D } = cfg; const H = 2.7;
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(W, D), matSol(W, D));
  sol.rotation.x = -QUART; sol.position.set(0, 0, D / 2); sol.receiveShadow = true;
  const dehors = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#d9d4cb', roughness: 1 }));
  dehors.rotation.x = -QUART; dehors.position.y = -0.002;
  const n = Math.round(Math.max(W, D) / 0.5) * 2;
  const grille = new THREE.GridHelper(n * 0.5, n, '#b4ac9e', '#bfb8ab');
  grille.material.transparent = true; grille.material.opacity = 0.35;
  grille.visible = grilleVisible(); piece.userData.grille = grille;
  grille.position.set(0, 0.001, D / 2);
  grille.material.clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), W / 2), new THREE.Plane(new THREE.Vector3(-1, 0, 0), W / 2),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), new THREE.Plane(new THREE.Vector3(0, 0, -1), D),
  ];
  const murMat = new THREE.MeshStandardMaterial({ color: '#ebe6dd', roughness: 0.95 });
  const fond = new THREE.Mesh(new THREE.PlaneGeometry(W, H), murMat); fond.position.set(0, H / 2, 0);
  const gauche = new THREE.Mesh(new THREE.PlaneGeometry(D, H), murMat); gauche.rotation.y = QUART; gauche.position.set(-W / 2, H / 2, D / 2);
  const droite = new THREE.Mesh(new THREE.PlaneGeometry(D, H), murMat); droite.rotation.y = -QUART; droite.position.set(W / 2, H / 2, D / 2);
  for (const m of [fond, gauche, droite]) m.receiveShadow = true;
  // plinthes
  const pl = new THREE.MeshStandardMaterial({ color: '#f2efe9', roughness: 0.6 });
  const plinthes = [[W, 0, 0.006, 0], [D, -W / 2 + 0.006, D / 2, QUART], [D, W / 2 - 0.006, D / 2, -QUART]].map(([l, x, z, r]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(l, 0.08, 0.012), pl); p.position.set(x, 0.04, z); p.rotation.y = r; p.receiveShadow = true; return p;
  });
  piece.add(dehors, sol, grille, fond, gauche, droite, ...plinthes);
  soleil.target.position.set(0, 0, D / 2);
  rendre();
}
renderer.localClippingEnabled = true;

// parquet chêne clair dessiné à la volée : lames de 18 cm, nuances et fil du bois
let texParquet = null;
function matSol(W, D) {
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
  }
  const t = texParquet.clone(); t.needsUpdate = true; t.repeat.set(W / 1.44, D / 1.44);
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, bumpMap: t, bumpScale: 0.3 });
}

// ---------- meubles dans la scène ----------
const groupes = new Map();
const calqueMeubles = new THREE.Group(); scene.add(calqueMeubles);
let selection = null;
const surligne = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats.fixe('selection'));
surligne.visible = false; surligne.renderOrder = 2; scene.add(surligne);
const conflits = new THREE.Group(); scene.add(conflits);

// une colonne occupe à la fois le sol et la hauteur des meubles hauts
const calques = (m) => ({ haut: ['mur'], colonne: ['sol', 'mur'] }[MEUBLES[m.type].type] || ['sol']);
const memeCalque = (a, b) => calques(a).some((c) => calques(b).includes(c));
const hauteur = (m) => ({ bas: 0.92, colonne: 2.25, haut: 0.75, ilot: 0.95 }[MEUBLES[m.type].type]);
const baseY = (m) => (MEUBLES[m.type].type === 'haut' ? 1.5 : 0);

// rectangle occupé au sol, en coordonnées de la pièce (rotations par quarts de tour)
function rectangle(m) {
  const e = emprise(m.type); const c = Math.round(Math.cos(m.r)), s = Math.round(Math.sin(m.r));
  const pts = [[e.x0, e.z0], [e.x1, e.z0], [e.x0, e.z1], [e.x1, e.z1]].map(([x, z]) => [m.x + x * c + z * s, m.z - x * s + z * c]);
  const xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
}

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

function majSelection() {
  const m = meubles.find((x) => x.id === selection);
  $('#selection').hidden = !m;
  surligne.visible = !!m;
  if (m) {
    const r = rectangle(m); const h = hauteur(m);
    surligne.scale.set(r.x1 - r.x0 + 0.04, h + 0.04, r.z1 - r.z0 + 0.04);
    surligne.position.set((r.x0 + r.x1) / 2, baseY(m) + h / 2, (r.z0 + r.z1) / 2);
    const d = MEUBLES[m.type];
    $('#sel-nom').textContent = `${d.nom} · ${cm(d.l)}`;
    $('#sel-finition').textContent = m.accent ? 'Principale' : 'Accent';
    $('#sel-finition').title = m.accent ? 'Passer en finition principale' : 'Passer en finition d\u2019accent';
  }
  $$('#liste-meubles li').forEach((li) => li.classList.toggle('choisi', li.dataset.id === selection));
  rendre();
}

function majConflits() {
  conflits.clear();
  for (let i = 0; i < meubles.length; i++) for (let j = i + 1; j < meubles.length; j++) {
    const a = meubles[i], b = meubles[j];
    if (!memeCalque(a, b)) continue;
    const A = rectangle(a), B = rectangle(b);
    const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oz = Math.min(A.z1, B.z1) - Math.max(A.z0, B.z0);
    if (ox > 0.02 && oz > 0.02) {
      const y0 = Math.max(baseY(a), baseY(b)), y1 = Math.min(baseY(a) + hauteur(a), baseY(b) + hauteur(b)) + 0.02;
      const box = new THREE.Mesh(GEO_CONFLIT, mats.fixe('conflit'));
      box.scale.set(ox, y1 - y0, oz);
      box.position.set(Math.max(A.x0, B.x0) + ox / 2, (y0 + y1) / 2, Math.max(A.z0, B.z0) + oz / 2);
      conflits.add(box);
    }
  }
}
const GEO_CONFLIT = new THREE.BoxGeometry(1, 1, 1);

// Aimantation : contre le mur le plus proche, puis bord à bord avec les voisins du même mur.
function placer(m, x, z) {
  const def = MEUBLES[m.type]; const { W, D } = cfg; const l = def.l, P = PROFONDEUR[def.type];
  if (def.type === 'ilot') {
    const r = rectangle({ ...m, x: 0, z: 0 });
    x = Math.min(W / 2 - r.x1, Math.max(-W / 2 - r.x0, x));
    z = Math.min(D - r.z1, Math.max(0.6 + 0.9 - r.z0, z));
  } else {
    const murs = [['fond', z], ['gauche', x + W / 2], ['droite', W / 2 - x]].sort((a, b) => a[1] - b[1]);
    const [mur, dist] = murs[0];
    if (dist < 0.6) {
      if (mur === 'fond') { z = 0; m.r = 0; x = Math.min(W / 2 - l / 2, Math.max(-W / 2 + l / 2, x)); }
      if (mur === 'gauche') { x = -W / 2; m.r = QUART; z = Math.min(D - l / 2, Math.max(l / 2, z)); }
      if (mur === 'droite') { x = W / 2; m.r = -QUART; z = Math.min(D - l / 2, Math.max(l / 2, z)); }
      // voisins sur le même mur et le même calque
      let meilleur = 0.1, cible = null;
      const le = mur === 'fond' ? x : z;
      for (const o of meubles) {
        if (o === m || !memeCalque(o, m) || MEUBLES[o.type].type === 'ilot') continue;
        const surMur = mur === 'fond' ? Math.abs(o.z) < 0.01 && o.r === 0 : Math.abs(o.x - x) < 0.01 && Math.abs(o.r - m.r) < 0.01;
        if (!surMur) continue;
        const oe = mur === 'fond' ? o.x : o.z; const ol = MEUBLES[o.type].l;
        for (const c of [oe + ol / 2 + l / 2, oe - ol / 2 - l / 2]) if (Math.abs(c - le) < meilleur) { meilleur = Math.abs(c - le); cible = c; }
      }
      // dans un angle : se caler juste après la profondeur des meubles du mur du fond
      if (cible == null && mur !== 'fond' && Math.abs(le - l / 2 - 0.6) < 0.1) cible = 0.6 + l / 2;
      if (cible != null) { if (mur === 'fond') x = cible; else z = cible; }
    } else {
      const r = rectangle({ ...m, x: 0, z: 0 });
      x = Math.min(W / 2 - r.x1, Math.max(-W / 2 - r.x0, x));
      z = Math.min(D - r.z1, Math.max(-r.z0, z));
    }
  }
  m.x = Math.round(x * 100) / 100; m.z = Math.round(z * 100) / 100;
}

// Première place libre le long des murs (fond, puis gauche, puis droite) pour un nouveau meuble
function placeLibre(m) {
  const def = MEUBLES[m.type]; const { W, D } = cfg;
  if (def.type === 'ilot') { m.r = 0; placer(m, 0, Math.max(1.8, D / 2)); return; }
  const murs = [
    { r: 0, debut: -W / 2, fin: W / 2, surMur: (o) => Math.abs(o.z) < 0.01 && o.r === 0, pos: (o) => o.x, vers: (c) => ({ x: c, z: 0 }) },
    { r: QUART, debut: 0.6, fin: D, surMur: (o) => Math.abs(o.x + W / 2) < 0.01 && o.r === QUART, pos: (o) => o.z, vers: (c) => ({ x: -W / 2, z: c }) },
    { r: -QUART, debut: 0.6, fin: D, surMur: (o) => Math.abs(o.x - W / 2) < 0.01 && o.r === -QUART, pos: (o) => o.z, vers: (c) => ({ x: W / 2, z: c }) },
  ];
  for (const mur of murs) {
    const occupe = meubles.filter((o) => o !== m && memeCalque(o, m) && mur.surMur(o))
      .map((o) => [mur.pos(o) - MEUBLES[o.type].l / 2, mur.pos(o) + MEUBLES[o.type].l / 2]).sort((a, b) => a[0] - b[0]);
    let c = mur.debut;
    for (const [a, b] of occupe) { if (a - c >= def.l - 0.001) break; c = Math.max(c, b); }
    if (c + def.l <= mur.fin + 0.001) { Object.assign(m, mur.vers(c + def.l / 2), { r: mur.r }); return; }
  }
  m.r = 0; placer(m, 0, D * 0.6);
}

// ---------- caméra ----------
let anim = null;
function vue(nom, instant = false) {
  const { W, D } = cfg; const k = camera.aspect < 1.1 ? 1.6 : 1;
  const vues = {
    perspective: { pos: [-W * 0.3, 2.9 * k, D + (W * 0.55 + 1.6) * k], cible: [0, 0.8, D * 0.42] },
    face: { pos: [0, 1.5, D + (W * 0.7 + 1.6) * k], cible: [0, 1.1, D * 0.3] },
    dessus: { pos: [0, Math.max(W, D) * 1.3 * k + 1.5, D / 2 + 0.01], cible: [0, 0, D / 2] },
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
  if (besoinRendu) { dessiner(); besoinRendu = false; }
}

// ---------- glisser-déposer ----------
const rayon = new THREE.Raycaster();
const solPlan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ptr = new THREE.Vector2();
let glisse = null;
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
    const contreMur = MEUBLES[m.type].type !== 'ilot' && (Math.abs(m.z) < 0.01 || Math.abs(Math.abs(m.x) - cfg.W / 2) < 0.01);
    m.r = ((m.r - QUART) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (m.r > Math.PI) m.r -= 2 * Math.PI;
    if (contreMur) { m.x *= 0.9; m.z = Math.max(m.z, 0.9); }
    const r = rectangle({ ...m, x: 0, z: 0 }); const { W, D } = cfg;
    m.x = Math.min(W / 2 - r.x1, Math.max(-W / 2 - r.x0, m.x)); m.z = Math.min(D - r.z1, Math.max(-r.z0, m.z));
  }
  if (nom === 'dupliquer') {
    const c = { ...m, id: nouvelId() };
    const l = MEUBLES[m.type].l; const dx = Math.round(Math.cos(m.r)), dz = -Math.round(Math.sin(m.r));
    meubles.push(c); placer(c, m.x + dx * l, m.z + dz * l); selection = c.id;
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

// ---------- panneau : pièce, départ, modèle ----------
const largeur = $('#largeur'), profondeur = $('#profondeur');
function majPiece() {
  largeur.value = cfg.W; profondeur.value = cfg.D;
  $('#val-largeur').textContent = fmt(cfg.W); $('#val-profondeur').textContent = fmt(cfg.D);
}
for (const [champ, k] of [[largeur, 'W'], [profondeur, 'D']]) champ.addEventListener('input', () => {
  cfg[k] = +champ.value; majPiece(); construirePiece();
  meubles.forEach((m) => { placer(m, m.x, m.z); poser(m); });
  majSelection(); majConflits(); memoriser();
});
$('#opt-depart').addEventListener('click', (e) => {
  const b = e.target.closest('[data-depart]'); if (!b) return;
  if (meubles.length && !confirm('Remplacer les meubles posés par ce point de départ ?')) return;
  meubles = depart(b.dataset.depart, cfg.W).map((m) => ({ ...m, id: nouvelId() }));
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

// ---------- palette de meubles ----------
const groupesPalette = [...new Set(Object.values(MEUBLES).map((d) => d.groupe))];
$('#palette').innerHTML = groupesPalette.map((gp) => `
  <h3>${gp}</h3>
  <div class="palette">${Object.entries(MEUBLES).filter(([, d]) => d.groupe === gp).map(([id, d]) => `
    <button type="button" class="ajout" data-ajout="${id}"><span class="plus" aria-hidden="true">+</span><b>${d.nom}</b><small>${cm(d.l)}</small></button>`).join('')}</div>`).join('');
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
    const d = MEUBLES[m.type];
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
  for (const x of meubles) { const d = MEUBLES[x.type]; const k = `${d.nom} ${cm(d.l)}${x.accent ? ' (accent)' : ''}`; compte[k] = (compte[k] || 0) + 1; }
  const lineaire = meubles.filter((x) => ['bas', 'colonne'].includes(MEUBLES[x.type].type)).reduce((s, x) => s + MEUBLES[x.type].l, 0);
  return [
    ['Modèle', `Armony ${m.nom}`],
    ['Façades', `${FIN[cfg.facade].nom} (${FIN[cfg.facade].famille})`],
    ['Accent', `${FIN[cfg.accent].nom} (${FIN[cfg.accent].famille})`],
    ['Plan de travail', `${FIN[cfg.plan].nom} (${FIN[cfg.plan].famille})`],
    ['Poignées', m.porte === 'profil' ? `Poignée System, ${TEINTES_POIGNEE[cfg.teinte].nom}` : `${POIGNEES[cfg.poignee].nom}, ${TEINTES_POIGNEE[cfg.teinte].nom}`],
    ['Pièce', `${fmt(cfg.W)} × ${fmt(cfg.D)}`],
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
meubles.forEach((m) => placer(m, m.x, m.z));
majPiece(); construirePiece(); majFinitions(); reconstruire(); majListe();
aller(0);
requestAnimationFrame(boucle);
