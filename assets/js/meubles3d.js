// Meubles Armony posables un par un, avec les finitions réelles du catalogue 2026.
// Chaque meuble a son origine au sol, au milieu de son dos : il se plaque contre un mur
// en mettant z = 0 et s'étend vers l'avant (+z) sur sa profondeur.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FINITIONS } from './finitions.js?v=20261021c';

export const FIN = Object.fromEntries(FINITIONS.map((f) => [f.id, f]));

// Modèles du catalogue (p. 280-281) et façon de dessiner leurs façades
export const MODELES = {
  yota: { nom: 'Yota', porte: 'lisse', note: 'Essential · façade lisse 22 mm' },
  rho: { nom: 'Rho', porte: 'lisse', note: 'Essential · stratifié Lamitech' },
  kappa: { nom: 'Kappa', porte: 'lisse', note: 'Essential · laque UV, X-Steel' },
  tau: { nom: 'Tau', porte: 'lisse', note: 'Essential · Fenix' },
  system: { nom: 'System', porte: 'profil', note: 'Signature · profilés métalliques' },
  omicron: { nom: 'Omicron', porte: 'chant', note: 'Design · prise usinée à 33°' },
  diamond: { nom: 'Diamond', porte: 'chant', note: 'Design · chant sculpté' },
  riga: { nom: 'Riga', porte: 'rainure', note: 'Façade rainurée 3D, 23 mm' },
  quadro: { nom: 'Quadro', porte: 'cadre', note: 'Cadre périmétral, 22 mm' },
  skyline: { nom: 'Skyline', porte: 'alu', note: 'Cadre aluminium, verre, grès' },
  etro: { nom: 'Etro', porte: 'lisse', note: 'PET et PVC' },
  equa: { nom: 'Equa', porte: 'lisse', note: 'Laque mat UV' },
};

export const POIGNEES = {
  gorge: { nom: 'Gorge intégrée', note: 'Ring, Regola, Zeta, Verso' },
  maniglia: { nom: 'Maniglia', note: 'Poignée barre' },
  logica: { nom: 'Logica', note: 'Prise encastrée' },
  push: { nom: 'Push-pull', note: 'Sans poignée' },
};
export const TEINTES_POIGNEE = {
  noir: { nom: 'Noir', couleur: '#161616', r: 0.45, m: 0.6 },
  titane: { nom: 'Titane', couleur: '#7f7d78', r: 0.3, m: 1 },
  inox: { nom: 'Inox', couleur: '#bcbdbb', r: 0.25, m: 1 },
  'antique-gold': { nom: 'Antique gold', couleur: '#a68a55', r: 0.32, m: 1 },
};

// Familles proposées en plan de travail
export const FAMILLES_PLAN = ['gres', 'fenix', 'corian', 'lamitech-materico'];
const EP_PLAN = { gres: 0.03, fenix: 0.02, corian: 0.03, 'lamitech-materico': 0.04 };

