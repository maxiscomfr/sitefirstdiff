// Cloudflare Pages Function : reçoit les formulaires du site et envoie un e-mail mis en page.
// Envoi par l'API Resend (https://resend.com), domaine firstdiff.com vérifié chez Resend.
// Variables (Cloudflare → Workers & Pages → le projet → Settings → Variables and Secrets) :
//   RESEND_API_KEY  clé API Resend (secret)
//   MAIL_TO         (facultatif) adresse de réception, par défaut contact@firstdiff.com
//   MAIL_FROM       (facultatif) expéditeur, par défaut « Site FIRST DIFF <site@firstdiff.com> »
import { composer } from '../../lib/mise-en-page.js';

const FORMULAIRES = ['configuration-cuisine', 'visite-showroom', 'rappel-particulier', 'rendez-vous-pro'];
const MERCI = { 'configuration-cuisine': '/merci?demande=chiffrage', 'visite-showroom': '/merci?demande=visite', 'rendez-vous-pro': '/merci?demande=rendez-vous' };

function base64(buffer) {
  const octets = new Uint8Array(buffer); let s = '';
  for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode.apply(null, octets.subarray(i, i + 0x8000));
  return btoa(s);
}

function reponse(request, ok, nom, message) {
  const json = (request.headers.get('Accept') || '').includes('application/json');
  if (json) return new Response(JSON.stringify({ ok, message }), { status: ok ? 200 : 500, headers: { 'Content-Type': 'application/json' } });
  if (ok) return Response.redirect(new URL(MERCI[nom] || '/merci', request.url), 303);
  return new Response('L’envoi n’a pas abouti. Appelez-nous au +33 6 64 35 77 28.', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

export async function onRequestPost({ request, env }) {
  let form;
  try { form = await request.formData(); } catch { return new Response('Formulaire illisible', { status: 400 }); }
  const nom = String(form.get('form-name') || '');
  if (!FORMULAIRES.includes(nom)) return new Response('Formulaire inconnu', { status: 400 });
  if (String(form.get('adresse-web') || '').trim()) return reponse(request, true, nom); // robot : on ignore sans le dire

  const d = {}; let image = null;
  for (const [k, v] of form.entries()) {
    if (k === 'form-name' || k === 'adresse-web') continue;
    if (typeof v === 'string') d[k] = v.slice(0, 20000);
    else if (k === 'apercu' && v.size && v.size < 8e6) image = v;
  }
  if (!d.nom || !(d.email || d.telephone)) return new Response('Champs manquants', { status: 400 });

  const site = new URL(request.url).origin;
  if (image) { d.apercu = 'cid:apercu'; d.apercuJoint = true; }
  const { sujet, html, texte } = composer(nom, d, site);
  if (!env.RESEND_API_KEY) return reponse(request, false, nom, 'RESEND_API_KEY manquante');

  const corps = {
    from: env.MAIL_FROM || 'Site FIRST DIFF <site@firstdiff.com>',
    to: [env.MAIL_TO || 'contact@firstdiff.com'],
    subject: sujet, html, text: texte,
  };
  if (d.email) corps.reply_to = `${String(d.nom || '').replace(/[<>"]/g, '')} <${d.email}>`;
  if (image) corps.attachments = [{ filename: 'composition.jpg', content: base64(await image.arrayBuffer()), content_id: 'apercu' }];

  let r;
  try {
    r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(corps),
    });
  } catch (e) { console.log('Resend injoignable', e.message); return reponse(request, false, nom, 'Service d’envoi injoignable'); }
  if (!r.ok) { console.log('Resend', r.status, await r.text()); return reponse(request, false, nom, 'Envoi refusé'); }
  return reponse(request, true, nom);
}
