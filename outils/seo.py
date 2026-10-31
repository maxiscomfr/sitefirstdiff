#!/usr/bin/env python3
from datetime import date
"""Balises de référencement du site : title, description, canonical, Open Graph, Twitter, JSON-LD,
sitemap.xml et robots.txt.

Usage :  python3 outils/seo.py https://www.votre-domaine.fr
Sans argument, l'adresse enregistrée dans outils/adresse-du-site.txt est reprise (marqueur tant que le
domaine n'est pas choisi). Le script peut être relancé autant de fois que nécessaire.
"""
import json, re, sys
from html import escape, unescape
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
FICHIER_ADRESSE = RACINE / 'outils' / 'adresse-du-site.txt'
if len(sys.argv) > 1:
    FICHIER_ADRESSE.write_text(sys.argv[1].rstrip('/') + '\n')
SITE = (FICHIER_ADRESSE.read_text().strip() if FICHIER_ADRESSE.exists() else 'https://SITE_A_COMPLETER').rstrip('/')

TEL, MAIL = '+33664357728', 'jrivault@firstdiff.fr'
DESC_ACCUEIL = 'FirstDiff présente les cuisines italiennes Armony Cucine à Tours : collections, configurateur 3D et showroom à Tours Nord, pour particuliers et professionnels.'
PAGES = [
    dict(f='index.html', url='/', titre='Cuisines italiennes Armony à Tours | FirstDiff', desc=DESC_ACCUEIL, nom='Accueil'),
    dict(f='particuliers.html', url='/particuliers.html', titre='Composer sa cuisine Armony | FirstDiff',
         desc='Collections et portraits Armony Cucine, conseils pour bien choisir, configurateur 3D et chiffrage par FirstDiff, showroom de Tours Nord. Cuisine italienne sur mesure.', nom='Particuliers'),
    dict(f='professionnels.html', url='/professionnels.html', titre='Revendeurs : Armony dans votre magasin | FirstDiff',
         desc='Cuisinistes, architectes d’intérieur, agenceurs : catalogues Armony, accompagnement FirstDiff et rendez-vous avec votre agent, showroom de Tours Nord.', nom='Professionnels'),
    dict(f='configurateur.html', url='/configurateur.html', titre='Configurateur de cuisine 3D | FirstDiff',
         desc='Posez vos meubles Armony dans votre pièce en 3D, avec les finitions du catalogue 2026, et recevez le chiffrage de FirstDiff, showroom de Tours Nord.', nom='Configurateur 3D', parent='particuliers'),
    dict(f='mentions-legales.html', url='/mentions-legales.html', titre='Mentions légales | FirstDiff', desc='Mentions légales du site FirstDiff, cuisines italiennes Armony à Tours : éditeur, hébergeur, propriété intellectuelle et données personnelles.', nom='Mentions légales'),
    dict(f='confidentialite.html', url='/confidentialite.html', titre='Politique de confidentialité | FirstDiff', desc='Données recueillies par les formulaires de FirstDiff, finalités, durée de conservation et droits d’accès, de rectification et de suppression.', nom='Confidentialité'),
    dict(f='merci.html', url='/merci.html', titre='Demande envoyée | FirstDiff', desc='Votre demande est bien arrivée chez FirstDiff.', nom='Merci', noindex=True),
    dict(f='404.html', url='/404.html', titre='Page introuvable | FirstDiff', desc='Cette page n’existe pas.', nom='Page introuvable', noindex=True),
]
secteur = re.findall(r"\['(\d\d)', '([^']+)'\]", (RACINE / 'assets/js/donnees.js').read_text())
PAGE_PAR_URL = {p['url']: p for p in PAGES}

def faq(html):
    q = []
    for m in re.finditer(r'<details[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>', html, re.S):
        q.append({'@type': 'Question', 'name': unescape(re.sub('<[^>]+>', '', m.group(1))).strip(),
                  'acceptedAnswer': {'@type': 'Answer', 'text': unescape(re.sub('<[^>]+>', '', m.group(2))).strip()}})
    return q