// Le catalogue de meubles à poser
export const MEUBLES = {
  'tiroirs-60': { nom: 'Bas 3 tiroirs', l: 0.6, type: 'bas', faces: 'tiroirs', groupe: 'Meubles bas' },
  'tiroirs-90': { nom: 'Bas 3 tiroirs', l: 0.9, type: 'bas', faces: 'tiroirs', groupe: 'Meubles bas' },
  'porte-45': { nom: 'Bas 1 porte', l: 0.45, type: 'bas', faces: 'porte', groupe: 'Meubles bas' },
  'porte-60': { nom: 'Bas 1 porte', l: 0.6, type: 'bas', faces: 'porte', groupe: 'Meubles bas' },
  'evier-90': { nom: 'Évier', l: 0.9, type: 'bas', faces: 'portes', equip: 'evier', groupe: 'Meubles bas' },
  'plaque-60': { nom: 'Plaque de cuisson', l: 0.6, type: 'bas', faces: 'tiroirs', equip: 'plaque', groupe: 'Meubles bas' },
  'plaque-90': { nom: 'Plaque de cuisson', l: 0.9, type: 'bas', faces: 'tiroirs', equip: 'plaque', groupe: 'Meubles bas' },
  'lv-60': { nom: 'Lave-vaisselle intégré', l: 0.6, type: 'bas', faces: 'panneau', groupe: 'Meubles bas' },
  'col-four-60': { nom: 'Colonne four', l: 0.6, type: 'colonne', equip: 'four', groupe: 'Colonnes' },
  'col-frigo-60': { nom: 'Colonne réfrigérateur', l: 0.6, type: 'colonne', groupe: 'Colonnes' },
  'col-rgt-45': { nom: 'Colonne rangement', l: 0.45, type: 'colonne', groupe: 'Colonnes' },
  'col-rgt-60': { nom: 'Colonne rangement', l: 0.6, type: 'colonne', groupe: 'Colonnes' },
  'haut-60': { nom: 'Meuble haut', l: 0.6, type: 'haut', groupe: 'Meubles hauts' },
  'haut-90': { nom: 'Meuble haut', l: 0.9, type: 'haut', groupe: 'Meubles hauts' },
  'hotte-90': { nom: 'Hotte murale', l: 0.9, type: 'haut', equip: 'hotte', groupe: 'Meubles hauts' },
  'ilot-180': { nom: 'Îlot', l: 1.8, type: 'ilot', groupe: 'Îlots' },
  'ilot-240': { nom: 'Îlot', l: 2.4, type: 'ilot', groupe: 'Îlots' },
  'ilot-300': { nom: 'Îlot avec coin repas', l: 3.0, type: 'ilot', bar: true, groupe: 'Îlots' },
};
export const PROFONDEUR = { bas: 0.6, colonne: 0.6, haut: 0.36, ilot: 1.0 };
export const accentParDefaut = (type) => type === 'colonne' || type === 'ilot';

// ---------- matériaux ----------
const chargeur = new THREE.TextureLoader();
const cacheTex = new Map();
function texture(id, surCharge) {
  if (!cacheTex.has(id)) {
    const t = chargeur.load(`assets/img/finitions/${id}.jpg`, () => surCharge?.());
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    cacheTex.set(id, t);
  }
  return cacheTex.get(id);
}
let bosses = null;
function texRainures() {
  if (bosses) return bosses;
  const c = document.createElement('canvas'); c.width = 64; c.height = 4;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 4);
  g.fillStyle = '#000'; g.fillRect(0, 0, 12, 4);
  bosses = new THREE.CanvasTexture(c); bosses.wrapS = bosses.wrapT = THREE.RepeatWrapping;
  return bosses;
}

export class Materiaux {
  constructor(surCharge) { this.cache = new Map(); this.surCharge = surCharge; }
  get(cle, fab) { if (!this.cache.has(cle)) this.cache.set(cle, fab()); return this.cache.get(cle); }

  finition(id, { largeur = 0.6, hauteur = 0.7, rainure = false } = {}) {
    const f = FIN[id] || FINITIONS[0];
    const kx = Math.round(largeur * 20) / 20, ky = Math.round(hauteur * 10) / 10;
    return this.get(`f:${f.id}:${kx}:${ky}:${rainure}`, () => {
      // laques brillantes et verres : vernis transparent ; bois et matières : relief tiré de l'échantillon
      const brillant = f.r <= 0.25;
      const mat = new THREE.MeshPhysicalMaterial({ color: f.tex ? '#ffffff' : f.couleur, roughness: f.r, metalness: f.m,
        clearcoat: brillant ? 1 : f.r <= 0.45 ? 0.25 : 0, clearcoatRoughness: brillant ? 0.04 : 0.3 });
      if (f.tex) {
        const t = texture(f.id, this.surCharge).clone();
        // l'échantillon fait environ 3 × 1 : on le répète pour garder un grain réaliste
        t.repeat.set(Math.max(0.35, kx / 0.6), Math.max(0.35, ky / 0.7)); t.needsUpdate = true;
        mat.map = t; mat.bumpMap = t; mat.bumpScale = 0.8;
      }
      if (rainure) {
        const b = texRainures().clone(); b.needsUpdate = true; b.repeat.set(Math.max(1, Math.round(kx / 0.025)), 1);
        mat.bumpMap = b; mat.bumpScale = 3;
      }
      return mat;
    });
  }

