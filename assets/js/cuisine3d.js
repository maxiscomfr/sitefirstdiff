// Cuisine 3D procédurale : construit une cuisine Armony stylisée à partir d'une configuration.
// Utilisée par le portail d'entrée (mise en scène) et par le configurateur.
import * as THREE from 'three';

export const MODELES = {
  yota: { nom: 'Yota', porte: 'lisse', note: 'Façade lisse, gorge d’ouverture' },
  rho: { nom: 'Rho', porte: 'lisse', note: 'Façade 22 mm, gorge d’ouverture' },
  system: { nom: 'System', porte: 'profil', note: 'Profilés métalliques apparents' },
  riga: { nom: 'Riga', porte: 'rainure', note: 'Façade rainurée verticale' },
  skyline: { nom: 'Skyline', porte: 'horizon', note: 'Ligne d’horizon dans la façade' },
  quadro: { nom: 'Quadro', porte: 'cadre', note: 'Façade cadre' },
};

export const FACADES = {
  'neve': { nom: 'Neve', famille: 'Laque mate', couleur: '#EEECE6', r: 0.55, m: 0 },
  'talco': { nom: 'Talco', famille: 'Laque micalisée', couleur: '#E2DDD3', r: 0.4, m: 0.15 },
  'nebbia': { nom: 'Nebbia', famille: 'Stratifié mat', couleur: '#C8C3B8', r: 0.72, m: 0 },
  'arenaria': { nom: 'Arenaria', famille: 'Micalux', couleur: '#CDBFA9', r: 0.45, m: 0.2 },
  'salvia': { nom: 'Salvia', famille: 'Stratifié mat', couleur: '#8F9A84', r: 0.75, m: 0 },
  'blu-petrolio': { nom: 'Blu Petrolio', famille: 'Laque micalisée', couleur: '#1F3E47', r: 0.35, m: 0.25 },
  'polaris-midnight': { nom: 'Polaris Midnight', famille: 'Laque Polaris', couleur: '#1C2230', r: 0.25, m: 0.1 },
  'moka': { nom: 'Moka', famille: 'Laque mate', couleur: '#4B3B31', r: 0.6, m: 0 },
  'lavagna': { nom: 'Lavagna', famille: 'Laque gaufrée', couleur: '#3A3B3B', r: 0.82, m: 0 },
  'x-black': { nom: 'X-Black Matt', famille: 'UV X-Matt', couleur: '#19191A', r: 0.85, m: 0 },
  'ambra': { nom: 'Ambra', famille: 'Laque métal', couleur: '#8A6A42', r: 0.35, m: 0.7 },
  'satin-brass': { nom: 'Satin Brass', famille: 'X-Steel', couleur: '#A88C57', r: 0.3, m: 0.9 },
  'silver-spark': { nom: 'Silver Spark', famille: 'Stratifié métal', couleur: '#A7A9AA', r: 0.35, m: 0.8 },
  'noce-elegante': { nom: 'Noce Elegante', famille: 'Bois', couleur: '#6A4A36', r: 0.6, m: 0, bois: true },
  'olmo-naturale': { nom: 'Olmo Naturale', famille: 'Bois', couleur: '#B08A63', r: 0.6, m: 0, bois: true },
  'quercia-notte': { nom: 'Quercia Notte', famille: 'Bois', couleur: '#3E322A', r: 0.62, m: 0, bois: true },
  'station-chene': { nom: 'Station', famille: 'Chêne de fil', couleur: '#BC9670', r: 0.6, m: 0, bois: true },
};

