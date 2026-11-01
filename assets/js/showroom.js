// Page « Visiter le showroom » : choix du jour (3 semaines à venir) et de l'heure d'arrivée (9 h à 18 h).
import { $, brancherFormulaire } from './site.js?v=20261101g';

const form = $('form[name="visite-showroom"]');
const jours = $('#jours'), creneaux = $('#creneaux');
const champJour = $('#sv-jour'), champCreneau = $('#sv-creneau');
const HEURES = ['9 h', '10 h', '11 h', '12 h', '13 h', '14 h', '15 h', '16 h', '17 h', '18 h'];
const fmtJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const fmtNum = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const fmtLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function bouton(groupe, texte, valeur, aria) {
  const b = document.createElement('button');
  b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false');
  b.dataset.valeur = valeur; b.innerHTML = texte; if (aria) b.setAttribute('aria-label', aria);
  groupe.appendChild(b); return b;
}

function choisir(groupe, b, champ) {
  groupe.querySelectorAll('[role=radio]').forEach((x) => { x.setAttribute('aria-checked', 'false'); x.tabIndex = -1; });
  b.setAttribute('aria-checked', 'true'); b.tabIndex = 0;
  champ.value = b.dataset.valeur; champ.removeAttribute('aria-invalid');
}

function clavier(groupe, champ) {
  groupe.addEventListener('keydown', (e) => {
    const liste = [...groupe.querySelectorAll('[role=radio]:not([disabled])')];
    const i = liste.indexOf(document.activeElement); if (i < 0) return;
    const pas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!pas) return;
    e.preventDefault(); const b = liste[(i + pas + liste.length) % liste.length]; b.focus(); choisir(groupe, b, champ); groupe.dispatchEvent(new Event('change'));
  });
  groupe.addEventListener('click', (e) => { const b = e.target.closest('[role=radio]'); if (b && !b.disabled) { choisir(groupe, b, champ); groupe.dispatchEvent(new Event('change')); } });
}

// jours : de demain à dans 3 semaines (le showroom reçoit tous les jours)
const auj = new Date(); auj.setHours(0, 0, 0, 0);
for (let i = 1; i <= 21; i++) {
  const d = new Date(auj); d.setDate(auj.getDate() + i);
  const long = fmtLong.format(d);
  bouton(jours, `<small>${fmtJour.format(d).replace('.', '')}</small><b>${fmtNum.format(d)}</b><small>${fmtMois.format(d).replace('.', '')}</small>`, long.charAt(0).toUpperCase() + long.slice(1), long);
}
HEURES.forEach((h) => bouton(creneaux, h, h, `Arrivée à ${h}`));
jours.querySelector('[role=radio]').tabIndex = 0;
creneaux.querySelector('[role=radio]').tabIndex = 0;
[...jours.querySelectorAll('[role=radio]')].slice(1).forEach((b) => (b.tabIndex = -1));
[...creneaux.querySelectorAll('[role=radio]')].slice(1).forEach((b) => (b.tabIndex = -1));
clavier(jours, champJour); clavier(creneaux, champCreneau);

brancherFormulaire(form);
