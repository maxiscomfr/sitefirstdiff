// Géométrie de la pièce : contour au sol, murs, portes et fenêtres. Pas de 3D ici, seulement des calculs.
// Repère : x vers la droite, z vers l'avant (vers le visiteur) ; le mur du fond est en z = 0.

export const FORMES = {
  rect: { nom: 'Rectangle', note: 'Quatre murs droits' },
  L: { nom: 'En L', note: 'Un angle rentrant' },
  biais: { nom: 'Murs en biais', note: 'Angles différents de 90°' },
};
export const OUVERTURES = {
  fenetre: { nom: 'Fenêtre', l: 1.2, h: 1.25, y: 1.0 },
  porte: { nom: 'Porte', l: 0.9, h: 2.1, y: 0 },
  baie: { nom: 'Porte-fenêtre', l: 1.6, h: 2.2, y: 0 },
};
export const PIECE_DEFAUT = { forme: 'rect', W: 5, D: 4.2, H: 2.6, hc: 2.16, aG: 90, aD: 90, Lx: 1.6, Lz: 1.4 };

const rad = (d) => (d * Math.PI) / 180;

// Sommets du contour, dans l'ordre : fond gauche, fond droit, puis on tourne vers l'avant.
export function contour(p) {
  const { W, D } = p;
  if (p.forme === 'L') {
    const Lx = Math.min(p.Lx, W - 1), Lz = Math.min(p.Lz, D - 1);
    return [[-W / 2, 0], [W / 2, 0], [W / 2, D - Lz], [W / 2 - Lx, D - Lz], [W / 2 - Lx, D], [-W / 2, D]];
  }
  if (p.forme === 'biais') {
    // angle intérieur entre le mur du fond et chaque mur latéral
    const dG = D / Math.tan(rad(p.aG)), dD = D / Math.tan(rad(p.aD));
    return [[-W / 2, 0], [W / 2, 0], [W / 2 - dD, D], [-W / 2 + dG, D]];
  }
  return [[-W / 2, 0], [W / 2, 0], [W / 2, D], [-W / 2, D]];
}

// Les murs, avec leur direction et leur normale tournée vers l'intérieur de la pièce
export function murs(p) {
  const pts = contour(p);
  const noms = p.forme === 'L'
    ? ['Mur du fond', 'Mur de droite', 'Retour de l’angle', 'Mur intérieur de l\u2019angle', 'Mur de face', 'Mur de gauche']
    : ['Mur du fond', 'Mur de droite', 'Mur de face', 'Mur de gauche'];
  return pts.map((a, i) => {
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
    const dir = { x: dx / len, z: dz / len }, n = { x: -dir.z, z: dir.x };
    return { i, nom: noms[i], a: { x: a[0], z: a[1] }, b: { x: b[0], z: b[1] }, len, dir, n, r: Math.atan2(n.x, n.z) };
  });
}

// Position d'un point projeté sur un mur : abscisse le long du mur et distance au mur
export function projeter(mur, x, z) {
  const vx = x - mur.a.x, vz = z - mur.a.z;
  const t = vx * mur.dir.x + vz * mur.dir.z;
  const tc = Math.max(0, Math.min(mur.len, t));
  const px = mur.a.x + mur.dir.x * tc, pz = mur.a.z + mur.dir.z * tc;
  return { t, dist: Math.hypot(x - px, z - pz), cote: vx * mur.n.x + vz * mur.n.z };
}
export const surMur = (mur, t) => ({ x: mur.a.x + mur.dir.x * t, z: mur.a.z + mur.dir.z * t });

export function dedans(pts, x, z) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

// Coins d'un rectangle local (x0..x1, z0..z1) posé en (x, z) et tourné de r autour de la verticale
export function coins(e, x, z, r) {
  const c = Math.cos(r), s = Math.sin(r);
  return [[e.x0, e.z0], [e.x1, e.z0], [e.x1, e.z1], [e.x0, e.z1]].map(([u, v]) => [x + u * c + v * s, z - u * s + v * c]);
}

// Chevauchement de deux rectangles orientés (axes séparateurs) : renvoie la plus petite profondeur de recouvrement
export function recouvrement(A, B) {
  let min = Infinity;
  for (const P of [A, B]) for (let i = 0; i < 2; i++) {
    const [x0, z0] = P[i], [x1, z1] = P[i + 1];
    const ax = x1 - x0, az = z1 - z0, n = Math.hypot(ax, az); const ux = ax / n, uz = az / n;
    const proj = (Q) => Q.map(([x, z]) => x * ux + z * uz);
    const pa = proj(A), pb = proj(B);
    const o = Math.min(Math.max(...pa), Math.max(...pb)) - Math.max(Math.min(...pa), Math.min(...pb));
    if (o <= 0) return 0;
    min = Math.min(min, o);
  }
  return min;
}

// Emprise d'une ouverture : la largeur de la baie, et la place à garder devant (passage ou ouvrant)
export function empriseOuverture(o, lesMurs) {
  const mur = lesMurs[o.mur]; if (!mur) return null;
  const prof = o.type === 'fenetre' ? 0.62 : 0.9;
  const { x, z } = surMur(mur, o.t);
  return { coins: coins({ x0: -o.l / 2, x1: o.l / 2, z0: 0, z1: prof }, x, z, mur.r), y0: o.y, y1: o.y + o.h };
}