export const PLANS = {
  'calacatta-black': { nom: 'Calacatta Black', famille: 'Grès', fond: '#1D1D1E', veine: '#D8D5CF', type: 'marbre', ep: 0.02 },
  'onyx-white': { nom: 'Onyx White', famille: 'Grès', fond: '#ECE9E3', veine: '#B9B1A4', type: 'marbre', ep: 0.02 },
  'taj-mahal': { nom: 'Taj Mahal', famille: 'Grès', fond: '#E5DBCB', veine: '#B39B79', type: 'marbre', ep: 0.02 },
  'travertino': { nom: 'Travertino Bianco', famille: 'Grès', fond: '#DED4C3', veine: '#C6B79E', type: 'travertin', ep: 0.02 },
  'pietra-grey': { nom: 'Pietra Grey', famille: 'Laminam', fond: '#5E5C5A', veine: '#7D7B78', type: 'marbre', ep: 0.012 },
  'smoke-stone': { nom: 'Smoke Stone', famille: 'Stratifié structuré', fond: '#8A847D', veine: '#99938B', type: 'grain', ep: 0.03 },
  'fenix-nero': { nom: 'Fenix Nero', famille: 'Stratifié 12 mm', fond: '#1B1B1C', veine: '#1B1B1C', type: 'uni', ep: 0.012 },
};

export const PROFILS = {
  'noir': { nom: 'Noir', couleur: '#151515', r: 0.45, m: 0.6 },
  'or-antique': { nom: 'Or antique', couleur: '#A68A55', r: 0.32, m: 1 },
  'titane': { nom: 'Titane', couleur: '#7E7D79', r: 0.3, m: 1 },
  'inox': { nom: 'Inox brossé', couleur: '#B9BAB8', r: 0.28, m: 1 },
};

export const IMPLANTATIONS = {
  'lineaire': { nom: 'Linéaire', note: 'Tout sur un mur' },
  'angle': { nom: 'En L', note: 'Deux murs en angle' },
  'ilot': { nom: 'Linéaire + îlot', note: 'Un mur et un îlot central' },
  'angle-ilot': { nom: 'En L + îlot', note: 'Le grand projet' },
};

export const CONFIG_DEFAUT = {
  modele: 'yota', implantation: 'ilot', longueur: 4.2,
  facade: 'talco', accent: 'noce-elegante', plan: 'calacatta-black', profil: 'noir',
  colonnes: 3, hauts: false, cascade: true, hotte: 'plafond', bar: true, suspensions: true,
};

// ---------- textures procédurales ----------
const cacheTex = new Map();

function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function texBois(couleur) {
  const cle = 'bois';
  if (cacheTex.has(cle)) return cacheTex.get(cle);
  const c = document.createElement('canvas'); c.width = 256; c.height = 1024;
  const g = c.getContext('2d'); const r = rnd(7);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 140; i++) {
    const x0 = r() * c.width; const amp = 2 + r() * 6; const f = 0.004 + r() * 0.01;
    g.strokeStyle = `rgba(60,40,25,${0.05 + r() * 0.12})`; g.lineWidth = 0.6 + r() * 2.2;
    g.beginPath();
    for (let y = 0; y <= c.height; y += 8) { const x = x0 + Math.sin(y * f + i) * amp; y ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8; cacheTex.set(cle, t); return t;
}

function texRainures() {
  if (cacheTex.has('rainure')) return cacheTex.get('rainure');
  const c = document.createElement('canvas'); c.width = 128; c.height = 8;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 8);
  g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, 10, 8); g.fillStyle = '#d0d0d0'; g.fillRect(10, 0, 4, 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cacheTex.set('rainure', t); return t;
}