def bloc(p, html):
    url = SITE + p['url']
    img = SITE + '/assets/img/og.jpg'
    t, d = escape(p['titre']), escape(p['desc'], quote=True)
    lignes = [f'<title>{t}</title>', f'<meta name="description" content="{d}">']
    if p.get('noindex'):
        lignes.append('<meta name="robots" content="noindex">')
    else:
        lignes += [f'<link rel="canonical" href="{url}">',
                   '<meta property="og:type" content="website">', '<meta property="og:locale" content="fr_FR">',
                   '<meta property="og:site_name" content="FirstDiff">',
                   f'<meta property="og:title" content="{t}">', f'<meta property="og:description" content="{d}">',
                   f'<meta property="og:url" content="{url}">', f'<meta property="og:image" content="{img}">',
                   '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
                   '<meta property="og:image:alt" content="Cuisine italienne Armony Cucine présentée par FirstDiff">',
                   '<meta name="twitter:card" content="summary_large_image">',
                   f'<meta name="twitter:title" content="{t}">', f'<meta name="twitter:description" content="{d}">',
                   f'<meta name="twitter:image" content="{img}">']
        graphe = [{
            '@type': 'LocalBusiness', '@id': SITE + '/#entreprise', 'name': 'FirstDiff', 'url': SITE + '/', 'logo': SITE + '/assets/img/og.jpg',
            'description': 'Cuisines italiennes Armony Cucine : collections, configurateur 3D, showroom à Tours Nord, sur rendez-vous.',
            'url': SITE + '/', 'image': img, 'telephone': '+33 6 64 35 77 28', 'email': MAIL,
            'address': {'@type': 'PostalAddress', 'postalCode': '37100', 'addressLocality': 'Tours', 'addressCountry': 'FR'},
            'areaServed': [{'@type': 'AdministrativeArea', 'name': n} for _, n in secteur],
        }]
        if p['url'] != '/':
            trail = [('Accueil', '/')]
            if p.get('parent'):
                trail.append((PAGE_PAR_URL['/' + p['parent'] + '.html']['nom'], '/' + p['parent'] + '.html'))
            trail.append((p['nom'], p['url']))
            graphe.append({'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + u} for i, (n, u) in enumerate(trail)]})
        else:
            graphe.append({'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE + '/'}]})
        q = faq(html)
        if q:
            graphe.append({'@type': 'FAQPage', 'mainEntity': q})
        lignes.append('<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': graphe}, ensure_ascii=False) + '</script>')
    return '  <!-- seo:début -->\n  ' + '\n  '.join(lignes) + '\n  <!-- seo:fin -->\n'

for p in PAGES:
    fichier = RACINE / p['f']
    html = fichier.read_text()
    html = re.sub(r'[ \t]*<!-- seo:début -->.*?<!-- seo:fin -->\n', '', html, flags=re.S)
    for motif in [r'[ \t]*<title>.*?</title>\n', r'[ \t]*<meta name="description"[^>]*>\n', r'[ \t]*<meta name="robots"[^>]*>\n',
                  r'[ \t]*<meta (?:property|name)="(?:og|twitter):[^"]*"[^>]*>\n', r'[ \t]*<link rel="canonical"[^>]*>\n']:
        html = re.sub(motif, '', html, flags=re.S)
    html = re.sub(r'(<meta name="viewport"[^>]*>\n)', lambda m: m.group(1) + bloc(p, html), html, count=1)
    fichier.write_text(html)

urls = [p for p in PAGES if not p.get('noindex')]
(RACINE / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{SITE}{p["url"]}</loc><lastmod>{date.today().isoformat()}</lastmod><changefreq>monthly</changefreq><priority>{"1.0" if p["url"] == "/" else "0.8" if p["url"] in ("/particuliers.html", "/professionnels.html", "/configurateur.html") else "0.3"}</priority></url>\n' for p in urls) + '</urlset>\n')
(RACINE / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
print('Adresse du site :', SITE)
