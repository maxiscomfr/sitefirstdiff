// Comportements communs : en-tête, pied de page, apparitions, photos, visionneuse, formulaires.
import { CONTACT, photo, photoDistante, PHOTOS_LOCALES } from './donnees.js?v=20261022b';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export { $, $$ };

const univers = document.body.dataset.univers || '';

// ---------- en-tête et pied injectés ----------
function entete() {
  const el = $('header.entete');
  if (!el) return;
  const clair = document.body.classList.contains('clair');
  const logo = clair ? 'sombre' : 'clair';
  const liens = univers === 'pro'
    ? [['professionnels.html#armony', 'Armony'], ['professionnels.html#catalogues', 'Catalogues'], ['professionnels.html#showroom', 'Showroom'], ['professionnels.html#rendez-vous', 'Rendez-vous']]
    : [['particuliers.html#collections', 'Collections'], ['particuliers.html#portraits', 'Portraits'], ['configurateur.html', 'Configurateur'], ['particuliers.html#contact', 'Contact']];
  const ici = location.pathname.split('/').pop() || 'index.html';
  el.innerHTML = `
    <a class="marques" href="index.html" aria-label="FirstDiff × Armony — accueil">
      <img src="assets/img/logos/firstdiff-ligne-${logo}.png" alt="FirstDiff" width="160" height="38">
      <span class="x" aria-hidden="true">×</span>
      <img class="armony" src="assets/img/logos/armony-${logo}.png" alt="Armony Cucine" width="86" height="20">
    </a>
    <nav class="nav" id="nav">
      ${liens.map(([h, t]) => `<a href="${h}"${h === ici ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
      <span class="bascule" role="group" aria-label="Changer d'espace">
        <a href="particuliers.html"${univers !== 'pro' ? ' aria-current="true"' : ''}>Particuliers</a>
        <a href="professionnels.html"${univers === 'pro' ? ' aria-current="true"' : ''}>Pros</a>
      </span>
    </nav>
    <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav"><span></span><span></span></button>`;
  const burger = $('.burger', el);
  burger.addEventListener('click', () => {
    const o = document.body.classList.toggle('menu-ouvert');
    burger.setAttribute('aria-expanded', o);
  });
  $$('.nav a', el).forEach((a) => a.addEventListener('click', () => document.body.classList.remove('menu-ouvert')));
  const fixe = document.body.classList.contains('page-config');
  const maj = () => el.classList.toggle('defile', fixe || scrollY > 40);
  addEventListener('scroll', maj, { passive: true }); maj();
}

function pied() {
  const el = $('footer.pied');
  if (!el) return;
  el.innerHTML = `
  <div class="conteneur">
    <div class="pied-haut">
      <div class="pied-logo">
        <img src="assets/img/logos/firstdiff-clair.png" alt="FirstDiff — concept intérieur design" width="210" height="111" loading="lazy">
        <img class="armony" src="assets/img/logos/armony-clair.png" alt="Armony Cucine" width="170" height="40" loading="lazy">
      </div>
      <div>
        <h4>Particuliers</h4>
        <ul><li><a href="particuliers.html#collections">Collections Armony</a></li><li><a href="particuliers.html#portraits">Portraits</a></li><li><a href="configurateur.html">Composer ma cuisine</a></li><li><a href="particuliers.html#contact">Être rappelé</a></li></ul>
      </div>
      <div>
        <h4>Professionnels</h4>
        <ul><li><a href="professionnels.html#catalogues">Catalogues</a></li><li><a href="professionnels.html#showroom">Showroom Tours Nord</a></li><li><a href="professionnels.html#rendez-vous">Prendre rendez-vous</a></li></ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul><li><a href="tel:${CONTACT.telephoneLien}">${CONTACT.telephone}</a></li><li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li><li>${CONTACT.showroom}<br>${CONTACT.ville}</li></ul>
      </div>
    </div>
    <div class="grand-armony" aria-hidden="true"><img src="assets/img/logos/armony-clair.png" alt="" loading="lazy"></div>
    <div class="pied-bas">
      <span>© ${new Date().getFullYear()} FirstDiff — Un intérieur d’exception</span>
      <span><a href="mentions-legales.html">Mentions légales</a> · Armony Cucine est une marque d’Armony Cucine S.p.A., Italie</span>
    </div>
  </div>`;
}

// ---------- photos Armony avec repli élégant ----------
export function chargerPhotos(racine = document) {
  $$('.photo[data-photo]', racine).forEach((box) => {
    if (box.dataset.pret) return;
    box.dataset.pret = '1';
    let img = $('img', box);
    if (!img) { img = document.createElement('img'); img.alt = box.dataset.alt || ''; box.appendChild(img); }
    img.loading = box.dataset.eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.classList.add('charge');
    img.referrerPolicy = 'no-referrer';
    img.onload = () => img.classList.remove('charge');
    img.onerror = () => {
      // copie locale absente : on retente sur armonycucine.it, sinon emplacement vide
      if (PHOTOS_LOCALES && !img.dataset.distant) { img.dataset.distant = '1'; img.src = photoDistante(box.dataset.photo); return; }
      box.classList.add('vide');
    };
    img.src = photo(box.dataset.photo);
  });
  $$('.photo:not([data-photo])', racine).forEach((b) => b.classList.add('vide'));
}

// ---------- apparitions au défilement ----------
function apparitions() {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.revele').forEach((el) => io.observe(el));
  return io;
}
export let observerApparitions = null;
export function observer(el) { observerApparitions?.observe(el); }

// ---------- transitions entre pages ----------
function transitions() {
  document.body.insertAdjacentHTML('beforeend', '<div class="rideau" aria-hidden="true"></div>');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('pret')));
  addEventListener('pageshow', (e) => { if (e.persisted) document.body.classList.remove('sortie'); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || a.hasAttribute('download') || /\.pdf$/i.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.add('sortie');
    setTimeout(() => { location.href = url.href; }, 450);
  });
}

