// Portail d'entrée : une cuisine Armony en 3D qui change de « portrait » en continu.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';
import { construireCuisine, installerStudio, Materiaux, FACADES, PLANS } from './cuisine3d.js?v=20261022b';

const PORTRAITS = [
  { nom: 'Portrait 01 · System + Yota', cfg: { modele: 'system', facade: 'polaris-midnight', accent: 'noce-elegante', plan: 'onyx-white', profil: 'noir' } },
  { nom: 'Portrait 12 · Yota', cfg: { modele: 'yota', facade: 'ambra', accent: 'noce-elegante', plan: 'travertino', profil: 'or-antique' } },
  { nom: 'Portrait 27 · Skyline + Riga', cfg: { modele: 'riga', facade: 'blu-petrolio', accent: 'noce-elegante', plan: 'pietra-grey', profil: 'noir' } },
  { nom: 'Portrait 05 · Kappa + Rho', cfg: { modele: 'rho', facade: 'satin-brass', accent: 'olmo-naturale', plan: 'taj-mahal', profil: 'or-antique' } },
  { nom: 'Portrait 13 · Yota', cfg: { modele: 'yota', facade: 'talco', accent: 'blu-petrolio', plan: 'calacatta-black', profil: 'titane' } },
  { nom: 'Portrait 18 · Rho', cfg: { modele: 'rho', facade: 'x-black', accent: 'noce-elegante', plan: 'smoke-stone', profil: 'noir' } },
];
const BASE = { implantation: 'ilot', longueur: 5.4, colonnes: 3, hauts: false, cascade: true, hotte: 'aucune', bar: true, suspensions: true };

const canvas = document.getElementById('scene3d');
const etiquette = document.querySelector('.finition-courante');
// ?capture=N : fige le portrait N (sert à fabriquer les images fixes des téléphones, outils/images-accueil.mjs)
const capture = new URLSearchParams(location.search).get('capture');
const calme = capture != null || matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: capture != null });
} catch (e) {
  document.body.classList.add('scene-prete', 'sans-3d');
  throw e;
}
renderer.setPixelRatio(capture != null ? devicePixelRatio : Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#070706');
scene.fog = new THREE.Fog('#070706', 9, 20);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

const lum = installerStudio(scene, { sombre: true, murs: true });
lum.mur.material.color.set('#100f0d');
lum.hemi.intensity = 0.6;
const face = new THREE.DirectionalLight('#f3e6d2', 0.6); face.position.set(2, 3, 9); scene.add(face);
// halo or derrière la cuisine
const halo = new THREE.PointLight('#c9a86a', 6, 9, 1.4); halo.position.set(0, 2.6, 0.5); scene.add(halo);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
const cible = new THREE.Vector3(0, 1.3, 1.1);
const mats = new Materiaux();
let cuisine = null;
let index = capture != null ? +capture % PORTRAITS.length : 0;

function poser(i) {
  if (cuisine) scene.remove(cuisine);
  cuisine = construireCuisine({ ...BASE, ...PORTRAITS[i].cfg }, mats);
  scene.add(cuisine);
  const c = PORTRAITS[i].cfg;
  if (etiquette) etiquette.innerHTML = `${PORTRAITS[i].nom}<b>${FACADES[c.facade].nom} · ${FACADES[c.accent].nom} · ${PLANS[c.plan].nom}</b>`;
}
poser(index);

function taille() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 0.8 ? 52 : 34;
  camera.updateProjectionMatrix();
}
addEventListener('resize', taille); taille();

// interaction : souris et portes
let mx = 0, my = 0, cote = 0, coteLisse = 0;
addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
document.querySelectorAll('[data-porte]').forEach((p) => {
  const v = p.dataset.porte === 'pro' ? 1 : -1;
  p.addEventListener('pointerenter', () => { cote = v; });
  p.addEventListener('focus', () => { cote = v; });
  p.addEventListener('pointerleave', () => { cote = 0; });
  p.addEventListener('blur', () => { cote = 0; });
});

// changement de portrait avec un fondu de lumière
let fondu = 1, versFondu = 1, prochain = performance.now() + 6500;
const chaudBase = lum.chaud.intensity, soleilBase = lum.soleil.intensity;

const horloge = new THREE.Clock();
let enPause = false;
document.addEventListener('visibilitychange', () => { enPause = document.hidden; if (!enPause) horloge.getDelta(); });

function boucle(t) {
  requestAnimationFrame(boucle);
  if (enPause) return;
  const dt = Math.min(horloge.getDelta(), 0.05);
  const temps = calme ? 0 : t / 1000;

  if (!calme && t > prochain) { versFondu = 0; }
  fondu += (versFondu - fondu) * Math.min(1, dt * 5);
  if (versFondu === 0 && fondu < 0.04) {
    index = (index + 1) % PORTRAITS.length; poser(index);
    versFondu = 1; prochain = t + 7000;
  }
  lum.chaud.intensity = chaudBase * fondu;
  lum.soleil.intensity = soleilBase * (0.3 + 0.7 * fondu);
  if (etiquette) etiquette.style.opacity = fondu;

  coteLisse += (cote - coteLisse) * Math.min(1, dt * 2.2);
  const angle = Math.sin(temps * 0.12) * 0.35 + coteLisse * 0.45 + mx * 0.12;
  const rayon = 9.4 - Math.abs(coteLisse) * 1.1;
  camera.position.set(Math.sin(angle) * rayon, 2.6 + my * -0.35 + Math.sin(temps * 0.2) * 0.08, 1.1 + Math.cos(angle) * rayon);
  camera.lookAt(cible.x + coteLisse * 0.4, cible.y, cible.z);
  halo.color.setHSL(coteLisse > 0 ? 0.1 - coteLisse * 0.02 : 0.1, 0.45, 0.6);
  halo.intensity = 6 * fondu;
  renderer.render(scene, camera);
}
requestAnimationFrame(boucle);
requestAnimationFrame(() => document.body.classList.add('scene-prete'));