function texPierre(def) {
  const cle = 'pierre:' + def.fond + def.veine + def.type;
  if (cacheTex.has(cle)) return cacheTex.get(cle);
  const c = document.createElement('canvas'); c.width = 2048; c.height = 512;
  const g = c.getContext('2d'); const r = rnd(def.fond.length * 97 + def.veine.charCodeAt(2));
  g.fillStyle = def.fond; g.fillRect(0, 0, c.width, c.height);
  if (def.type === 'marbre') {
    // nuages doux puis veines
    for (let i = 0; i < 60; i++) {
      g.globalAlpha = 0.04; g.fillStyle = def.veine;
      g.beginPath(); g.ellipse(r() * c.width, r() * c.height, 80 + r() * 300, 30 + r() * 120, r() * 3, 0, 7); g.fill();
    }
    g.globalAlpha = 1; g.strokeStyle = def.veine; g.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      let x = r() * c.width; let y = r() < 0.5 ? 0 : c.height * r(); const ang = -0.4 + r() * 0.8;
      g.lineWidth = 0.6 + r() * (i < 5 ? 5 : 1.8); g.globalAlpha = 0.35 + r() * 0.55;
      g.filter = i < 5 ? 'blur(1.2px)' : 'none';
      g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 70; s++) { x += Math.cos(ang) * 18 + (r() - 0.5) * 22; y += Math.sin(ang) * 18 + (r() - 0.5) * 26 + 4; g.lineTo(x, y); }
      g.stroke();
    }
    g.filter = 'none';
  } else if (def.type === 'travertin') {
    for (let y = 0; y < c.height; y += 2) {
      g.globalAlpha = 0.08 + r() * 0.18; g.fillStyle = r() < 0.5 ? def.veine : '#efe8dc';
      g.fillRect(0, y, c.width, 1 + r() * 4);
    }
    g.globalAlpha = 0.25; g.fillStyle = '#b8a888';
    for (let i = 0; i < 300; i++) g.fillRect(r() * c.width, r() * c.height, 3 + r() * 30, 1 + r() * 2);
  } else if (def.type === 'grain') {
    const d = g.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < d.data.length; i += 4) { const n = (r() - 0.5) * 26; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; }
    g.putImageData(d, 0, 0);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8; cacheTex.set(cle, t); return t;
}

// ---------- matériaux ----------
export class Materiaux {
  constructor() { this.cache = new Map(); }
  get(cle, fab) { if (!this.cache.has(cle)) this.cache.set(cle, fab()); return this.cache.get(cle); }

  facade(id, porte, largeur = 0.6, vertical = true) {
    const f = FACADES[id] || FACADES.neve;
    const rainure = porte === 'rainure';
    const cle = `f:${id}:${rainure ? Math.round(largeur * 100) : ''}`;
    return this.get(cle, () => {
      const mat = new THREE.MeshStandardMaterial({ color: f.couleur, roughness: f.r, metalness: f.m, envMapIntensity: 0.9 });
      if (rainure) {
        const t = texRainures().clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, Math.round(largeur / 0.03)), 1); mat.map = t;
      } else if (f.bois) {
        const t = texBois().clone(); t.needsUpdate = true; t.repeat.set(largeur / 0.6, vertical ? 1 : 1); mat.map = t;
      }
      return mat;
    });
  }

  plan(id, longueur = 2) {
    const p = PLANS[id] || PLANS['calacatta-black'];
    return this.get(`p:${id}:${longueur.toFixed(1)}`, () => {
      const mat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: p.type === 'uni' ? 0.9 : 0.22, metalness: 0,
        clearcoat: p.type === 'marbre' ? 0.6 : 0, clearcoatRoughness: 0.25 });
      if (p.type === 'uni') mat.color.set(p.fond);
      else { const t = texPierre(p).clone(); t.needsUpdate = true; t.repeat.set(Math.max(0.5, longueur / 3), 1); mat.map = t; }
      return mat;
    });
  }

  profil(id) {
    const p = PROFILS[id] || PROFILS.noir;
    return this.get('pr:' + id, () => new THREE.MeshStandardMaterial({ color: p.couleur, roughness: p.r, metalness: p.m }));
  }

  fixe(nom) {
    const defs = {
      ombre: () => new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.9 }),
      verre: () => new THREE.MeshPhysicalMaterial({ color: '#0a0a0b', roughness: 0.08, metalness: 0.2, clearcoat: 1 }),
      inox: () => new THREE.MeshStandardMaterial({ color: '#c9cacb', roughness: 0.25, metalness: 1 }),
      led: () => new THREE.MeshBasicMaterial({ color: '#ffe2b0' }),
      lampe: () => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4, metalness: 0.7, emissive: '#000' }),
      ampoule: () => new THREE.MeshBasicMaterial({ color: '#ffd9a0' }),
      cable: () => new THREE.MeshBasicMaterial({ color: '#111' }),
      cuir: () => new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.7 }),
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

