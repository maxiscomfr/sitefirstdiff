#!/usr/bin/env python3
"""Pages locales « Cuisine italienne Armony à <ville> » : une page par ville du secteur.

Usage :  python3 outils/villes.py      (puis python3 outils/seo.py pour les balises et le sitemap)
Le texte propre à chaque ville est dans VILLES ; le reste de la page est commun.
Les distances sont des ordres de grandeur par la route depuis Tours.
"""
from pathlib import Path
from html import escape

RACINE = Path(__file__).resolve().parent.parent

VILLES = [
    dict(slug='tours', ville='Tours', dep='Indre-et-Loire', cp='37', photo='Portrait01-SystemYota-1-WEB.webp',
         titre='Cuisine italienne Armony à Tours',
         desc='Cuisines italiennes Armony Cucine à Tours : showroom FirstDiff à Tours Nord sur rendez-vous, configurateur 3D, chiffrage détaillé et pose par un cuisiniste partenaire.',
         accroche='Le showroom FirstDiff est à Tours Nord : ici, votre cuisine Armony se choisit en touchant les matières.',
         intro=[
             'À Tours, FirstDiff vous reçoit dans son showroom de Tours Nord, sur rendez-vous, tous les jours de 9 h à 19 h. Vous y comparez les façades, les plans de travail et les profilés Armony à la lumière du jour, avec le temps qu’il faut.',
             'Maison en tuffeau du Vieux-Tours, appartement des Prébendes, construction neuve à Fondettes, Saint-Cyr-sur-Loire ou Joué-lès-Tours : chaque pièce a ses contraintes. Hauteur sous plafond, murs anciens peu d’équerre, cuisine ouverte sur le séjour… nous partons de votre plan, pas d’un modèle d’exposition.',
         ],
         conseil=('Pierre de tuffeau et cuisine contemporaine',
                  'Dans les maisons tourangelles, une façade laquée mate ou un bois clair comme le chêne naturel répond bien à la pierre blanche et aux poutres. Pour les grandes pièces de vie, l’îlot central avec plan en grès donne une vraie présence sans alourdir l’espace.'),
         faq=[('Où se trouve le showroom FirstDiff ?', 'À Tours Nord (37100). Les visites se font sur rendez-vous, tous les jours de 9 h à 19 h : appelez-nous ou laissez vos coordonnées, nous fixons un créneau ensemble.'),
              ('Intervenez-vous dans toute l’agglomération ?', 'Oui : Tours, Saint-Cyr-sur-Loire, Saint-Avertin, Joué-lès-Tours, Chambray-lès-Tours, La Riche, Fondettes, Saint-Pierre-des-Corps et les communes alentour. La pose est assurée par un cuisiniste partenaire proche de chez vous.')]),
    dict(slug='amboise', ville='Amboise', dep='Indre-et-Loire', cp='37', photo='Portrait02-System-1-WEB.webp',
         titre='Cuisine italienne Armony à Amboise',
         desc='Cuisines Armony Cucine à Amboise et dans le Val de Loire : showroom FirstDiff à Tours, à une trentaine de minutes, configurateur 3D et chiffrage détaillé.',
         accroche='À une trentaine de minutes du showroom de Tours, votre cuisine italienne se prépare sans détour.',
         intro=[
             'Amboise est à environ 25 km du showroom FirstDiff de Tours Nord. Beaucoup de nos clients du Val de Loire viennent une première fois voir les matières, puis le projet avance par téléphone et par e-mail jusqu’au chiffrage.',
             'Longères rénovées, maisons de bourg, constructions récentes sur les coteaux : les cuisines Armony s’adaptent aux pièces anciennes comme aux volumes ouverts, avec des hauteurs de colonnes de 138 à 229 cm et des meubles sur mesure.',
         ],
         conseil=('Rénovation d’une maison ancienne',
                  'Dans une longère, une cuisine à cadre comme Equa ou Quadro garde l’esprit de la maison tout en offrant le confort d’aujourd’hui : tiroirs Blum à fermeture amortie, caisson de 18 mm, électroménager encastré.'),
         faq=[('Faut-il venir au showroom de Tours ?', 'Ce n’est pas obligatoire, mais c’est conseillé : voir et toucher les façades et les plans de travail aide beaucoup à choisir. Depuis Amboise, comptez une trentaine de minutes.'),
              ('Qui pose la cuisine à Amboise ?', 'Un cuisiniste partenaire proche de chez vous. FirstDiff reste votre interlocuteur unique, du premier échange à la livraison.')]),
    dict(slug='blois', ville='Blois', dep='Loir-et-Cher', cp='41', photo='Portrait03-RhoKappa-1-WEB.webp',
         titre='Cuisine italienne Armony à Blois',
         desc='Cuisines italiennes Armony Cucine à Blois et dans le Loir-et-Cher : conception avec FirstDiff, showroom de Tours accessible par l’A10, configurateur 3D et chiffrage.',
         accroche='Du Loir-et-Cher au showroom de Tours, il n’y a qu’une heure de route pour choisir votre cuisine Armony.',
         intro=[
             'Blois est à environ 60 km du showroom FirstDiff de Tours Nord, par l’A10 ou par la vallée de la Loire. Vous pouvez commencer votre projet en ligne, avec le configurateur 3D, et venir ensuite comparer les finitions sur place.',
             'Maisons de ville en pierre près du château, pavillons de Vineuil ou de La Chaussée-Saint-Victor, fermes rénovées de Sologne : nous dessinons une cuisine adaptée à la pièce, à votre façon de cuisiner et au budget que vous vous fixez.',
         ],
         conseil=('Une cuisine qui vit avec le séjour',
                  'Quand la cuisine s’ouvre sur la pièce de vie, les façades sans poignée et les colonnes toute hauteur effacent l’aspect technique. Les modèles Rho et Kappa, en laque UV mate, sont faits pour cela.'),
         faq=[('Peut-on avancer le projet à distance ?', 'Oui : vous composez votre cuisine dans le configurateur, nous vous appelons pour préciser les mesures, et la proposition détaillée vous est envoyée. Le passage au showroom de Tours reste conseillé pour choisir les matières.'),
              ('Intervenez-vous dans tout le Loir-et-Cher ?', 'Oui, le Loir-et-Cher fait partie de notre secteur. La pose est réalisée par un cuisiniste partenaire près de chez vous.')]),
    dict(slug='poitiers', ville='Poitiers', dep='Vienne', cp='86', photo='Portrait04-Rho-Jit-1-WEB.webp',
         titre='Cuisine italienne Armony à Poitiers',
         desc='Cuisines italiennes Armony Cucine à Poitiers et dans la Vienne : projet suivi par FirstDiff, showroom de Tours à environ une heure par l’A10, configurateur 3D.',
         accroche='Poitiers et la Vienne : une cuisine italienne sur mesure, un interlocuteur unique du plan à la pose.',
         intro=[
             'Poitiers est à environ 100 km du showroom FirstDiff de Tours Nord, soit à peu près une heure par l’A10. Le projet peut démarrer par téléphone ou avec le configurateur 3D, puis se préciser lors d’une visite au showroom.',
             'Appartements du centre historique, maisons en pierre calcaire du Poitou, constructions neuves autour de Buxerolles ou de Chasseneuil-du-Poitou : nous tenons compte des contraintes de la pièce, des arrivées d’eau et de la place de la hotte dès le premier plan.',
         ],
         conseil=('Optimiser une cuisine de centre-ville',
                  'Dans une cuisine plus compacte, les meubles hauts jusqu’au plafond et les tiroirs sur toute la hauteur des meubles bas multiplient le rangement. Une façade claire et un plan de travail fin agrandissent visuellement la pièce.'),
         faq=[('Le showroom de Tours est-il loin de Poitiers ?', 'Comptez environ une heure par l’A10. Les visites se font sur rendez-vous, tous les jours de 9 h à 19 h.'),
              ('Qui installe la cuisine dans la Vienne ?', 'Un cuisiniste partenaire proche de chez vous. FirstDiff suit le projet de bout en bout.')]),
    dict(slug='niort', ville='Niort', dep='Deux-Sèvres', cp='79', photo='PORTRAIT-7_RIGAYOTA-1-1.webp',
         titre='Cuisine italienne Armony à Niort',
         desc='Cuisines italiennes Armony Cucine à Niort et dans les Deux-Sèvres : conception avec FirstDiff, configurateur 3D, chiffrage détaillé et pose par un partenaire local.',
         accroche='Dans les Deux-Sèvres, votre cuisine Armony se conçoit avec FirstDiff, et se pose près de chez vous.',
         intro=[
             'Niort est à environ 200 km du showroom FirstDiff de Tours. La plupart des échanges se font donc par téléphone et par e-mail : vous nous décrivez la pièce, nous vous proposons des implantations et des finitions, puis une proposition détaillée.',
             'Maisons du Marais poitevin, pavillons de l’agglomération niortaise, rénovations en pierre : chaque projet est dessiné sur mesure, avec les douze collections Armony et plus de deux cents finitions.',
         ],
         conseil=('Bois et lumière naturelle',
                  'Les façades rainurées Riga ou le bois de Yota apportent de la chaleur aux pièces ouvertes sur le jardin. Associées à un plan de travail minéral, elles vieillissent très bien.'),
         faq=[('Peut-on faire tout le projet sans venir à Tours ?', 'Oui. Le configurateur 3D, les échanges par téléphone et l’envoi d’échantillons permettent d’avancer à distance. Une visite au showroom reste possible sur rendez-vous.'),
              ('Intervenez-vous dans les Deux-Sèvres ?', 'Oui, les Deux-Sèvres font partie de notre secteur, avec une pose réalisée par un cuisiniste partenaire.')]),
    dict(slug='la-rochelle', ville='La Rochelle', dep='Charente-Maritime', cp='17', photo='Portrait03-Living-1-WEB.webp',
         titre='Cuisine italienne Armony à La Rochelle',
         desc='Cuisines italiennes Armony Cucine à La Rochelle et en Charente-Maritime : matières adaptées au littoral, configurateur 3D et chiffrage par FirstDiff.',
         accroche='Sur le littoral charentais, une cuisine italienne pensée pour la lumière et l’air marin.',
         intro=[
             'La Rochelle est à environ 240 km du showroom FirstDiff de Tours. Le projet se mène à distance, par téléphone et par e-mail, avec le configurateur 3D comme point de départ, et une pose assurée par un cuisiniste partenaire de Charente-Maritime.',
             'Maisons de ville en pierre blanche, résidences secondaires de l’île de Ré ou d’Oléron, maisons contemporaines tournées vers la mer : la lumière y est forte et l’air plus humide, ce qui compte dans le choix des matières.',
         ],
         conseil=('Des matières qui tiennent en bord de mer',
                  'Près de la côte, les plans de travail en grès ou en Corian et les façades en Fenix ou en Lamitech supportent très bien l’humidité et la lumière. Les tons clairs, sable ou gris chaud, prolongent l’ambiance du littoral.'),
         faq=[('Les cuisines Armony supportent-elles le climat du littoral ?', 'Oui. Caisson de 18 mm classe E1, chants scellés, et des matières comme le grès, le Corian ou le Fenix, peu sensibles à l’humidité. Nous vous orientons vers les finitions les plus adaptées.'),
              ('Faites-vous des cuisines pour des résidences secondaires ?', 'Oui. Le projet peut avancer à distance, et la pose est organisée avec un cuisiniste partenaire du secteur.')]),
    dict(slug='angouleme', ville='Angoulême', dep='Charente', cp='16', photo='Portrait02-Living-1-WEB.webp',
         titre='Cuisine italienne Armony à Angoulême',
         desc='Cuisines italiennes Armony Cucine à Angoulême et en Charente : conception sur mesure avec FirstDiff, configurateur 3D, chiffrage et pose par un partenaire.',
         accroche='En Charente, une cuisine Armony dessinée pour votre maison, suivie par un seul interlocuteur.',
         intro=[
             'Angoulême est à environ 210 km du showroom FirstDiff de Tours. Nous menons le projet avec vous par téléphone et par e-mail, à partir du configurateur 3D ou de votre plan, jusqu’à une proposition détaillée.',
             'Maisons charentaises en pierre, appartements du plateau, rénovations dans le Cognaçais : nous adaptons l’implantation à la pièce, en linéaire, en L, en U ou avec un îlot.',
         ],
         conseil=('Une cuisine de caractère',
                  'Les façades à cadre Etro ou Quadro, en laque mate ou en bois, s’accordent avec les intérieurs en pierre et les tomettes. Un plan de travail en marbre ou en grès veiné complète l’ensemble.'),
         faq=[('Comment se passe un projet depuis la Charente ?', 'Vous nous décrivez la pièce ou composez votre cuisine en 3D, nous vous appelons pour préciser les mesures, puis vous recevez une proposition détaillée. La pose est assurée par un cuisiniste partenaire.'),
              ('Peut-on voir les matières avant de choisir ?', 'Oui, au showroom de Tours sur rendez-vous, ou grâce aux échantillons et aux catalogues que nous vous présentons.')]),
    dict(slug='limoges', ville='Limoges', dep='Haute-Vienne', cp='87', photo='Portrait02-System-8-WEB.webp',
         titre='Cuisine italienne Armony à Limoges',
         desc='Cuisines italiennes Armony Cucine à Limoges et en Haute-Vienne : projet sur mesure avec FirstDiff, configurateur 3D, chiffrage détaillé, pose par un partenaire.',
         accroche='En Haute-Vienne, l’exigence du travail bien fait : une cuisine italienne fabriquée dans le détail.',
         intro=[
             'Limoges est à environ 220 km du showroom FirstDiff de Tours. Le projet se mène à distance, par téléphone et par e-mail, et la pose est confiée à un cuisiniste partenaire de la région.',
             'Dans la ville des arts du feu, on sait reconnaître une fabrication soignée : caisson de 18 mm, façades de 22 mm, charnières acier réglables dans les trois directions et tiroirs Blum. Le soin se voit jusque dans ce qui est caché.',
         ],
         conseil=('Une cuisine architecturale',
                  'La collection System, avec ses profilés métalliques et sa large palette de finitions, se prête aux projets les plus dessinés : grands linéaires, colonnes toute hauteur, îlot traversant.'),
         faq=[('Intervenez-vous en Haute-Vienne ?', 'Oui, la Haute-Vienne fait partie de notre secteur. La pose est assurée par un cuisiniste partenaire proche de chez vous.'),
              ('Le chiffrage est-il gratuit ?', 'Oui, la proposition détaillée est sans engagement. Elle comprend les meubles, les finitions et l’électroménager choisis.')]),
    dict(slug='bordeaux', ville='Bordeaux', dep='Gironde', cp='33', photo='Portrait01-SystemYota-4-WEB.webp',
         titre='Cuisine italienne Armony à Bordeaux',
         desc='Cuisines italiennes Armony Cucine à Bordeaux et en Gironde : échoppes, appartements et maisons, conception sur mesure avec FirstDiff et configurateur 3D.',
         accroche='Échoppe, appartement en pierre de taille ou maison neuve : une cuisine italienne à la mesure de Bordeaux.',
         intro=[
             'Bordeaux est à environ 350 km du showroom FirstDiff de Tours. Les projets girondins se mènent à distance, par téléphone et par e-mail, avec une pose confiée à un cuisiniste partenaire de la région.',
             'L’échoppe bordelaise, longue et étroite, demande une implantation bien pensée : cuisine linéaire avec îlot, ou cuisine en L ouverte sur le jardin. Dans les appartements en pierre de taille, la hauteur sous plafond permet des colonnes de grande hauteur.',
         ],
         conseil=('Tirer parti d’une pièce en longueur',
                  'Dans une échoppe, un grand linéaire de colonnes intégrant four, réfrigérateur et rangements libère la vue, et un îlot avec plan en grès devient le centre de la pièce de vie.'),
         faq=[('Intervenez-vous en Gironde ?', 'Oui, la Gironde fait partie de notre secteur, comme la Dordogne et le Lot-et-Garonne. La pose est assurée par un cuisiniste partenaire.'),
              ('Comment avancer le projet sans venir à Tours ?', 'Avec le configurateur 3D, des échanges par téléphone et par e-mail, et une proposition détaillée. Une visite au showroom de Tours reste possible sur rendez-vous.')]),
]



