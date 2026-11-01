var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-qbJcDU/functionsWorker-0.5531159283026381.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var esc = /* @__PURE__ */ __name2((s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]), "esc");
var url = /* @__PURE__ */ __name2((v) => (v && typeof v === "object" ? v.url : v) || "", "url");
var NOIR = "#0a0a0a";
var GRIS = "#6b6b6b";
var LIGNE = "#e6e6e6";
var FOND = "#f4f4f2";
var FORMULAIRES = {
  "configuration-cuisine": { titre: "Demande de chiffrage", sous: "Composition du configurateur 3D" },
  "visite-showroom": { titre: "Demande de visite", sous: "Showroom de Tours Nord" },
  "rappel-particulier": { titre: "Demande de rappel", sous: "Espace particuliers" },
  "rendez-vous-pro": { titre: "Rendez-vous professionnel", sous: "Espace professionnels" }
};
function titreBloc(t) {
  return `<tr><td style="padding:28px 32px 10px;font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${GRIS}">${esc(t)}</td></tr>`;
}
__name(titreBloc, "titreBloc");
__name2(titreBloc, "titreBloc");
function lignes(paires) {
  const l = paires.filter(([, v]) => v !== void 0 && v !== null && String(v).trim() !== "");
  if (!l.length)
    return "";
  return `<tr><td style="padding:0 32px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${l.map(([k, v]) => `<tr><td style="padding:9px 16px 9px 0;border-bottom:1px solid ${LIGNE};font:13px/1.5 Helvetica,Arial,sans-serif;color:${GRIS};width:38%;vertical-align:top">${esc(k)}</td><td style="padding:9px 0;border-bottom:1px solid ${LIGNE};font:15px/1.5 Helvetica,Arial,sans-serif;color:${NOIR};vertical-align:top">${v}</td></tr>`).join("")}</table></td></tr>`;
}
__name(lignes, "lignes");
__name2(lignes, "lignes");
function bouton(lien, texte) {
  return `<a href="${esc(lien)}" style="display:inline-block;background:${NOIR};color:#ffffff;text-decoration:none;font:600 12px/1 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;padding:15px 24px">${esc(texte)}</a>`;
}
__name(bouton, "bouton");
__name2(bouton, "bouton");
function lireConfiguration(texte) {
  const infos = [], meubles = [];
  for (const brut of String(texte || "").split("\n")) {
    const l = brut.trim();
    if (!l || /^—/.test(l))
      continue;
    const m = l.match(/^(\d+)\s*×\s*(.+)$/);
    if (m) {
      const [nom, fin] = m[2].split(" \xB7 ");
      meubles.push({ n: +m[1], nom, fin: fin || "" });
      continue;
    }
    const i = l.indexOf(" : ");
    if (i > 0)
      infos.push([l.slice(0, i), l.slice(i + 3)]);
    else
      infos.push(["", l]);
  }
  return { infos, meubles };
}
__name(lireConfiguration, "lireConfiguration");
__name2(lireConfiguration, "lireConfiguration");
function tableMeubles(meubles) {
  if (!meubles.length)
    return "";
  const total = meubles.reduce((s, m) => s + m.n, 0);
  return `<tr><td style="padding:0 32px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">` + meubles.map((m) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${LIGNE};font:600 14px/1.4 Helvetica,Arial,sans-serif;color:${NOIR};width:44px;vertical-align:top">${m.n} \xD7</td><td style="padding:8px 12px 8px 0;border-bottom:1px solid ${LIGNE};font:14px/1.4 Helvetica,Arial,sans-serif;color:${NOIR};vertical-align:top">${esc(m.nom)}</td><td style="padding:8px 0;border-bottom:1px solid ${LIGNE};font:13px/1.4 Helvetica,Arial,sans-serif;color:${GRIS};text-align:right;vertical-align:top">${esc(m.fin)}</td></tr>`).join("") + `<tr><td colspan="3" style="padding:10px 0 0;font:13px/1.4 Helvetica,Arial,sans-serif;color:${GRIS}">${total} meuble${total > 1 ? "s" : ""} au total</td></tr></table></td></tr>`;
}
__name(tableMeubles, "tableMeubles");
__name2(tableMeubles, "tableMeubles");
function composer(nomFormulaire, d, site = "https://www.firstdiff.com") {
  const f = FORMULAIRES[nomFormulaire] || { titre: "Nouvelle demande", sous: nomFormulaire };
  const tel = String(d.telephone || "").replace(/[^\d+]/g, "");
  const contact = lignes([
    ["Nom", esc(d.nom)],
    ["Soci\xE9t\xE9", esc(d.societe)],
    ["Fonction", esc(d.fonction)],
    ["T\xE9l\xE9phone", tel ? `<a href="tel:${esc(tel)}" style="color:${NOIR}">${esc(d.telephone)}</a>` : ""],
    ["E-mail", d.email ? `<a href="mailto:${esc(d.email)}" style="color:${NOIR}">${esc(d.email)}</a>` : ""],
    ["Code postal", esc(d.code_postal)],
    ["Ville", esc(d.ville)],
    ["Profil", esc(d.profil)]
  ]);
  let corps = titreBloc("Le client") + contact;
  let sujet = `${f.titre} \xB7 ${d.nom || "sans nom"}`;
  if (nomFormulaire === "configuration-cuisine") {
    const { infos, meubles } = lireConfiguration(d.configuration);
    const apercu = url(d.apercu);
    const lien = d.lien_3d || "";
    sujet = `Chiffrage cuisine \xB7 ${d.nom || ""}${d.code_postal ? " \xB7 " + d.code_postal : ""}`;
    corps += titreBloc("Le projet") + lignes([["Budget", esc(d.budget || "Non pr\xE9cis\xE9")], ["\xC9ch\xE9ance", esc(d.delai || "Non pr\xE9cis\xE9e")], ["Pr\xE9cisions", esc(d.message).replace(/\n/g, "<br>")]]);
    if (apercu || lien) {
      corps += `<tr><td style="padding:28px 32px 0">${apercu ? `<a href="${esc(lien || apercu)}"><img src="${esc(apercu)}" width="536" alt="Aper\xE7u de la composition" style="display:block;width:100%;height:auto;border:0;background:${FOND}"></a>` : ""}${lien ? `<div style="padding-top:16px">${bouton(lien, "Ouvrir la cuisine en 3D")}</div>` : ""}</td></tr>`;
    }
    corps += titreBloc("La composition") + lignes(infos.map(([k, v]) => [k, esc(v)]));
    corps += titreBloc("Les meubles") + tableMeubles(meubles);
  } else if (nomFormulaire === "visite-showroom") {
    sujet = `Visite showroom \xB7 ${d.jour || ""} \xE0 ${d.creneau || ""} \xB7 ${d.nom || ""}`;
    corps = `<tr><td style="padding:28px 32px 0"><div style="background:${FOND};padding:20px 22px;font:15px/1.5 Helvetica,Arial,sans-serif;color:${NOIR}"><div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${GRIS}">Cr\xE9neau demand\xE9</div><div style="font:300 24px/1.3 Helvetica,Arial,sans-serif;margin-top:6px">${esc(d.jour)} \xB7 ${esc(d.creneau)}</div><div style="color:${GRIS};margin-top:4px">${esc(d.personnes || "")} personne(s) \xB7 \xE0 confirmer au client</div></div></td></tr>` + corps + titreBloc("Le projet") + lignes([["Message", esc(d.message).replace(/\n/g, "<br>")]]);
  } else if (nomFormulaire === "rendez-vous-pro") {
    sujet = `Rendez-vous pro \xB7 ${d.societe || d.nom || ""}`;
    corps += titreBloc("La demande") + lignes([["Int\xE9r\xEAt", esc(d.interet)], ["Suite souhait\xE9e", esc(d.suite)], ["Jour d\u2019appel", esc(d.jour_appel)], ["Cr\xE9neau", esc(d.creneau_appel)], ["Message", esc(d.message).replace(/\n/g, "<br>")]]);
  } else {
    corps += titreBloc("Le projet") + lignes([["Projet", esc(d.projet)], ["Message", esc(d.message).replace(/\n/g, "<br>")]]);
  }
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(sujet)}</title></head>
<body style="margin:0;padding:0;background:${FOND}">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${FOND}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse">
<tr><td style="background:${NOIR};padding:26px 32px"><img src="${site}/assets/img/email/firstdiff-clair.png" width="120" alt="FIRST DIFF" style="display:block;border:0;height:auto"></td></tr>
<tr><td style="padding:30px 32px 0"><div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${GRIS}">${esc(f.sous)}</div>
<div style="font:300 28px/1.25 Helvetica,Arial,sans-serif;color:${NOIR};margin-top:8px">${esc(f.titre)}</div></td></tr>
${corps}
<tr><td style="padding:30px 32px">${d.telephone ? bouton("tel:" + tel, "Rappeler le client") : ""}</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid ${LIGNE};font:12px/1.5 Helvetica,Arial,sans-serif;color:${GRIS}">Demande envoy\xE9e depuis firstdiff.com. R\xE9pondez directement \xE0 cet e-mail pour \xE9crire au client.${d.apercuJoint ? " L\u2019aper\xE7u de la composition est aussi en pi\xE8ce jointe." : ""}</td></tr>
</table></td></tr></table></body></html>`;
  const texte = [
    f.titre,
    "",
    `Nom : ${d.nom || ""}`,
    `T\xE9l\xE9phone : ${d.telephone || ""}`,
    `E-mail : ${d.email || ""}`,
    d.code_postal ? `Code postal : ${d.code_postal}` : "",
    "",
    d.configuration || d.message || "",
    d.lien_3d ? `
Cuisine en 3D : ${d.lien_3d}` : ""
  ].filter((x) => x !== null).join("\n");
  return { sujet, html, texte };
}
__name(composer, "composer");
__name2(composer, "composer");
var FORMULAIRES2 = ["configuration-cuisine", "visite-showroom", "rappel-particulier", "rendez-vous-pro"];
var MERCI = { "configuration-cuisine": "/merci?demande=chiffrage", "visite-showroom": "/merci?demande=visite", "rendez-vous-pro": "/merci?demande=rendez-vous" };
function base64(buffer) {
  const octets = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < octets.length; i += 32768)
    s += String.fromCharCode.apply(null, octets.subarray(i, i + 32768));
  return btoa(s);
}
__name(base64, "base64");
__name2(base64, "base64");
function reponse(request, ok, nom, message) {
  const json = (request.headers.get("Accept") || "").includes("application/json");
  if (json)
    return new Response(JSON.stringify({ ok, message }), { status: ok ? 200 : 500, headers: { "Content-Type": "application/json" } });
  if (ok)
    return Response.redirect(new URL(MERCI[nom] || "/merci", request.url), 303);
  return new Response("L\u2019envoi n\u2019a pas abouti. Appelez-nous au +33 6 64 35 77 28.", { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
__name(reponse, "reponse");
__name2(reponse, "reponse");
async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response("Formulaire illisible", { status: 400 });
  }
  const nom = String(form.get("form-name") || "");
  if (!FORMULAIRES2.includes(nom))
    return new Response("Formulaire inconnu", { status: 400 });
  if (String(form.get("adresse-web") || "").trim())
    return reponse(request, true, nom);
  const d = {};
  let image = null;
  for (const [k, v] of form.entries()) {
    if (k === "form-name" || k === "adresse-web")
      continue;
    if (typeof v === "string")
      d[k] = v.slice(0, 2e4);
    else if (k === "apercu" && v.size && v.size < 8e6)
      image = v;
  }
  if (!d.nom || !(d.email || d.telephone))
    return new Response("Champs manquants", { status: 400 });
  const site = new URL(request.url).origin;
  if (image) {
    d.apercu = "cid:apercu";
    d.apercuJoint = true;
  }
  const { sujet, html, texte } = composer(nom, d, site);
  if (!env.RESEND_API_KEY)
    return reponse(request, false, nom, "RESEND_API_KEY manquante");
  const corps = {
    from: env.MAIL_FROM || "Site FIRST DIFF <site@firstdiff.com>",
    to: [env.MAIL_TO || "contact@firstdiff.com"],
    subject: sujet,
    html,
    text: texte
  };
  if (d.email)
    corps.reply_to = `${String(d.nom || "").replace(/[<>"]/g, "")} <${d.email}>`;
  if (image)
    corps.attachments = [{ filename: "composition.jpg", content: base64(await image.arrayBuffer()), content_id: "apercu" }];
  let r;
  try {
    r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${String(env.RESEND_API_KEY).trim()}`, "Content-Type": "application/json" },
      body: JSON.stringify(corps)
    });
  } catch (e) {
    console.log("Resend injoignable", e.message);
    return reponse(request, false, nom, "Service d\u2019envoi injoignable");
  }
  if (!r.ok) {
    const detail = await r.text();
    console.log("Resend", r.status, detail);
    return reponse(request, false, nom, `Resend ${r.status} : ${detail.slice(0, 300)}`);
  }
  return reponse(request, true, nom);
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestGet({ env }) {
  const info = { fonction: "ok", cle_resend: env.RESEND_API_KEY ? "pr\xE9sente" : "ABSENTE", destinataire: env.MAIL_TO || "contact@firstdiff.com", expediteur: env.MAIL_FROM || "Site FIRST DIFF <site@firstdiff.com>" };
  if (env.RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${String(env.RESEND_API_KEY).trim()}` } });
      const t = await r.text();
      let j = null;
      try {
        j = JSON.parse(t);
      } catch {
      }
      info.resend_statut = r.status;
      info.resend_reponse = j && Array.isArray(j.data) ? j.data.map((x) => `${x.name} : ${x.status}`) : t.slice(0, 300);
    } catch (e) {
      info.resend_statut = "injoignable";
      info.resend_reponse = String(e.message || e);
    }
  }
  return new Response(JSON.stringify(info, null, 1), { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
var routes = [
  {
    routePath: "/api/demande",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/demande",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url2 = input;
        if (typeof input === "string") {
          url2 = new URL(input, request.url).toString();
        }
        request = new Request(url2, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = /* @__PURE__ */ __name(class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
}, "__Facade_ScheduledController__");
__name2(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../tmp/lh/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../tmp/lh/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-WSMHJV/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../tmp/lh/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-WSMHJV/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__2, "__Facade_ScheduledController__");
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.5531159283026381.js.map