const PLINTHE = 0.1, CAISSON = 0.76, PROF = 0.6, JEU = 0.003;

// Une façade (porte ou tiroir) dans le plan XY, face avant tournée vers +z.
function facadeEl(g, ctx, matId, w, h, x, y, z) {
  const { mats, porte, profil } = ctx;
  const ep = 0.02;
  const mat = mats.facade(matId, porte, w);
  if (porte === 'cadre') {
    const b = 0.06;
    boite(g, mat, w - JEU, b, ep, x, y + h / 2 - b / 2, z + ep / 2);
    boite(g, mat, w - JEU, b, ep, x, y - h / 2 + b / 2, z + ep / 2);
    boite(g, mat, b, h - 2 * b, ep, x - w / 2 + b / 2, y, z + ep / 2);
    boite(g, mat, b, h - 2 * b, ep, x + w / 2 - b / 2, y, z + ep / 2);
    boite(g, mat, w - 2 * b - 0.01, h - 2 * b - 0.01, ep * 0.5, x, y, z + ep * 0.25);
  } else {
    boite(g, mat, w - JEU, h - JEU, ep, x, y, z + ep / 2);
  }
  if (porte === 'profil') {
    const pm = mats.profil(profil); const t = 0.012;
    boite(g, pm, t, h - JEU, ep + 0.004, x - w / 2 + t / 2, y, z + ep / 2, false);
    boite(g, pm, t, h - JEU, ep + 0.004, x + w / 2 - t / 2, y, z + ep / 2, false);
  }
  if (porte === 'horizon') {
    boite(g, mats.profil(profil), w - JEU, 0.008, 0.004, x, y + h / 2 - 0.09, z + ep + 0.001, false);
  }
}

// Une ligne de meubles bas posée contre z=0, de x=0 à x=L, avec ses équipements.
function ligneBasse(ctx, L, opts = {}) {
  const g = new THREE.Group();
  const { mats } = ctx;
  const matCaisson = mats.facade(opts.facade, 'lisse');
  boite(g, mats.fixe('ombre'), L, PLINTHE, PROF - 0.06, L / 2, PLINTHE / 2, (PROF - 0.06) / 2);
  boite(g, matCaisson, L, CAISSON, PROF - 0.02, L / 2, PLINTHE + CAISSON / 2, (PROF - 0.02) / 2);
  // modules
  const n = Math.max(1, Math.round(L / 0.6)); const w = L / n;
  const zF = PROF - 0.02;
  const gola = ctx.porte !== 'profil';
  const hFront = CAISSON - (gola ? 0.035 : 0);
  if (gola) boite(g, mats.profil(ctx.profil), L, 0.03, 0.01, L / 2, PLINTHE + CAISSON - 0.018, zF - 0.02, false);
  for (let i = 0; i < n; i++) {
    const x = w * i + w / 2;
    const tiroirs = (i % 2 === 0) || opts.equip?.[i] === 'plaque';
    if (tiroirs) {
      const hs = [hFront * 0.28, hFront * 0.36, hFront * 0.36];
      let y = PLINTHE + hFront;
      hs.forEach((h) => { y -= h; facadeEl(g, ctx, opts.facade, w, h, x, y + h / 2, zF); });
    } else {
      facadeEl(g, ctx, opts.facade, w, hFront, x, PLINTHE + hFront / 2, zF);
    }
  }
  // plan de travail
  const pdef = PLANS[ctx.plan];
  const ep = Math.max(0.012, pdef.ep);
  const yPlan = PLINTHE + CAISSON + ep / 2;
  const plan = boite(g, mats.plan(ctx.plan, L), L + (opts.debord ?? 0), ep, PROF + 0.02, L / 2 + (opts.debordX ?? 0), yPlan, (PROF + 0.02) / 2);
  g.userData.hautPlan = PLINTHE + CAISSON + ep;
  // équipements
  (opts.equip || []).forEach((type, i) => {
    if (!type) return;
    const x = w * i + w / 2; const y = PLINTHE + CAISSON + ep;
    if (type === 'plaque') boite(g, mats.fixe('verre'), Math.min(0.58, w * 0.95), 0.006, 0.5, x, y + 0.003, PROF / 2);
    if (type === 'evier') {
      boite(g, mats.fixe('ombre'), Math.min(0.5, w * 0.8), 0.004, 0.4, x, y + 0.001, PROF / 2 + 0.03, false);
      const robinet = new THREE.Group(); robinet.position.set(x, y, 0.12);
      const pm = ctx.profil === 'or-antique' ? mats.profil('or-antique') : mats.fixe('inox');
      const fut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.34, 20), pm); fut.position.y = 0.17; fut.castShadow = true;
      const bec = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 16), pm); bec.rotation.x = Math.PI / 2; bec.position.set(0, 0.33, 0.1);
      robinet.add(fut, bec); g.add(robinet);
    }
  });
  return g;
}

