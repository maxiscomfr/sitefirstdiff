// Contenus du site : coordonnées, collections et portraits Armony, catalogues.
// Tout ce qui peut changer sans toucher au design se modifie ici.

export const CONTACT = {
  societe: 'FirstDiff',
  interlocuteur: 'Jérôme Rivault',
  telephone: '+33 6 64 35 77 28',
  telephoneLien: '+33664357728',
  email: 'jrivault@firstdiff.fr',
  showroom: 'Showroom FirstDiff — Tours Nord',
  ville: '37100 Tours',
  acces: 'Sur rendez-vous uniquement',
  secteur: [
    ['37', 'Indre-et-Loire'], ['41', 'Loir-et-Cher'], ['86', 'Vienne'], ['85', 'Vendée'],
    ['79', 'Deux-Sèvres'], ['17', 'Charente-Maritime'], ['16', 'Charente'], ['87', 'Haute-Vienne'],
    ['33', 'Gironde'], ['24', 'Dordogne'], ['47', 'Lot-et-Garonne'],
  ],
};

// Les photos viennent du site armonycucine.it. Si elles ont été copiées sur le site
// (outils/telecharger-photos-armony.sh), PHOTOS_LOCALES passe à true et elles sont
// servies depuis assets/img/armony/.
export const PHOTOS_LOCALES = false;
const DISTANT = 'https://www.armonycucine.it/wp-content/uploads/';

export function photoDistante(chemin) { return DISTANT + chemin; }

export function photo(chemin) {
  const nom = chemin.split('/').pop();
  return PHOTOS_LOCALES ? `assets/img/armony/${nom}` : DISTANT + chemin;
}

const p = (prefixe, ...noms) => noms.map((n) => `2017/05/${prefixe}${n}`);

export const COLLECTIONS = [
  { id: 'system', nom: 'System', accroche: 'Des profilés métalliques qui font de la cuisine un projet d’architecture.',
    style: 'Architecturale', image: '2023/07/EVI-SYSTEM-HD-2.webp', portraits: ['p02', 'p01'] },
  { id: 'yota', nom: 'Yota', accroche: 'Élégante, tout entière tournée vers l’équilibre des formes.',
    style: 'Équilibre', image: '2026/07/EVI-YOTA-HD-2.webp', portraits: ['p06', 'p07', 'p12', 'p13', 'p27', 'p32'] },
  { id: 'rho', nom: 'Rho', accroche: 'Un modèle historique qui marie innovation et tradition, façade de 22 mm.',
    style: 'Matière', image: '2023/07/EVI-RHO-HD-2.webp', portraits: ['p05', 'p04', 'p09', 'p18', 'p34', 'p03', 'p15'] },
  { id: 'kappa', nom: 'Kappa', accroche: 'Lignes franches et finitions métal pour une cuisine de caractère.',
    style: 'Caractère', image: '2023/07/EVI-KAPPA-HD-2.webp', portraits: ['p05', 'p03'] },
  { id: 'tau', nom: 'Tau', accroche: 'La rigueur d’un dessin épuré, pensée pour durer.',
    style: 'Épure', image: '2023/07/EVI-TAU-HD-2.webp', portraits: [] },
  { id: 'riga', nom: 'Riga', accroche: 'Le rythme des façades rainurées, en bois ou en laque.',
    style: 'Rythme', image: '2023/07/EVI-RIGA-HD-2.webp', portraits: ['p27', 'p32'] },
  { id: 'diamond', nom: 'Diamond', accroche: 'Des reflets et des facettes pour une cuisine qui capte la lumière.',
    style: 'Lumière', image: '2023/07/EVI-DIAMOND-HD-2.webp', portraits: [] },
  { id: 'omicron', nom: 'Omicron', accroche: 'Des volumes doux et une présence sculpturale.',
    style: 'Sculpture', image: '2023/07/EVI-OMICRON-HD-2.webp', portraits: [] },
  { id: 'quadro', nom: 'Quadro', accroche: 'La façade cadre, une signature intemporelle réinterprétée.',
    style: 'Intemporel', image: '2023/07/EVI-QUADRO-HD-2.webp', portraits: [] },
  { id: 'equa', nom: 'Equa', accroche: 'La juste mesure entre fonction et esthétique.',
    style: 'Mesure', image: '2023/07/EVI-EQUA-HD-2.webp', portraits: [] },
  { id: 'etro', nom: 'Etro', accroche: 'Une cuisine de matières, chaleureuse et contemporaine.',
    style: 'Chaleur', image: '2023/07/EVI-ETRO-HD-2.webp', portraits: [] },
  { id: 'skyline', nom: 'Skyline', accroche: 'La porte Skyline : une ligne d’horizon dessinée dans la façade.',
    style: 'Horizon', image: '2023/07/EVI-SKYLINE-HD-2.webp', portraits: ['p27'] },
];