  plan(id, longueur) {
    const f = FIN[id] || FINITIONS[0];
    const k = Math.round(longueur * 10) / 10;
    return this.get(`p:${f.id}:${k}`, () => {
      const mat = new THREE.MeshPhysicalMaterial({ color: f.tex ? '#ffffff' : f.couleur, roughness: Math.min(f.r, 0.5), metalness: 0,
        clearcoat: f.fid === 'gres' ? 0.4 : 0, clearcoatRoughness: 0.3 });
      if (f.tex) { const t = texture(f.id, this.surCharge).clone(); t.repeat.set(Math.max(0.5, k / 1.2), 1); t.needsUpdate = true; mat.map = t; mat.bumpMap = t; mat.bumpScale = 0.4; }
      return mat;
    });
  }

  poignee(id) {
    const p = TEINTES_POIGNEE[id] || TEINTES_POIGNEE.noir;
    return this.get('h:' + id, () => new THREE.MeshStandardMaterial({ color: p.couleur, roughness: p.r, metalness: p.m }));
  }

  fixe(nom) {
    const defs = {
      ombre: () => new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.9 }),
      verre: () => new THREE.MeshPhysicalMaterial({ color: '#0a0a0b', roughness: 0.08, metalness: 0.2, clearcoat: 1 }),
      inox: () => new THREE.MeshStandardMaterial({ color: '#c9cacb', roughness: 0.25, metalness: 1 }),
      alu: () => new THREE.MeshStandardMaterial({ color: '#8d8c88', roughness: 0.35, metalness: 1 }),
      led: () => new THREE.MeshBasicMaterial({ color: '#ffe2b0' }),
      cuir: () => new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.7 }),
      selection: () => new THREE.MeshBasicMaterial({ color: '#a8935a', transparent: true, opacity: 0.22, depthWrite: false }),
      conflit: () => new THREE.MeshBasicMaterial({ color: '#c0603a', transparent: true, opacity: 0.25, depthWrite: false }),
    };
    return this.get('x:' + nom, defs[nom]);
  }
}