function colonnes(ctx, n, matId, opts = {}) {
  const g = new THREE.Group(); const { mats } = ctx;
  const H = 2.25; const w = 0.6; const L = n * w;
  boite(g, mats.fixe('ombre'), L, PLINTHE, PROF - 0.06, L / 2, PLINTHE / 2, (PROF - 0.06) / 2);
  boite(g, mats.facade(matId, 'lisse'), L, H - PLINTHE, PROF, L / 2, PLINTHE + (H - PLINTHE) / 2, PROF / 2);
  for (let i = 0; i < n; i++) {
    const x = w * i + w / 2; const zF = PROF;
    if (opts.four && i === opts.four) {
      const yF = 0.95, hF = 0.6;
      facadeEl(g, ctx, matId, w, yF - PLINTHE, x, PLINTHE + (yF - PLINTHE) / 2, zF);
      boite(g, mats.fixe('verre'), w - 0.01, hF - 0.01, 0.025, x, yF + hF / 2, zF + 0.0125);
      boite(g, mats.fixe('inox'), w * 0.75, 0.012, 0.02, x, yF + hF - 0.06, zF + 0.035, false);
      facadeEl(g, ctx, matId, w, H - yF - hF, x, (yF + hF + H) / 2, zF);
    } else {
      const hBas = 1.35;
      facadeEl(g, ctx, matId, w, hBas - PLINTHE, x, PLINTHE + (hBas - PLINTHE) / 2, zF);
      facadeEl(g, ctx, matId, w, H - hBas, x, hBas + (H - hBas) / 2, zF);
    }
  }
  if (ctx.porte !== 'profil') {
    // gorges verticales dessinées par le profilé
    for (let i = 1; i < n; i++) boite(g, mats.profil(ctx.profil), 0.006, H - PLINTHE, 0.004, i * w, PLINTHE + (H - PLINTHE) / 2, PROF + 0.021, false);
  }
  g.userData.largeur = L;
  return g;
}

function hauts(ctx, L, matId) {
  const g = new THREE.Group(); const { mats } = ctx;
  const y0 = 1.5, H = 0.72, P = 0.36;
  boite(g, mats.facade(matId, 'lisse'), L, H, P - 0.02, L / 2, y0 + H / 2, (P - 0.02) / 2);
  const n = Math.max(1, Math.round(L / 0.6)); const w = L / n;
  for (let i = 0; i < n; i++) facadeEl(g, ctx, matId, w, H, w * i + w / 2, y0 + H / 2, P - 0.02);
  boite(g, mats.fixe('led'), L - 0.04, 0.006, 0.02, L / 2, y0 - 0.004, P - 0.06, false);
  return g;
}