// Les « portraits » Armony : des projets complets, avec leurs finitions.
export const PORTRAITS = {
  p01: { titre: 'Portrait 01', modeles: 'System + Yota',
    finitions: ['Colonnes, bas et hauts — Polaris Midnight, laque Polaris', 'Îlot — Noce Elegante, stratifié bois', 'Plan — Onyx White, grès'],
    images: p('Portrait01-SystemYota-', '1-WEB.webp', '3-WEB.webp', '2-WEB.webp', '5-WEB.webp', '4-WEB.webp', '9-WEB.webp', '6-WEB.webp', '8-WEB.webp') },
  p02: { titre: 'Portrait 02', modeles: 'System',
    finitions: ['Bas, hauts et colonnes — Nebbia, stratifié mat', 'Colonnes et hauts — Olmo Naturale, stratifié bois', 'Plan — Calacatta Black, grès', 'Profilés — noir ou or antique'],
    images: p('Portrait02-', 'System-7-WEB.webp', 'Living-0-WEB.webp', 'System-1-WEB.webp', 'System-2-WEB.webp', 'System-8-WEB.webp', 'System-4-WEB.webp', 'System-6-WEB.webp', 'Living-1-WEB.webp', 'System-3-WEB.webp') },
  p03: { titre: 'Portrait 03', modeles: 'Rho + Kappa',
    finitions: ['Colonnes — Quercia Riviera, stratifié bois', 'Bas et hauts — Satin Brass, X-Steel', 'Plan — Taj Mahal, grès'],
    images: p('Portrait03-', 'RhoKappa-1-WEB.webp', 'RhoKappa-3-WEB.webp', 'RhoKappa-5-WEB.webp', 'RhoKappa-2-WEB.webp', 'Living-1-WEB.webp', 'Outdoor-1-WEB.webp') },
  p04: { titre: 'Portrait 04', modeles: 'Rho',
    finitions: ['Colonnes, îlot et hauts — Silver Spark, stratifié métal', 'Bas et plan — Midnight Spark, stratifié métal'],
    images: p('Portrait04-Rho-Jit-', '0-WEB.webp', '2-WEB.webp', '1-WEB.webp', '6-WEB.webp', '3-WEB.webp', '7-WEB.webp') },
  p05: { titre: 'Portrait 05', modeles: 'Kappa + Rho',
    finitions: ['Table — Twilight, stratifié bois', 'Bas et plan — Matera Perla, stratifié structuré', 'Bas, colonnes, hauts et îlot — Satin Brass, X-Steel'],
    images: p('Portrait05-', 'Kappa-Rho-Jit-1-WEB.webp', 'Kappa-Rho-Jit-4-WEB.webp', 'Kappa-Rho-Jit-2-WEB.webp', 'Kappa-Rho-Jit-6-WEB.webp', 'Living-1-WEB.webp', 'Living-2-WEB.webp') },
  p06: { titre: 'Portrait 06', modeles: 'Yota',
    finitions: ['Table — Tinto Olmo Châtaignier', 'Bas et hauts — Oro Vintage light', 'Colonnes et bas — Talco, laque micalisée'],
    images: p('Portrait06-Yota-', '1-WEB.webp', '3-WEB.webp', '2-WEB.webp', '4-WEB.webp', '6-WEB.webp') },
  p07: { titre: 'Portrait 07', modeles: 'Yota',
    finitions: ['Colonnes et îlot — Station, chêne de fil', 'Bas — Arenaria Micalux'],
    images: p('Portrait07-Yota-', '1-WEB.webp', '2-WEB.webp', '3-WEB.webp', '7-WEB.webp', '4-WEB.webp', '5-WEB.webp') },
  p09: { titre: 'Portrait 09', modeles: 'Rho',
    finitions: ['Colonnes — Quercia Notte, stratifié bois', 'Bas — Matera Perla, stratifié structuré', 'Plan — Fenix Nero', 'Hauts — Salvia, stratifié mat'],
    images: p('Portrait09-Rho-Rho-Jit-', '1-WEB.webp', '7-WEB.webp', '2-WEB.webp', '6-WEB.webp', '3-WEB.webp') },
  p12: { titre: 'Portrait 12', modeles: 'Yota',
    finitions: ['Îlot et hauts — Noce, noyer', 'Colonnes et bas — Ambra, laque métal', 'Plan — Travertino Bianco, grès'],
    images: p('Portrait12-Yota-', '1-WEB.webp', '10-WEB.webp', '2-WEB.webp', '9-WEB.webp', '3-WEB.webp', '7-WEB.webp', '4-WEB.webp') },
  p13: { titre: 'Portrait 13', modeles: 'Yota',
    finitions: ['Bas et îlot — Talco, laque micalisée', 'Colonnes — Blu Petrolio, laque micalisée'],
    images: p('Portrait13-Yota-', '1-WEB.webp', '3-WEB.webp', '2-WEB.webp', '5-WEB.webp', '4-WEB.webp', '6-WEB.webp') },
  p15: { titre: 'Portrait 15', modeles: 'Rho + Yota',
    finitions: ['Colonnes et hauts — Creta, stratifié bois', 'Colonnes et hauts — Lavagna, laque gaufrée', 'Plan — Black Rock'],
    images: p('Portrait15-Rho-Yota-', '1-WEB.webp', '4-WEB.webp', '3-WEB.webp', '2-WEB1.webp') },
  p18: { titre: 'Portrait 18', modeles: 'Rho',
    finitions: ['Bas — X-Black Matt', 'Colonnes et hauts — Noce Elegante, stratifié bois', 'Plan — Smoke Stone, stratifié structuré'],
    images: p('Portrait18-Rho-', '1-WEB.webp', '4-WEB.webp', '3-WEB.webp', '6-WEB.webp', '9-WEB.webp', '2-WEB.webp') },
  p27: { titre: 'Portrait 27', modeles: 'Skyline + Yota + Riga',
    finitions: ['Colonnes — Noce, noyer', 'Îlot et plan — Pietra Grey, Laminam', 'Bas et colonnes — Blu Petrolio, laque micalisée'],
    images: p('Portrait27-SKYLINE-YOTA-RIGA-', '1-WEB.webp', '2-WEB.webp', '3-WEB.webp', '5-WEB.webp', '4-WEB.webp', '6-WEB.webp') },
  p32: { titre: 'Portrait 32', modeles: 'Riga + Yota',
    finitions: ['Bas et colonnes — Neve, laque mate', 'Hauts — Station, chêne rayé', 'Colonnes et muraux Riga — Station, chêne flammé'],
    images: p('PORTRAIT-7_RIGAYOTA-', '1-1.webp', '3-1.webp', '2-1.webp', '31-1.webp', '32-1.webp', '5.webp') },
  p34: { titre: 'Portrait 34', modeles: 'Rho',
    finitions: ['Plan — Sale, grès', 'Colonnes et îlot — Moka, laque mate', 'Bas et colonnes — Lamina Brunito, mélaminé métal'],
    images: p('PORTRAIT-1_', 'RHO2-1.webp', 'RHO5-1.webp', 'RHO3-2.webp', 'RHO6-1.webp', 'RHO4-1.webp', 'RHO1-1.webp') },
};