// ---------- visionneuse ----------
let vis = null;
export function ouvrirVisionneuse({ surtitre, titre, sousTitre, lignes = [], images = [], depart = 0, lien }) {
  if (!vis) {
    vis = document.createElement('div');
    vis.className = 'visionneuse'; vis.setAttribute('role', 'dialog'); vis.setAttribute('aria-modal', 'true');
    vis.innerHTML = `
      <div class="scene">
        <div class="photo" data-libelle="Photo Armony"></div>
        <button class="rond fermer" aria-label="Fermer"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 1l14 14M15 1L1 15" stroke="currentColor"/></svg></button>
        <button class="rond prec" aria-label="Photo précédente"><svg width="18" height="12" viewBox="0 0 18 12"><path d="M17 6H1M6 1L1 6l5 5" stroke="currentColor" fill="none"/></svg></button>
        <button class="rond suiv" aria-label="Photo suivante"><svg width="18" height="12" viewBox="0 0 18 12"><path d="M1 6h16M12 1l5 5-5 5" stroke="currentColor" fill="none"/></svg></button>
        <div class="compteur"></div>
      </div>
      <aside></aside>`;
    document.body.appendChild(vis);
    $('.fermer', vis).onclick = fermer;
    // balayage au doigt pour passer d'une photo à l'autre
    let x0 = null;
    const scene = $('.scene', vis);
    scene.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    scene.addEventListener('pointerup', (e) => {
      if (x0 == null) return;
      const d = e.clientX - x0; x0 = null;
      if (Math.abs(d) > 40) vis._aller(d < 0 ? 1 : -1);
    });
    scene.style.touchAction = 'pan-y';
    vis.addEventListener('click', (e) => { if (e.target === vis || e.target.classList.contains('scene')) fermer(); });
    addEventListener('keydown', (e) => {
      if (!vis.classList.contains('ouverte')) return;
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') vis._aller(1);
      if (e.key === 'ArrowLeft') vis._aller(-1);
    });
  }
  let i = depart;
  const scene = $('.scene .photo', vis);
  const montrer = () => {
    scene.classList.remove('vide'); delete scene.dataset.pret;
    scene.innerHTML = ''; scene.dataset.photo = images[i]; scene.dataset.eager = '1';
    chargerPhotos(vis);
    $('.compteur', vis).textContent = images.length > 1 ? `${String(i + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}` : '';
    $$('.vignettes button', vis).forEach((b, k) => b.toggleAttribute('aria-current', k === i));
  };
  vis._aller = (d) => { i = (i + d + images.length) % images.length; montrer(); };
  $('.prec', vis).onclick = () => vis._aller(-1);
  $('.suiv', vis).onclick = () => vis._aller(1);
  $('.prec', vis).hidden = $('.suiv', vis).hidden = images.length < 2;
  $('aside', vis).innerHTML = `
    <span class="surtitre">${surtitre || 'Armony Cucine'}</span>
    <h3>${titre}</h3>
    ${sousTitre ? `<div class="italique" style="font-size:22px">${sousTitre}</div>` : ''}
    ${lignes.length ? `<ul>${lignes.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
    <div class="vignettes">${images.map((src, k) => `<button aria-label="Photo ${k + 1}"><div class="photo" data-photo="${src}"></div></button>`).join('')}</div>
    <p style="margin-top:28px"><a class="btn or" href="${lien || 'configurateur.html'}">Composer ma cuisine <span class="fleche"></span></a></p>`;
  $$('.vignettes button', vis).forEach((b, k) => b.onclick = () => { i = k; montrer(); });
  chargerPhotos($('aside', vis));
  montrer();
  vis.classList.add('ouverte');
  document.documentElement.style.overflow = 'hidden';
  $('.fermer', vis).focus();
}
function fermer() { vis.classList.remove('ouverte'); document.documentElement.style.overflow = ''; }

// ---------- formulaires Netlify ----------
export async function envoyerFormulaire(form, extra = {}) {
  const donnees = new FormData(form);
  for (const [k, v] of Object.entries(extra)) v instanceof Blob ? donnees.set(k, v, 'composition.jpg') : donnees.set(k, v);
  const avecFichier = [...donnees.values()].some((v) => v instanceof Blob && v.size);
  const options = avecFichier
    ? { method: 'POST', body: donnees }
    : { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams([...donnees].filter(([, v]) => typeof v === 'string')).toString() };
  const r = await fetch('/', options);
  if (!r.ok) throw new Error('Envoi refusé (' + r.status + ')');
}

export function brancherFormulaire(form, { avant, apres } = {}) {
  const etat = $('.etat-envoi', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const bouton = $('[type=submit]', form);
    bouton.disabled = true; etat.className = 'etat-envoi'; etat.textContent = 'Envoi en cours…';
    try {
      const extra = avant ? await avant() : {};
      await envoyerFormulaire(form, extra);
      apres ? apres() : (location.href = form.getAttribute('action') || 'merci.html');
    } catch (err) {
      etat.classList.add('erreur');
      etat.innerHTML = `L’envoi n’a pas abouti. Appelez-nous au <a href="tel:${CONTACT.telephoneLien}">${CONTACT.telephone}</a> ou écrivez à <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>.`;
      bouton.disabled = false;
      console.error(err);
    }
  });
}

// ---------- défilement horizontal à la souris ----------
export function glisser(piste) {
  let x0 = 0, s0 = 0, actif = false, bouge = false;
  piste.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; actif = true; bouge = false; x0 = e.clientX; s0 = piste.scrollLeft; });
  addEventListener('pointermove', (e) => { if (!actif) return; const d = e.clientX - x0; if (Math.abs(d) > 4) { bouge = true; piste.classList.add('glisse'); } piste.scrollLeft = s0 - d; });
  addEventListener('pointerup', () => { actif = false; piste.classList.remove('glisse'); });
  piste.addEventListener('click', (e) => { if (bouge) { e.preventDefault(); e.stopPropagation(); } }, true);
}

// ---------- démarrage ----------
entete();
pied();
transitions();
chargerPhotos();
observerApparitions = apparitions();
$$('[data-tel]').forEach((a) => { a.href = 'tel:' + CONTACT.telephoneLien; if (!a.textContent.trim()) a.textContent = CONTACT.telephone; });
$$('[data-mail]').forEach((a) => { a.href = 'mailto:' + CONTACT.email; if (!a.textContent.trim()) a.textContent = CONTACT.email; });