// Hauts à façades vitrées (verrières) : cadre fin, verre, fond et étagères éclairés par des LED.
function hautsVerriere(ctx, L) {
  const g = new THREE.Group(); const { mats } = ctx;
  const y0 = 1.5, H = 0.78, P = 0.34, ep = 0.02;
  const n = Math.max(1, Math.round(L / 0.6)); const w = L / n;
  const cadre = mats.profil(ctx.profil);
  const verre = new THREE.MeshStandardMaterial({ color: '#c9d4d6', transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.1, depthWrite: false });
  const lueur = new THREE.MeshBasicMaterial({ color: '#ffd9a3' });
  const fond = new THREE.MeshStandardMaterial({ color: '#241d17', roughness: 0.6, emissive: '#ffb866', emissiveIntensity: 0.16 });
  // caisson ouvert : fond, dessus, dessous, flancs
  boite(g, fond, L, H, 0.01, L / 2, y0 + H / 2, 0.005);
  boite(g, cadre, L, 0.02, P, L / 2, y0 + H - 0.01, P / 2);
  boite(g, cadre, L, 0.02, P, L / 2, y0 + 0.01, P / 2);
  for (let i = 0; i <= n; i++) boite(g, cadre, 0.02, H, P, i * w, y0 + H / 2, P / 2);
  // étagères et LED : une sous chaque étagère, une sous le meuble
  const niveaux = [y0 + H * 0.36, y0 + H * 0.68];
  for (const y of niveaux) {
    boite(g, cadre, L - 0.02, 0.012, P - 0.04, L / 2, y, P / 2, false);
    boite(g, lueur, L - 0.06, 0.006, 0.014, L / 2, y - 0.009, 0.06, false);
  }
  boite(g, lueur, L - 0.06, 0.006, 0.014, L / 2, y0 + H - 0.023, 0.06, false);
  boite(g, lueur, L - 0.04, 0.006, 0.02, L / 2, y0 - 0.004, P - 0.06, false);
  // objets : verres et vaisselle simples posés sur les étagères
  for (let i = 0; i < n; i++) {
    const cx = w * i + w / 2;
    for (const y of [y0 + 0.012, ...niveaux.map((v) => v + 0.012)]) {
      for (const dx of [-0.13, 0, 0.13]) {
        const v = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.1, 16), verre);
        v.position.set(cx + dx, y + 0.05, 0.14); g.add(v);
      }
    }
  }
  // portes vitrées avec cadre fin
  for (let i = 0; i < n; i++) {
    const x = w * i + w / 2, z = P + ep / 2, b = 0.025;
    boite(g, cadre, w - JEU, b, ep, x, y0 + H - b / 2, z);
    boite(g, cadre, w - JEU, b, ep, x, y0 + b / 2, z);
    boite(g, cadre, b, H - 2 * b, ep, x - w / 2 + b / 2, y0 + H / 2, z);
    boite(g, cadre, b, H - 2 * b, ep, x + w / 2 - b / 2, y0 + H / 2, z);
    const vitre = boite(g, verre, w - 2 * b, H - 2 * b, 0.004, x, y0 + H / 2, z, false); vitre.renderOrder = 2;
    boite(g, cadre, 0.012, 0.16, 0.012, x + w / 2 - 0.07, y0 + H / 2 - 0.2, z + 0.015, false);
  }
  return g;
}