// ---------- géométrie ----------
const GEO = new THREE.BoxGeometry(1, 1, 1);
function boite(parent, mat, w, h, d, x, y, z, ombre = true) {
  const m = new THREE.Mesh(GEO, mat);
  m.scale.set(w, h, d); m.position.set(x, y, z);
  m.castShadow = ombre; m.receiveShadow = true;
  parent.add(m); return m;
}
// façades et plans aux arêtes légèrement adoucies : elles accrochent la lumière comme les vraies
const GEO_ARRONDIES = new Map();
function boiteArrondie(parent, mat, w, h, d, x, y, z, r = 0.0025) {
  const cle = [w, h, d].map((v) => Math.round(v * 1000)).join(':');
  if (!GEO_ARRONDIES.has(cle)) GEO_ARRONDIES.set(cle, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, d / 2 - 0.0005, h / 2 - 0.0005)));
  const m = new THREE.Mesh(GEO_ARRONDIES.get(cle), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
const PLINTHE = 0.1, CAISSON = 0.76, JEU = 0.003, EP = 0.022;

// Une façade (porte ou tiroir) centrée en (x, y), posée sur le plan z, tournée vers +z.
function facade(g, c, w, h, x, y, z, { horizontale = false } = {}) {
  const { mats, porte } = c;
  const mat = mats.finition(c.fin, { largeur: w, hauteur: h, rainure: porte === 'rainure' });
  if (porte === 'cadre' || porte === 'alu') {
    const b = porte === 'alu' ? 0.018 : 0.06;
    const mb = porte === 'alu' ? mats.fixe('alu') : mat;
    boite(g, mb, w - JEU, b, EP, x, y + h / 2 - b / 2, z + EP / 2);
    boite(g, mb, w - JEU, b, EP, x, y - h / 2 + b / 2, z + EP / 2);
    boite(g, mb, b, h - 2 * b, EP, x - w / 2 + b / 2, y, z + EP / 2);
    boite(g, mb, b, h - 2 * b, EP, x + w / 2 - b / 2, y, z + EP / 2);
    boite(g, mat, w - 2 * b, h - 2 * b, EP * 0.6, x, y, z + EP * 0.3);
  } else {
    boiteArrondie(g, mat, w - JEU, h - JEU, EP, x, y, z + EP / 2);
  }
  if (porte === 'chant') boite(g, mats.fixe('ombre'), w - JEU, 0.012, 0.004, x, y + h / 2 - 0.008, z + EP, false);
  if (porte === 'profil') {
    const pm = mats.poignee(c.teinte); const t = 0.012;
    boite(g, pm, t, h - JEU, EP + 0.004, x - w / 2 + t / 2, y, z + EP / 2, false);
    boite(g, pm, t, h - JEU, EP + 0.004, x + w / 2 - t / 2, y, z + EP / 2, false);
    boite(g, pm, w - JEU, 0.03, EP + 0.004, x, y + h / 2 - 0.015, z + EP / 2, false);
    return;
  }
  // poignées rapportées
  const pm = mats.poignee(c.teinte);
  if (c.poignee === 'maniglia') {
    if (horizontale) boite(g, pm, Math.min(0.42, w * 0.6), 0.012, 0.025, x, y + h / 2 - 0.05, z + EP + 0.0125);
    else boite(g, pm, 0.012, Math.min(0.32, h * 0.4), 0.025, x + w / 2 - 0.05, y + (h > 1 ? -h / 2 + 0.95 - y + y : 0), z + EP + 0.0125);
  } else if (c.poignee === 'logica') {
    boite(g, pm, Math.min(0.24, w * 0.5), 0.016, 0.03, x, y + h / 2 - 0.02, z + EP + 0.004);
  }
}

function gorgeHorizontale(g, c, w, y, z) {
  if (c.poignee !== 'gorge' || c.porte === 'profil') return;
  boite(g, c.mats.poignee(c.teinte), w, 0.03, 0.012, 0, y, z - 0.008, false);
}

function caissonBas(g, c, l, P) {
  boite(g, c.mats.fixe('ombre'), l, PLINTHE, P - 0.06, 0, PLINTHE / 2, (P - 0.06) / 2);
  boite(g, c.mats.finition(c.fin, { largeur: P, hauteur: CAISSON }), l, CAISSON, P - EP, 0, PLINTHE + CAISSON / 2, (P - EP) / 2);
}

function planDeTravail(g, c, l, P, x = 0, z = 0) {
  const ep = EP_PLAN[FIN[c.plan]?.fid] || 0.03;
  boiteArrondie(g, c.mats.plan(c.plan, l), l, ep, P + 0.02, x, PLINTHE + CAISSON + ep / 2, z + (P + 0.02) / 2, 0.004);
  return PLINTHE + CAISSON + ep;
}

function frontsBas(g, c, def, l, P) {
  const gorge = c.poignee === 'gorge' && c.porte !== 'profil';
  const hF = CAISSON - (gorge ? 0.035 : 0);
  const zF = P - EP;
  gorgeHorizontale(g, c, l, PLINTHE + CAISSON - 0.018, zF);
  const y0 = PLINTHE;
  if (def.faces === 'tiroirs') {
    const hs = [hF * 0.28, hF * 0.36, hF * 0.36]; let y = y0 + hF;
    hs.forEach((h) => { y -= h; facade(g, c, l, h, 0, y + h / 2, zF, { horizontale: true }); });
  } else if (def.faces === 'portes') {
    facade(g, c, l / 2, hF, -l / 4, y0 + hF / 2, zF); facade(g, c, l / 2, hF, l / 4, y0 + hF / 2, zF);
  } else {
    facade(g, c, l, hF, 0, y0 + hF / 2, zF, { horizontale: def.faces === 'panneau' });
  }
}

function equiper(g, c, def, l, P, yPlan) {
  if (def.equip === 'plaque') boite(g, c.mats.fixe('verre'), Math.min(l - 0.04, 0.86), 0.006, 0.5, 0, yPlan + 0.003, P / 2);
  if (def.equip === 'evier') {
    boite(g, c.mats.fixe('ombre'), Math.min(0.5, l * 0.6), 0.004, 0.4, -l * 0.12, yPlan + 0.001, P / 2 + 0.03, false);
    const pm = c.teinte === 'antique-gold' ? c.mats.poignee('antique-gold') : c.mats.fixe('inox');
    const fut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.34, 20), pm); fut.position.set(-l * 0.12, yPlan + 0.17, 0.1); fut.castShadow = true;
    const bec = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 16), pm); bec.rotation.x = Math.PI / 2; bec.position.set(-l * 0.12, yPlan + 0.33, 0.2);
    g.add(fut, bec);
  }
}

