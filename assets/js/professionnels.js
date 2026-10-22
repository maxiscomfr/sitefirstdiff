// Espace professionnels : catalogues, showroom, parcours de prise de rendez-vous.
import { $, $$, brancherFormulaire, observer } from './site.js?v=20261022u';
import { CATALOGUES, CONTACT } from './donnees.js?v=20261022u';

// ---------- catalogues ----------
const liste = $('#liste-catalogues');
liste.innerHTML = CATALOGUES.map((c, i) => `
  <a class="catalogue revele${i % 3 ? ' revele-d' + (i % 3) : ''}" data-i="${i}" href="${c.fichier || '#rendez-vous'}"${c.fichier ? ' download' : ''}>
    <div class="couv">
      ${c.marque === 'Armony' ? '<img src="assets/img/logos/armony-sombre.png" alt="Armony" width="103" height="24">' : `<span style="letter-spacing:.3em;text-transform:uppercase;font-size:15px">${c.marque}</span>`}
      <span class="tag">${c.fichier ? 'PDF' : 'Sur demande'}</span>
    </div>
    <h3>${c.titre}</h3>
    <p>${c.detail}</p>
    <div class="action"><span>${c.fichier ? 'Télécharger' : 'Demander'}</span><b>→</b></div>
  </a>`).join('');
$$('.revele', liste).forEach(observer);

// Un catalogue dont le PDF n'est pas encore en ligne passe « sur demande ».
CATALOGUES.forEach(async (c, i) => {
  if (!c.fichier) return;
  let present = false;
  try { present = (await fetch(c.fichier, { method: 'HEAD' })).ok; } catch { /* hors ligne */ }
  if (present) return;
  const a = $(`[data-i="${i}"]`, liste);
  a.removeAttribute('download'); a.href = '#rendez-vous'; a.dataset.demande = c.titre;
  $('.tag', a).textContent = 'Sur demande';
  $('.action span', a).textContent = 'Demander';
});
liste.addEventListener('click', (e) => {
  const a = e.target.closest('a[href="#rendez-vous"]'); if (!a) return;
  const titre = a.dataset.demande || CATALOGUES[a.dataset.i].titre;
  $('#r-msg').value = `Je souhaite recevoir : ${titre}.`;
  if (/tarif/i.test(titre)) $('#r-interet').value = 'Recevoir le tarif professionnel';
});

// ---------- showroom ----------
$('#adresse-showroom').innerHTML = `${CONTACT.showroom}<br>${CONTACT.ville}<br><a class="lien" style="display:inline-block;margin-top:12px" href="tel:${CONTACT.telephoneLien}">${CONTACT.telephone}</a>`;
$('#secteur').innerHTML = CONTACT.secteur.map(([n, nom]) => `<span><b>${n}</b>${nom}</span>`).join('');

// ---------- rendez-vous : jours ouvrés à venir ----------
const jours = [];
const d = new Date(); d.setHours(12);
while (jours.length < 10) {
  d.setDate(d.getDate() + 1);
  if (d.getDay() !== 0 && d.getDay() !== 6) jours.push(new Date(d));
}
const fmtJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const fmtMois = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const fmtComplet = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
$('#jours').innerHTML = jours.map((j, i) => `
  <label><input type="radio" name="jour_choix" value="${fmtComplet.format(j)}"${i === 0 ? ' required' : ''}>
  <span><small>${fmtJour.format(j).replace('.', '')}</small><strong>${j.getDate()}</strong><small>${fmtMois.format(j).replace('.', '')}</small></span></label>`).join('');
const form = $('#form-rdv');
$('#jours').addEventListener('change', (e) => { form.elements.jour_appel.value = e.target.value; });

// ---------- étapes ----------
const etapes = $$('.etape-form', form);
const puces = $$('#parcours li');
let courante = 0;
function aller(n) {
  courante = n;
  etapes.forEach((el, i) => el.classList.toggle('active', i === n));
  puces.forEach((li, i) => { li.classList.toggle('actif', i === n); li.classList.toggle('fait', i < n); });
}
function etapeValide() {
  const champs = $$('input, select, textarea', etapes[courante]);
  for (const c of champs) if (!c.checkValidity()) { c.reportValidity(); return false; }
  return true;
}
$$('[data-suivant]', form).forEach((b) => b.addEventListener('click', () => { if (etapeValide()) aller(courante + 1); }));
$$('[data-precedent]', form).forEach((b) => b.addEventListener('click', () => aller(courante - 1)));

brancherFormulaire(form);