def fichier(v):
    return f'cuisine-italienne-{v["slug"]}.html'


def page(v, version):
    e = escape
    autres = ''.join(f'<li><a href="{fichier(o)}">{e(o["ville"])}</a></li>' for o in VILLES if o is not v)
    faq_html = ''.join(f'<details><summary>{e(q)}</summary><p>{e(r)}</p></details>' for q, r in v['faq'])
    intro = ''.join(f'<p>{e(p)}</p>' for p in v['intro'])
    return f'''<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0a0a0a">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
  <link rel="preload" href="assets/fonts/jost-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" as="image" href="assets/img/armony/{v['photo']}" imagesrcset="assets/img/armony/960/{v['photo']} 960w, assets/img/armony/{v['photo']} 1920w" imagesizes="100vw">
  <link rel="stylesheet" href="assets/css/site.css?v={version}">
</head>
<body data-univers="particuliers" class="page-ville">
  <header class="entete"></header>

  <main id="contenu">
    <section class="heros heros-ville">
      <div class="heros-fond"><img src="assets/img/armony/{v['photo']}" srcset="assets/img/armony/960/{v['photo']} 960w, assets/img/armony/{v['photo']} 1920w" sizes="100vw" alt="Cuisine Armony Cucine, collection italienne présentée par FirstDiff" width="1920" height="1440" fetchpriority="high"></div>
      <div class="conteneur">
        <nav class="fil" aria-label="Fil d’Ariane"><a href="./">Accueil</a> / <a href="particuliers.html">Particuliers</a> / <span aria-current="page">{e(v['ville'])}</span></nav>
        <span class="surtitre revele">{e(v['dep'])} ({v['cp']})</span>
        <h1 class="display">Cuisine italienne<br><span class="italique">à {e(v['ville'])}</span></h1>
        <p class="chapo revele revele-d2" style="margin-top:26px">{e(v['accroche'])}</p>
        <div class="actions revele revele-d3">
          <a class="btn plein" href="configurateur.html">Composer ma cuisine <span class="fleche"></span></a>
          <a class="btn" href="particuliers.html#contact">Être rappelé</a>
        </div>
      </div>
    </section>

    <section class="bloc section-claire">
      <div class="conteneur ville-texte">
        <div>
          <span class="surtitre revele">Armony Cucine avec FirstDiff</span>
          <h2 class="titre revele revele-d1">Votre cuisine<br><span class="italique">à {e(v['ville'])}</span></h2>
        </div>
        <div class="revele revele-d2">{intro}</div>
      </div>
    </section>

    <section class="bloc section-claire ville-conseil">
      <div class="conteneur ville-texte">
        <div>
          <span class="surtitre revele">Notre conseil</span>
          <h2 class="titre-m revele revele-d1">{e(v['conseil'][0])}</h2>
        </div>
        <div class="revele revele-d2"><p>{e(v['conseil'][1])}</p>
          <p><a class="lien" href="particuliers.html#collections">Voir les douze collections Armony</a></p></div>
      </div>
    </section>

    <section class="bloc section-claire">
      <div class="conteneur">
        <div class="entete-section">
          <div>
            <span class="surtitre revele">Pourquoi Armony</span>
            <h2 class="titre revele revele-d1">Fabriquée en Italie, <span class="italique">pensée pour durer</span></h2>
          </div>
          <p class="chapo revele revele-d2">Cinquante ans de savoir-faire, une usine à Caneva, au nord-est de l’Italie, et plus de deux cents finitions.</p>
        </div>
        <div class="etapes">
          <div class="etape revele"><div class="n">18 mm</div><h3>Caisson</h3><p>Panneau de classe E1, à faibles émissions, issu de bois recyclé.</p></div>
          <div class="etape revele revele-d1"><div class="n">22 mm</div><h3>Façades</h3><p>Laques, bois, Fenix, Lamitech, verre ou grès, selon la collection.</p></div>
          <div class="etape revele revele-d2"><div class="n">3D</div><h3>Charnières</h3><p>En acier, à fermeture amortie, réglables dans les trois directions.</p></div>
          <div class="etape revele revele-d3"><div class="n">ISO</div><h3>Certifications</h3><p>ISO 9001, ISO 14001, FSC et CARB2 pour le site de production.</p></div>
        </div>
      </div>
    </section>

    <section class="bloc section-sombre" id="questions">
      <div class="conteneur rdv">
        <div>
          <span class="surtitre revele">Vos questions</span>
          <h2 class="titre revele revele-d1">Un projet<br><span class="italique">à {e(v['ville'])} ?</span></h2>
          <p class="chapo revele revele-d2" style="margin-top:22px">Appelez-nous de 9 h à 19 h, ou laissez vos coordonnées : nous vous rappelons.</p>
          <p class="revele revele-d3" style="margin-top:26px"><a class="lien" data-tel href="tel:+33664357728">+33 6 64 35 77 28</a></p>
          <p class="revele revele-d3"><a class="lien" href="particuliers.html#contact">Être rappelé</a></p>
        </div>
        <div class="faq revele">
          {faq_html}
          <details><summary>Comment se déroule un projet ?</summary><p>Vous composez votre cuisine dans le configurateur 3D ou vous nous décrivez vos envies. Nous vous appelons pour préciser les mesures, l’usage et le budget, puis vous recevez une proposition détaillée, finitions et électroménager compris. La cuisine est fabriquée en Italie, puis livrée et posée par un cuisiniste partenaire.</p></details>
        </div>
      </div>
    </section>

    <section class="bloc section-claire">
      <div class="conteneur">
        <span class="surtitre">Notre secteur</span>
        <h2 class="titre-m" style="margin-top:20px">Cuisines Armony <span class="italique">près de chez vous</span></h2>
        <ul class="villes">{autres}</ul>
      </div>
    </section>
  </main>

  <footer class="pied"></footer>
  <script type="module" src="assets/js/site.js?v={version}"></script>
</body>
</html>
'''


if __name__ == '__main__':
    import re
    version = re.search(r'site\.css\?v=([\w]+)', (RACINE / 'index.html').read_text()).group(1)
    for v in VILLES:
        (RACINE / fichier(v)).write_text(page(v, version))
    print(len(VILLES), 'pages locales écrites')
