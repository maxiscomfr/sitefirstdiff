// Netlify lance cette fonction à chaque demande envoyée par un formulaire du site.
// Elle envoie un e-mail mis en page à contact@firstdiff.com, par le serveur d'envoi Zoho.
// Réglages (Netlify → Site configuration → Environment variables) :
//   SMTP_USER  = contact@firstdiff.com
//   SMTP_PASS  = mot de passe d'application Zoho
//   MAIL_TO    = (facultatif) adresse de réception, par défaut SMTP_USER
//   SMTP_HOST  = (facultatif) smtppro.zoho.eu par défaut
// Sans SMTP_USER / SMTP_PASS, la fonction ne fait rien et la notification Netlify habituelle reste seule.
import nodemailer from 'nodemailer';
import { composer } from './mise-en-page.mjs';

export const handler = async (event) => {
  const { SMTP_USER, SMTP_PASS, MAIL_TO, SMTP_HOST } = process.env;
  if (!SMTP_USER || !SMTP_PASS) return { statusCode: 200, body: 'SMTP non configuré' };
  const { payload } = JSON.parse(event.body || '{}');
  if (!payload) return { statusCode: 400, body: 'Pas de demande' };
  const d = payload.data || {};
  const { sujet, html, texte } = composer(payload.form_name, d);
  const transport = nodemailer.createTransport({ host: SMTP_HOST || 'smtppro.zoho.eu', port: 465, secure: true, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  await transport.sendMail({
    from: `"Site FIRST DIFF" <${SMTP_USER}>`,
    to: MAIL_TO || SMTP_USER,
    replyTo: d.email ? `"${String(d.nom || '').replace(/"/g, '')}" <${d.email}>` : undefined,
    subject: sujet, html, text: texte,
  });
  return { statusCode: 200, body: 'ok' };
};
