// Mise en page des e-mails de demande (configurateur, rappel, visite showroom, rendez-vous pro).
// Utilisé par submission-created.mjs ; séparé pour pouvoir prévisualiser le rendu sans envoyer.

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const url = (v) => (v && typeof v === 'object' ? v.url : v) || '';

const NOIR = '#0a0a0a', GRIS = '#6b6b6b', LIGNE = '#e6e6e6', FOND = '#f4f4f2';

const FORMULAIRES = {
  'configuration-cuisine': { titre: 'Demande de chiffrage', sous: 'Composition du configurateur 3D' },
  'visite-showroom': { titre: 'Demande de visite', sous: 'Showroom de Tours Nord' },
  'rappel-particulier': { titre: 'Demande de rappel', sous: 'Espace particuliers' },
  'rendez-vous-pro': { titre: 'Rendez-vous professionnel', sous: 'Espace professionnels' },
};

function titreBloc(t) {
  return `<tr><td style="padding:28px 32px 10px;font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${GRIS}">${esc(t)}</td></tr>`;
}

function lignes(paires) {
  const l = paires.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
  if (!l.length) return '';
  return `<tr><td style="padding:0 32px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${l.map(([k, v]) =>
    `<tr><td style="padding:9px 16px 9px 0;border-bottom:1px solid ${LIGNE};font:13px/1.5 Helvetica,Arial,sans-serif;color:${GRIS};width:38%;vertical-align:top">${esc(k)}</td>` +
    `<td style="padding:9px 0;border-bottom:1px solid ${LIGNE};font:15px/1.5 Helvetica,Arial,sans-serif;color:${NOIR};vertical-align:top">${v}</td></tr>`).join('')}</table></td></tr>`;
}

function bouton(lien, texte) {
  return `<a href="${esc(lien)}" style="display:inline-block;background:${NOIR};color:#ffffff;text-decoration:none;font:600 12px/1 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;padding:15px 24px">${esc(texte)}</a>`;
}

// « Modèle : Armony Quadro » → paire ; « 2 × Bas 3 tiroirs 90 cm · Quadro Nevada » → meuble
function lireConfiguration(texte) {
  const infos = [], meubles = [];
  for (const brut of String(texte || '').split('\n')) {
    const l = brut.trim(); if (!l || /^—/.test(l)) continue;
    const m = l.match(/^(\d+)\s*×\s*(.+)$/);
    if (m) { const [nom, fin] = m[2].split(' · '); meubles.push({ n: +m[1], nom, fin: fin || '' }); continue; }
    const i = l.indexOf(' : ');
    if (i > 0) infos.push([l.slice(0, i), l.slice(i + 3)]); else infos.push(['', l]);
  }
  return { infos, meubles };
}

function tableMeubles(meubles) {
  if (!meubles.length) return '';
  const total = meubles.reduce((s, m) => s + m.n, 0);
  return `<tr><td style="padding:0 32px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">` +
    meubles.map((m) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${LIGNE};font:600 14px/1.4 Helvetica,Arial,sans-serif;color:${NOIR};width:44px;vertical-align:top">${m.n} ×</td>` +
      `<td style="padding:8px 12px 8px 0;border-bottom:1px solid ${LIGNE};font:14px/1.4 Helvetica,Arial,sans-serif;color:${NOIR};vertical-align:top">${esc(m.nom)}</td>` +
      `<td style="padding:8px 0;border-bottom:1px solid ${LIGNE};font:13px/1.4 Helvetica,Arial,sans-serif;color:${GRIS};text-align:right;vertical-align:top">${esc(m.fin)}</td></tr>`).join('') +
    `<tr><td colspan="3" style="padding:10px 0 0;font:13px/1.4 Helvetica,Arial,sans-serif;color:${GRIS}">${total} meuble${total > 1 ? 's' : ''} au total</td></tr></table></td></tr>`;
}