// Construit un meuble. m = { type: clé de MEUBLES, accent: bool } ; c = finitions globales.
export function construireMeuble(m, cfg, mats) {
  const def = MEUBLES[m.type];
  const g = new THREE.Group();
  const c = { mats, porte: MODELES[cfg.modele]?.porte || 'lisse', fin: m.accent ? cfg.accent : cfg.facade,
    plan: cfg.plan, poignee: cfg.poignee, teinte: cfg.teinte };
  const l = def.l, P = PROFONDEUR[def.type];

  if (def.type === 'bas') {
    caissonBas(g, c, l, P);
    frontsBas(g, c, def, l, P);
    const yPlan = planDeTravail(g, c, l, P, 0, -0.0);
    equiper(g, c, def, l, P, yPlan);
  }

  if (def.type === 'colonne') {
    const H = 2.25;
    boite(g, mats.fixe('ombre'), l, PLINTHE, P - 0.06, 0, PLINTHE / 2, (P - 0.06) / 2);
    boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H - PLINTHE, P - EP, 0, PLINTHE + (H - PLINTHE) / 2, (P - EP) / 2);
    const zF = P - EP;
    if (def.equip === 'four') {
      const yF = 0.95, hF = 0.6;
      facade(g, c, l, yF - PLINTHE, 0, PLINTHE + (yF - PLINTHE) / 2, zF, { horizontale: true });
      boite(g, mats.fixe('verre'), l - 0.01, hF - 0.01, 0.025, 0, yF + hF / 2, zF + 0.0125);
      boite(g, mats.fixe('inox'), l * 0.75, 0.012, 0.02, 0, yF + hF - 0.06, zF + 0.035, false);
      facade(g, c, l, H - yF - hF, 0, (yF + hF + H) / 2, zF);
    } else {
      const hBas = 1.35;
      facade(g, c, l, hBas - PLINTHE, 0, PLINTHE + (hBas - PLINTHE) / 2, zF);
      facade(g, c, l, H - hBas, 0, hBas + (H - hBas) / 2, zF);
    }
    if (c.poignee === 'gorge' && c.porte !== 'profil') boite(g, mats.poignee(c.teinte), 0.008, H - PLINTHE, 0.006, l / 2 - 0.004, PLINTHE + (H - PLINTHE) / 2, zF + 0.002, false);
  }

  if (def.type === 'haut') {
    const y0 = 1.5, H = 0.72;
    if (def.equip === 'hotte') {
      boite(g, mats.poignee(c.teinte), l, 0.06, 0.5, 0, 1.62, 0.25);
      boite(g, mats.poignee(c.teinte), 0.32, 0.9, 0.26, 0, 2.1, 0.13);
      boite(g, mats.fixe('led'), l - 0.1, 0.004, 0.04, 0, 1.588, 0.4, false);
    } else {
      boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H, P - EP, 0, y0 + H / 2, (P - EP) / 2);
      if (l > 0.65) { facade(g, c, l / 2, H, -l / 4, y0 + H / 2, P - EP); facade(g, c, l / 2, H, l / 4, y0 + H / 2, P - EP); }
      else facade(g, c, l, H, 0, y0 + H / 2, P - EP);
      boite(g, mats.fixe('led'), l - 0.04, 0.006, 0.02, 0, y0 - 0.004, P - 0.06, false);
    }
  }

  if (def.type === 'ilot') {
    // côté travail vers -z (dos de l'îlot = côté salon, +z)
    const Pw = 0.6;
    const cote = new THREE.Group();
    caissonBas(cote, c, l, Pw);
    frontsBas(cote, c, { faces: 'tiroirs' }, l, Pw);
    cote.rotation.y = Math.PI; cote.position.z = Pw / 2;
    g.add(cote);
    const ep = Math.max(0.03, (EP_PLAN[FIN[c.plan]?.fid] || 0.03) * 2);
    const hBase = PLINTHE + CAISSON;
    const prof = def.bar ? 1.0 : 0.66;
    boite(g, mats.finition(c.fin, { largeur: l, hauteur: hBase }), l, hBase - PLINTHE, 0.02, 0, PLINTHE + (hBase - PLINTHE) / 2, Pw / 2 + 0.01);
    const zc = -Pw / 2 - 0.03 + prof / 2;
    boiteArrondie(g, mats.plan(c.plan, l), l + 0.04, ep, prof, 0, hBase + ep / 2, zc, 0.004);
    for (const s of [-1, 1]) boite(g, mats.plan(c.plan, 1), ep, hBase + ep, prof, s * (l / 2 + 0.02 + ep / 2), (hBase + ep) / 2, zc);
    boite(g, mats.fixe('verre'), 0.8, 0.006, 0.5, 0, hBase + ep + 0.003, -0.02);
    if (def.bar) {
      const nb = Math.max(2, Math.floor(l / 0.65));
      for (let i = 0; i < nb; i++) {
        const x = -l / 2 + (l / nb) * (i + 0.5);
        const t = new THREE.Group(); t.position.set(x, 0, Pw / 2 + 0.3);
        const assise = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.06, 32), mats.fixe('cuir')); assise.position.y = 0.7; assise.castShadow = true;
        const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.68, 12), mats.poignee(c.teinte)); pied.position.y = 0.34;
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.015, 32), mats.poignee(c.teinte)); base.position.y = 0.008;
        t.add(assise, pied, base); g.add(t);
      }
    }
  }
  g.userData.meuble = m;
  return g;
}