function ilot(ctx, L, D) {
  const g = new THREE.Group(); const { mats } = ctx;
  const P = 0.6;
  const ligne = ligneBasse(ctx, L, { facade: ctx.accent, equip: Array.from({ length: Math.round(L / 0.6) }, (_, i) => i === Math.floor(Math.round(L / 0.6) / 2) ? 'plaque' : null) });
  // la ligne est orientée face au mur du fond (vers -z) : on la retourne
  ligne.rotation.y = Math.PI; ligne.position.set(L / 2, 0, P / 2);
  g.add(ligne);
  const hPlan = ligne.userData.hautPlan;
  const pdef = PLANS[ctx.plan]; const ep = Math.max(0.03, pdef.ep * 2.5);
  // dos côté salon
  const debord = ctx.bar ? D - P : 0;
  boite(g, mats.facade(ctx.accent, ctx.porte, L), L, hPlan - PLINTHE - 0.01, 0.02, 0, PLINTHE + (hPlan - PLINTHE) / 2, P / 2 + 0.01);
  // plateau complet par-dessus
  const prof = P + debord + 0.04;
  boite(g, mats.plan(ctx.plan, L), L + 0.04, ep, prof, 0, hPlan + ep / 2, -P / 2 + prof / 2 - 0.02);
  if (ctx.cascade) {
    for (const s of [-1, 1]) boite(g, mats.plan(ctx.plan, 1), ep, hPlan + ep, prof, s * (L / 2 + 0.02 + ep / 2), (hPlan + ep) / 2, -P / 2 + prof / 2 - 0.02);
  }
  // tabourets
  if (ctx.bar) {
    const nb = Math.max(2, Math.floor(L / 0.65));
    for (let i = 0; i < nb; i++) {
      const x = -L / 2 + (L / nb) * (i + 0.5);
      const t = new THREE.Group(); t.position.set(x, 0, P / 2 + debord - 0.05);
      const assise = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.06, 32), mats.fixe('cuir')); assise.position.y = 0.7; assise.castShadow = true;
      const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.68, 12), mats.profil(ctx.profil)); pied.position.y = 0.34; pied.castShadow = true;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.015, 32), mats.profil(ctx.profil)); base.position.y = 0.008;
      const repose = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 8, 40), mats.profil(ctx.profil)); repose.rotation.x = Math.PI / 2; repose.position.y = 0.3;
      t.add(assise, pied, base, repose); g.add(t);
    }
  }
  g.userData.hautPlan = hPlan + ep;
  return g;
}

function suspensions(ctx, L, y0) {
  const g = new THREE.Group(); const { mats } = ctx;
  const nb = L > 2.4 ? 3 : 2;
  for (let i = 0; i < nb; i++) {
    const x = -L / 2 + (L / nb) * (i + 0.5);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 3.2 - y0, 6), mats.fixe('cable')); c.position.set(x, (3.2 + y0) / 2 + 0.1, 0);
    const abat = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 0.22, 40, 1, true), mats.profil(ctx.profil));
    abat.material.side = THREE.DoubleSide; abat.position.set(x, y0, 0);
    const bulbe = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 12), mats.fixe('ampoule')); bulbe.position.set(x, y0 - 0.07, 0);
    g.add(c, abat, bulbe);
  }
  return g;
}

function hottePlafond(ctx, L) {
  const g = new THREE.Group(); const { mats } = ctx;
  boite(g, mats.profil(ctx.profil), Math.min(1.2, L * 0.5), 0.06, 0.5, 0, 2.1, 0);
  boite(g, mats.fixe('led'), Math.min(1.1, L * 0.45), 0.004, 0.04, 0, 2.068, 0.18, false);
  boite(g, mats.fixe('led'), Math.min(1.1, L * 0.45), 0.004, 0.04, 0, 2.068, -0.18, false);
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.1, 6), mats.fixe('cable'));
    c.position.set(s * Math.min(0.55, L * 0.22), 2.65, 0); g.add(c);
  }
  return g;
}