export function composer(nomFormulaire, d, site = 'https://www.firstdiff.com') {
  const f = FORMULAIRES[nomFormulaire] || { titre: 'Nouvelle demande', sous: nomFormulaire };
  const tel = String(d.telephone || '').replace(/[^\d+]/g, '');
  const contact = lignes([
    ['Nom', esc(d.nom)],
    ['Société', esc(d.societe)], ['Fonction', esc(d.fonction)],
    ['Téléphone', tel ? `<a href="tel:${esc(tel)}" style="color:${NOIR}">${esc(d.telephone)}</a>` : ''],
    ['E-mail', d.email ? `<a href="mailto:${esc(d.email)}" style="color:${NOIR}">${esc(d.email)}</a>` : ''],
    ['Code postal', esc(d.code_postal)], ['Ville', esc(d.ville)], ['Profil', esc(d.profil)],
  ]);
  let corps = titreBloc('Le client') + contact;
  let sujet = `${f.titre} · ${d.nom || 'sans nom'}`;

  if (nomFormulaire === 'configuration-cuisine') {
    const { infos, meubles } = lireConfiguration(d.configuration);
    const apercu = url(d.apercu);
    const lien = d.lien_3d || '';
    sujet = `Chiffrage cuisine · ${d.nom || ''}${d.code_postal ? ' · ' + d.code_postal : ''}`;
    corps += titreBloc('Le projet') + lignes([['Budget', esc(d.budget || 'Non précisé')], ['Échéance', esc(d.delai || 'Non précisée')], ['Précisions', esc(d.message).replace(/\n/g, '<br>')]]);
    if (apercu || lien) {
      corps += `<tr><td style="padding:28px 32px 0">${apercu ? `<a href="${esc(lien || apercu)}"><img src="${esc(apercu)}" width="536" alt="Aperçu de la composition" style="display:block;width:100%;height:auto;border:0;background:${FOND}"></a>` : ''}` +
        `${lien ? `<div style="padding-top:16px">${bouton(lien, 'Ouvrir la cuisine en 3D')}</div>` : ''}</td></tr>`;
    }
    corps += titreBloc('La composition') + lignes(infos.map(([k, v]) => [k, esc(v)]));
    corps += titreBloc('Les meubles') + tableMeubles(meubles);
  } else if (nomFormulaire === 'visite-showroom') {
    sujet = `Visite showroom · ${d.jour || ''} à ${d.creneau || ''} · ${d.nom || ''}`;
    corps = `<tr><td style="padding:28px 32px 0"><div style="background:${FOND};padding:20px 22px;font:15px/1.5 Helvetica,Arial,sans-serif;color:${NOIR}">` +
      `<div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${GRIS}">Créneau demandé</div>` +
      `<div style="font:300 24px/1.3 Helvetica,Arial,sans-serif;margin-top:6px">${esc(d.jour)} · ${esc(d.creneau)}</div>` +
      `<div style="color:${GRIS};margin-top:4px">${esc(d.personnes || '')} personne(s) · à confirmer au client</div></div></td></tr>` + corps +
      titreBloc('Le projet') + lignes([['Message', esc(d.message).replace(/\n/g, '<br>')]]);
  } else if (nomFormulaire === 'rendez-vous-pro') {
    sujet = `Rendez-vous pro · ${d.societe || d.nom || ''}`;
    corps += titreBloc('La demande') + lignes([['Intérêt', esc(d.interet)], ['Suite souhaitée', esc(d.suite)], ['Jour d’appel', esc(d.jour_appel)], ['Créneau', esc(d.creneau_appel)], ['Message', esc(d.message).replace(/\n/g, '<br>')]]);
  } else {
    corps += titreBloc('Le projet') + lignes([['Projet', esc(d.projet)], ['Message', esc(d.message).replace(/\n/g, '<br>')]]);
  }

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(sujet)}</title></head>
<body style="margin:0;padding:0;background:${FOND}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${FOND}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse">
<tr><td style="background:${NOIR};padding:26px 32px"><img src="${site}/assets/img/email/firstdiff-clair.png" width="120" alt="FIRST DIFF" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 32px 0"><div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${GRIS}">${esc(f.sous)}</div>
<div style="font:300 28px/1.25 Helvetica,Arial,sans-serif;color:${NOIR};margin-top:8px">${esc(f.titre)}</div></td></tr>
${corps}
<tr><td style="padding:30px 32px">${d.telephone ? bouton('tel:' + tel, 'Rappeler le client') : ''}</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid ${LIGNE};font:12px/1.5 Helvetica,Arial,sans-serif;color:${GRIS}">Demande envoyée depuis firstdiff.com. Répondez directement à cet e-mail pour écrire au client.</td></tr>
</table></td></tr></table></body></html>`;

  const texte = [f.titre, '', `Nom : ${d.nom || ''}`, `Téléphone : ${d.telephone || ''}`, `E-mail : ${d.email || ''}`,
    d.code_postal ? `Code postal : ${d.code_postal}` : '', '', d.configuration || d.message || '', d.lien_3d ? `\nCuisine en 3D : ${d.lien_3d}` : ''].filter((x) => x !== null).join('\n');
  return { sujet, html, texte };
}