// Emprise au sol d'un meuble (rectangle en coordonnées locales) : pour les sélections et les collisions.
export function emprise(type) {
  const def = MEUBLES[type]; const P = PROFONDEUR[def.type];
  if (def.type === 'ilot') return { x0: -def.l / 2 - 0.05, x1: def.l / 2 + 0.05, z0: -0.33, z1: def.bar ? 0.72 : 0.36 };
  return { x0: -def.l / 2, x1: def.l / 2, z0: 0, z1: P };
}

// Implantations de départ
export function depart(nom, W) {
  const L = [];
  const ligne = (types, x0, opts = {}) => {
    let x = x0;
    for (const t of types) { const l = MEUBLES[t].l; L.push({ type: t, x: x + l / 2, z: 0, r: 0, accent: accentParDefaut(MEUBLES[t].type), ...opts }); x += l; }
    return x;
  };
  if (nom === 'vide') return L;
  const x0 = -W / 2;
  if (nom === 'lineaire') {
    const fin = ligne(['col-frigo-60', 'col-four-60', 'tiroirs-60', 'plaque-90', 'tiroirs-60', 'evier-90', 'lv-60'], Math.max(x0, -2.3));
    ligne(['haut-60', 'hotte-90', 'haut-60'], Math.max(x0, -2.3) + 1.8);
    return L.filter((m) => m.x < fin + 1);
  }
  if (nom === 'angle') {
    ligne(['col-frigo-60', 'col-four-60', 'tiroirs-60', 'evier-90', 'lv-60', 'tiroirs-60'], x0);
    // retour sur le mur de droite
    let z = 0.6;
    for (const t of ['tiroirs-60', 'plaque-90', 'tiroirs-60']) { const l = MEUBLES[t].l; L.push({ type: t, x: W / 2, z: z + l / 2, r: -Math.PI / 2, accent: false }); z += l; }
    return L;
  }
  if (nom === 'ilot') {
    ligne(['col-frigo-60', 'col-four-60', 'col-rgt-60', 'tiroirs-60', 'evier-90', 'lv-60', 'tiroirs-60'], Math.max(x0, -2.1));
    L.push({ type: 'ilot-240', x: 0, z: 2.0, r: 0, accent: true });
    return L;
  }
  return L;
}