// Ordre d'affichage du carrousel des portraits
export const ORDRE_PORTRAITS = ['p01', 'p27', 'p12', 'p05', 'p13', 'p02', 'p18', 'p32', 'p03', 'p06', 'p04', 'p34', 'p07', 'p09', 'p15'];

// Catalogues proposés aux professionnels. Déposer les PDF dans /catalogues/ avec ces noms.
// Un catalogue dont le fichier est absent s'affiche « sur demande ».
export const CATALOGUES = [
  { titre: 'Armony Collection 2026', detail: 'Les douze collections, toutes les finitions', fichier: 'catalogues/armony-collection-2026.pdf', marque: 'Armony' },
  { titre: 'Collezione Anniversario 50', detail: 'L’édition anniversaire des 50 ans', fichier: 'catalogues/armony-collezione-50.pdf', marque: 'Armony' },
  { titre: 'Portraits Armony', detail: 'Les projets photographiés, finition par finition', fichier: 'catalogues/armony-portraits.pdf', marque: 'Armony' },
  { titre: 'Nuancier & matériaux', detail: 'Laques, stratifiés, bois, grès et Laminam', fichier: 'catalogues/armony-nuancier.pdf', marque: 'Armony' },
  { titre: 'Tarif professionnel Armony', detail: 'Réservé aux revendeurs, envoyé après échange', fichier: null, marque: 'Armony' },
  { titre: 'Beckermann', detail: 'La cuisine allemande, en complément de gamme', fichier: 'catalogues/beckermann.pdf', marque: 'Beckermann' },
];