// Construit la cuisine complète. Renvoie un groupe centré au sol.
export function construireCuisine(cfg, mats = new Materiaux()) {
  const c = { ...CONFIG_DEFAUT, ...cfg };
  const ctx = { mats, porte: MODELES[c.modele]?.porte || 'lisse', profil: c.profil, plan: c.plan, accent: c.accent, cascade: c.cascade, bar: c.bar };
  const racine = new THREE.Group();
  const L = c.longueur;
  const nCol = Math.min(c.colonnes, Math.floor((L - 1.2) / 0.6));
  const Lcol = nCol * 0.6;
  const Lbas = L - Lcol;
  const x0 = -L / 2;

  if (nCol > 0) {
    const col = colonnes(ctx, nCol, c.accent, { four: nCol >= 2 ? 1 : null });
    col.position.x = x0; racine.add(col);
  }
  const nMod = Math.max(1, Math.round(Lbas / 0.6));
  const avecIlot = c.implantation.includes('ilot');
  const equip = Array.from({ length: nMod }, (_, i) => {
    if (i === Math.floor(nMod * 0.7)) return 'evier';
    if (!avecIlot && i === Math.floor(nMod * 0.3)) return 'plaque';
    return null;
  });
  const bas = ligneBasse(ctx, Lbas, { facade: c.facade, equip });
  bas.position.x = x0 + Lcol; racine.add(bas);
  if (c.hauts) { const h = c.hauts === 'verriere' ? hautsVerriere(ctx, Lbas) : hauts(ctx, Lbas, c.facade); h.position.x = x0 + Lcol; racine.add(h); }
  if (!avecIlot && c.hotte !== 'aucune') {
    const xm = x0 + Lcol + (Lbas / nMod) * (Math.floor(nMod * 0.3) + 0.5);
    if (!c.hauts) boite(racine, mats.profil(c.profil), 0.9, 0.05, 0.5, xm, 1.75, 0.25);
  }

  if (c.implantation.startsWith('angle')) {
    const L2 = Math.min(3, Math.max(1.8, L * 0.6));
    const aile = ligneBasse(ctx, L2, { facade: c.facade, equip: [] });
    aile.rotation.y = -Math.PI / 2; aile.position.set(L / 2, 0, PROF);
    racine.add(aile);
    if (c.murLateral) {
      const mur = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: '#e6e1d9', roughness: 0.95 }));
      mur.rotation.y = -Math.PI / 2; mur.position.set(L / 2 + 0.002, 4, 4 - 0.002); mur.receiveShadow = true;
      racine.add(mur);
    }
  }

  if (avecIlot) {
    const Li = Math.min(3.2, Math.max(1.8, L * 0.62));
    const D = c.bar ? 1.0 : 0.62;
    const il = ilot(ctx, Li, D);
    il.position.set(c.implantation === 'angle-ilot' ? -0.2 : 0, 0, PROF + 1.2 + 0.3);
    racine.add(il);
    if (c.suspensions && c.hotte !== 'plafond') { const s = suspensions(ctx, Li, 1.75); s.position.copy(il.position); s.position.z += 0.3; racine.add(s); }
    if (c.hotte === 'plafond') { const h = hottePlafond(ctx, Li); h.position.copy(il.position); racine.add(h); }
  }
  racine.userData.config = c;
  return racine;
}

// Installe une scène « studio » : sol, mur, lumières. Renvoie les objets à animer.
export function installerStudio(scene, { sombre = false, murs = true } = {}) {
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: sombre ? '#121110' : '#d9d4cb', roughness: sombre ? 0.35 : 0.8, metalness: 0 }));
  sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
  let mur = null;
  if (murs) {
    mur = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshStandardMaterial({ color: sombre ? '#171614' : '#ece8e1', roughness: 0.95 }));
    mur.position.set(0, 4, -0.002); mur.receiveShadow = true; scene.add(mur);
  }
  const hemi = new THREE.HemisphereLight(sombre ? '#3a3632' : '#fffaf2', sombre ? '#0a0909' : '#8f8a82', sombre ? 0.35 : 0.9);
  scene.add(hemi);
  const soleil = new THREE.DirectionalLight('#fff3e2', sombre ? 1.1 : 2.2);
  soleil.position.set(-3.5, 6, 6); soleil.castShadow = true;
  soleil.shadow.mapSize.set(2048, 2048); soleil.shadow.camera.left = -6; soleil.shadow.camera.right = 6;
  soleil.shadow.camera.top = 6; soleil.shadow.camera.bottom = -2; soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.02;
  soleil.shadow.radius = 4;
  scene.add(soleil);
  const chaud = new THREE.SpotLight('#ffcf8f', sombre ? 40 : 12, 12, Math.PI / 5, 0.6, 1.6);
  chaud.position.set(0, 3.2, 2.6); chaud.target.position.set(0, 0.9, 1.8); scene.add(chaud, chaud.target);
  return { sol, mur, hemi, soleil, chaud };
}
