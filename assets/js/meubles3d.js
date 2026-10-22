// Meubles Armony posables un par un, avec les finitions réelles du catalogue 2026.
// Chaque meuble a son origine au sol, au milieu de son dos : il se plaque contre un mur
// en mettant z = 0 et s'étend vers l'avant (+z) sur sa profondeur.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FINITIONS, FINITIONS_ALIAS } from './finitions.js?v=20261023c';
export { FINITIONS_ALIAS };

export const FIN = Object.fromEntries(FINITIONS.map((f) => [f.id, f]));

// Modèles du catalogue (p. 280-281) et façon de dessiner leurs façades
export const MODELES = {
  rho: { nom: 'Rho', porte: 'lisse', note: 'Essential · façade lisse, stratifié Lamitech' },
  rhojit: { nom: 'Rho JIT', porte: 'lisse', note: 'Essential · façade lisse, Lamitech JIT' },
  kappa: { nom: 'Kappa', porte: 'lisse', note: 'Essential · laque UV, X-Steel' },
  tau: { nom: 'Tau', porte: 'lisse', note: 'Essential · Fenix' },
  yota: { nom: 'Yota', porte: 'lisse', note: 'Essential · façade lisse, laques et bois' },
  system: { nom: 'System', porte: 'profil', note: 'Signature · profilés métalliques' },
  omicron: { nom: 'Omicron', porte: 'chant', note: 'Design · prise usinée à 33°' },
  diamond: { nom: 'Diamond', porte: 'chant', note: 'Design · chant sculpté' },
  riga: { nom: 'Riga', porte: 'rainure', note: 'Tactile · façade rainurée 3D, 23 mm' },
  equa: { nom: 'Equa', porte: 'cadre', cadre: { b: 0.055, recul: 0.009 }, note: 'Timeless · façade à cadre, laque mat UV' },
  quadro: { nom: 'Quadro', porte: 'cadre', cadre: { b: 0.05, recul: 0.01 }, note: 'Timeless · façade à cadre, bois ou laque' },
  etro: { nom: 'Etro', porte: 'cadre', cadre: { b: 0.065, recul: 0.01 }, note: 'Timeless · façade à cadre, PET et PVC' },
  skyline: { nom: 'Skyline', porte: 'alu', cadre: { b: 0.02, recul: 0.004 }, note: 'Tech · cadre aluminium, verre, grès' },
};

export const POIGNEES = {
  gorge: { nom: 'Gorge intégrée', note: 'Ring, Regola, Zeta, Verso' },
  maniglia: { nom: 'Maniglia', note: 'Poignée barre' },
  logica: { nom: 'Logica', note: 'Prise encastrée' },
  push: { nom: 'Push-pull', note: 'Sans poignée' },
};
// teintes proposées au tarif : poignées (p. 53) et gorges (p. 59) ; `pour` = types d'ouverture concernés
export const TEINTES_POIGNEE = {
  noir: { nom: 'Noir', couleur: '#161616', r: 0.45, m: 0.6, pour: ['gorge', 'maniglia', 'logica'] },
  titane: { nom: 'Titane anodisé', couleur: '#7f7d78', r: 0.3, m: 1, pour: ['gorge', 'maniglia', 'logica'] },
  inox: { nom: 'Aluminium', couleur: '#bcbdbb', r: 0.25, m: 1, pour: ['gorge', 'maniglia', 'logica'] },
  'antique-gold': { nom: 'Antique gold', couleur: '#a68a55', r: 0.32, m: 1, pour: ['gorge', 'maniglia', 'logica'] },
  blanc: { nom: 'Blanc', couleur: '#ecebe7', r: 0.5, m: 0.1, pour: ['maniglia', 'logica'] },
  antracite: { nom: 'Anthracite', couleur: '#3a3b3d', r: 0.4, m: 0.7, pour: ['maniglia', 'logica'] },
  'inox-brosse': { nom: 'Inox', couleur: '#c9cacb', r: 0.2, m: 1, pour: ['maniglia', 'logica'] },
  'gold-look': { nom: 'Or look', couleur: '#c2a25f', r: 0.28, m: 1, pour: ['maniglia', 'logica'] },
  moka: { nom: 'Moka', couleur: '#4b3a30', r: 0.45, m: 0.5, pour: ['maniglia', 'logica'] },
  'canna-di-fucile': { nom: 'Canon de fusil', couleur: '#4a4d52', r: 0.3, m: 1, pour: ['maniglia', 'logica'] },
};

// Familles proposées en plan de travail
// épaisseur apparente des plans de travail, selon la matière du tarif (p. 313 et suivantes)
const EP_PLAN = { 'plan-hpl': 0.04, 'plan-strat12': 0.012, 'plan-fenix': 0.02, 'plan-granit': 0.03, 'plan-marmo': 0.03, 'plan-corian': 0.03,
  'plan-laminam': 0.012, 'plan-vetro-mat': 0.015, 'plan-vetro-brillant': 0.015, 'plan-vetro-met': 0.015, 'plan-inox': 0.01 };
const PLAN_POLI = ['plan-laminam', 'plan-granit', 'plan-marmo'];

// Le catalogue de meubles à poser : chaque type existe en plusieurs largeurs (en cm), comme dans le tarif Armony.
// faces : façon de découper les façades ; equip : électroménager ou équipement dessiné sur le meuble.
const TYPES = [
  // Meubles bas
  { id: 'b1p', nom: 'Bas 1 porte', type: 'bas', faces: 'porte', largeurs: [30, 40, 45, 50, 60], groupe: 'Meubles bas' },
  { id: 'b2p', nom: 'Bas 2 portes', type: 'bas', faces: 'portes', largeurs: [80, 90, 100, 120], groupe: 'Meubles bas' },
  { id: 'b2t', nom: 'Bas 2 tiroirs', type: 'bas', faces: 'tiroirs2', largeurs: [40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles bas' },
  { id: 'b3t', nom: 'Bas 3 tiroirs', type: 'bas', faces: 'tiroirs3', largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles bas' },
  { id: 'b4t', nom: 'Bas 4 tiroirs', type: 'bas', faces: 'tiroirs4', largeurs: [40, 50, 60], groupe: 'Meubles bas' },
  { id: 'b1t', nom: 'Bas 1 grand tiroir', type: 'bas', faces: 'tiroirs1', largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles bas', aide: 'Un seul tiroir profond, pratique pour les grandes casseroles.' },
  { id: 'bpoub', nom: 'Bas poubelles', type: 'bas', faces: 'tiroirs2', largeurs: [30, 40, 50, 60], groupe: 'Meubles bas', aide: 'Tiroirs équipés de bacs pour le tri des déchets.' },
  { id: 'bcar', nom: 'Bas d’angle à plateaux tournants', type: 'bas', faces: 'angle', largeurs: [90, 100], groupe: 'Meubles bas', aide: 'Meuble d’angle dont les étagères sortent pour accéder au fond.' },
  { id: 'bcol', nom: 'Bas étroit à coulissant', type: 'bas', faces: 'porte', largeurs: [15, 20, 25], groupe: 'Meubles bas', aide: 'Un étroit rangement qui se glisse entre deux meubles.' },
  { id: 'bcoul', nom: 'Coulissant épices et bouteilles', type: 'bas', faces: 'porte', largeurs: [15, 20, 30], groupe: 'Meubles bas' },
  { id: 'bouv', nom: 'Bas ouvert à étagères', type: 'bas', faces: 'ouvert', largeurs: [30, 45, 60], groupe: 'Meubles bas' },
  { id: 'bang', nom: 'Bas d’angle', type: 'bas', faces: 'angle', largeurs: [100, 110, 120], groupe: 'Meubles bas' },
  // Évier et lavage
  { id: 'evier', nom: 'Évier 1 bac', type: 'bas', faces: 'portes', equip: 'evier', largeurs: [60, 80, 90, 100], groupe: 'Évier et lavage' },
  { id: 'evier2', nom: 'Évier 2 bacs', type: 'bas', faces: 'portes', equip: 'evier2', largeurs: [100, 120], groupe: 'Évier et lavage' },
  { id: 'evierego', nom: 'Évier avec égouttoir', type: 'bas', faces: 'portes', equip: 'evier', largeurs: [120, 140], groupe: 'Évier et lavage', aide: 'Un grand plan de travail intégré avec bac et zone d’égouttage.' },
  { id: 'lvtiroir', nom: 'Bas sous évier à tiroirs', type: 'bas', faces: 'tiroirs2', largeurs: [60, 80, 90], groupe: 'Évier et lavage', aide: 'Tiroirs adaptés au passage des tuyaux sous l’évier.' },
  { id: 'lv', nom: 'Lave-vaisselle intégré', type: 'bas', faces: 'panneau', largeurs: [45, 60], groupe: 'Évier et lavage' },
  { id: 'tri', nom: 'Bas tri sélectif', type: 'bas', faces: 'tiroirs2', largeurs: [45, 60], groupe: 'Évier et lavage' },
  // Cuisson
  { id: 'plaque', nom: 'Plaque de cuisson sur tiroirs', type: 'bas', faces: 'tiroirs3', equip: 'plaque', largeurs: [60, 80, 90], groupe: 'Cuisson' },
  { id: 'plaqueport', nom: 'Plaque de cuisson sur portes', type: 'bas', faces: 'portes', equip: 'plaque', largeurs: [80, 90, 100, 120], groupe: 'Cuisson', aide: 'Plaque posée sur un meuble à portes, pour ranger les grandes pièces.' },
  { id: 'plaque4', nom: 'Plaque sur 2 tiroirs', type: 'bas', faces: 'tiroirs2', equip: 'plaque', largeurs: [60, 80, 90], groupe: 'Cuisson', aide: 'Deux grands tiroirs sous la plaque, faciles d’accès.' },
  { id: 'micro', nom: 'Micro-ondes sous plan', type: 'bas', faces: 'four', largeurs: [60], groupe: 'Cuisson', aide: 'Niche pour un micro-ondes encastré sous le plan de travail.' },
  { id: 'fourplan', nom: 'Four sous plaque', type: 'bas', faces: 'four', equip: 'plaque', largeurs: [60], groupe: 'Cuisson' },
  { id: 'fourbas', nom: 'Four sous plan', type: 'bas', faces: 'four', largeurs: [60], groupe: 'Cuisson' },
  { id: 'hotte', nom: 'Hotte murale', type: 'haut', equip: 'hotte', largeurs: [60, 90, 120], groupe: 'Cuisson' },
  { id: 'hotteint', nom: 'Hotte intégrée sous meuble', type: 'haut', equip: 'hotte-integree', h: 0.42, largeurs: [60, 90], groupe: 'Cuisson' },
  // Froid et cave
  { id: 'frigoplan', nom: 'Réfrigérateur sous plan', type: 'bas', faces: 'panneau', largeurs: [60], groupe: 'Froid et cave' },
  { id: 'congplan', nom: 'Congélateur sous plan', type: 'bas', faces: 'panneau', largeurs: [60], groupe: 'Froid et cave', aide: 'Un tiroir congélateur discret sous le plan de travail.' },
  { id: 'caveplan', nom: 'Cave à vin sous plan', type: 'bas', faces: 'vitre', largeurs: [30, 60], groupe: 'Froid et cave' },
  { id: 'cfrigo', nom: 'Colonne réfrigérateur', type: 'colonne', equip: 'frigo', largeurs: [60], groupe: 'Froid et cave' },
  { id: 'cfrigocong', nom: 'Colonne réfrigérateur-congélateur', type: 'colonne', equip: 'frigocong', largeurs: [60], groupe: 'Froid et cave' },
  { id: 'camericain', nom: 'Niche réfrigérateur américain', type: 'colonne', equip: 'americain', largeurs: [90, 100], groupe: 'Froid et cave' },
  { id: 'ccave', nom: 'Colonne cave à vin', type: 'colonne', equip: 'cave', largeurs: [60], groupe: 'Froid et cave' },
  // Colonnes
  { id: 'cfour', nom: 'Colonne four', type: 'colonne', equip: 'four', largeurs: [60], groupe: 'Colonnes' },
  { id: 'cfourmo', nom: 'Colonne four et micro-ondes', type: 'colonne', equip: 'four2', largeurs: [60], groupe: 'Colonnes' },
  { id: 'ccongel', nom: 'Colonne congélateur', type: 'colonne', equip: 'frigo', largeurs: [60], groupe: 'Froid et cave', aide: 'Colonne dédiée au congélateur, à côté du réfrigérateur.' },
  { id: 'cfour2', nom: 'Colonne four et tiroir chauffant', type: 'colonne', equip: 'four2', largeurs: [60], groupe: 'Colonnes', aide: 'Four en hauteur avec un second appareil en dessous.' },
  { id: 'cetroite', nom: 'Colonne étroite', type: 'colonne', largeurs: [15, 20, 30], groupe: 'Colonnes', aide: 'Rangement fin pour les épices, les plateaux ou les produits ménagers.' },
  { id: 'cmenage', nom: 'Colonne de rangement 2 portes', type: 'colonne', equip: 'deux', largeurs: [60, 70], groupe: 'Colonnes', aide: 'Deux portes superposées : balais, aspirateur, provisions.' },
  { id: 'cpivot', nom: 'Porte pivotante de passage', type: 'colonne', equip: 'pivot', largeurs: [60, 70, 80, 90], groupe: 'Colonnes', aide: 'Une porte à la finition de vos façades, qui ferme un passage entre deux colonnes (jusqu’à 90 cm de large).' },
  { id: 'crgt', nom: 'Colonne rangement', type: 'colonne', largeurs: [30, 40, 45, 50, 60, 80], groupe: 'Colonnes' },
  { id: 'crgt2', nom: 'Colonne garde-manger 2 portes', type: 'colonne', equip: 'deux', largeurs: [80, 90, 100, 120], groupe: 'Colonnes' },
  { id: 'couv', nom: 'Colonne ouverte à étagères', type: 'colonne', equip: 'ouvert', largeurs: [45, 60], groupe: 'Colonnes' },
  // Meubles hauts
  { id: 'h1p', nom: 'Haut 1 porte', type: 'haut', faces: 'porte', largeurs: [15, 20, 30, 40, 45, 50, 60], groupe: 'Meubles hauts' },
  { id: 'h2p', nom: 'Haut 2 portes', type: 'haut', faces: 'portes', largeurs: [80, 90, 100, 120], groupe: 'Meubles hauts' },
  { id: 'h39', nom: 'Haut bas, H.39', type: 'haut', faces: 'portes', h: 0.39, largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles hauts', aide: 'Meuble haut peu haut, par exemple au-dessus d’une hotte ou d’une fenêtre.' },
  { id: 'h52', nom: 'Haut intermédiaire, H.52', type: 'haut', faces: 'portes', h: 0.52, largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles hauts', aide: 'Un peu plus haut qu’un meuble de 39 cm.' },
  { id: 'h65', nom: 'Haut, H.65', type: 'haut', faces: 'portes', h: 0.65, largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles hauts', aide: 'Hauteur courante, pour les cuisines sous plafond bas.' },
  { id: 'h91', nom: 'Haut grande hauteur, H.91', type: 'haut', faces: 'portes', h: 0.91, largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], groupe: 'Meubles hauts', aide: 'Monte plus haut pour gagner du rangement jusqu’au plafond.' },
  { id: 'hegout', nom: 'Haut égouttoir', type: 'haut', faces: 'ouvert', largeurs: [60, 80, 90], groupe: 'Meubles hauts', aide: 'Meuble haut ouvert au-dessus de l’évier, pour faire sécher la vaisselle.' },
  { id: 'hang', nom: 'Haut d’angle', type: 'haut', faces: 'angle', largeurs: [60, 65, 70], groupe: 'Meubles hauts', aide: 'Meuble haut d’angle : il ferme le coin quand deux rangées de meubles hauts se rejoignent à 90°.' },
  { id: 'hang2', nom: 'Haut d’angle H.91', type: 'haut', faces: 'angle', h: 0.91, largeurs: [60, 65, 70], groupe: 'Meubles hauts', aide: 'Haut d’angle grande hauteur, pour monter jusqu’au plafond.' },
  { id: 'habat', nom: 'Haut abattant', type: 'haut', faces: 'abattant', h: 0.36, largeurs: [60, 80, 90, 120], groupe: 'Meubles hauts' },
  { id: 'habat2', nom: 'Haut double abattant', type: 'haut', faces: 'abattant2', largeurs: [60, 90, 120], groupe: 'Meubles hauts' },
  { id: 'hvit', nom: 'Haut vitrine', type: 'haut', faces: 'vitrine', largeurs: [40, 60, 90], groupe: 'Meubles hauts' },
  { id: 'houv', nom: 'Haut ouvert', type: 'haut', faces: 'ouvert', largeurs: [30, 60, 90], groupe: 'Meubles hauts' },
  { id: 'etag', nom: 'Étagère murale', type: 'haut', faces: 'etagere', largeurs: [60, 90, 120, 180], groupe: 'Meubles hauts' },
  // Îlots et tables
  { id: 'ilot', nom: 'Îlot', type: 'ilot', largeurs: [180, 210, 240, 270, 300, 360], groupe: 'Îlots et tables' },
  { id: 'ilotnu', nom: 'Îlot de préparation', type: 'ilot', equip: 'nu', largeurs: [120, 150, 180, 210, 240], groupe: 'Îlots et tables', aide: 'Un îlot sans plaque, pour préparer et ranger.' },
  { id: 'peninsule', nom: 'Péninsule avec coin repas', type: 'ilot', bar: true, equip: 'nu', largeurs: [180, 210, 240], groupe: 'Îlots et tables', aide: 'Un îlot avec tabourets, qui sépare la cuisine du séjour.' },
  { id: 'ilotplaque', nom: 'Îlot avec plaque', type: 'ilot', equip: 'plaque', largeurs: [210, 240, 300], groupe: 'Îlots et tables', aide: 'La cuisson au centre, face à vos invités.' },
  { id: 'ilotbar', nom: 'Îlot avec coin repas', type: 'ilot', bar: true, largeurs: [240, 300, 360], groupe: 'Îlots et tables' },
  { id: 'ilotevier', nom: 'Îlot avec évier', type: 'ilot', equip: 'evier', largeurs: [240, 300], groupe: 'Îlots et tables' },
  { id: 'table', nom: 'Table repas', type: 'table', largeurs: [160, 200, 240], groupe: 'Îlots et tables' },
  // Fileurs et finitions : les pièces qui habillent les espaces et les extrémités, pour une cuisine sans vide ni chant apparent
  { id: 'fileur', nom: 'Fileur pour meuble bas', type: 'bas', faces: 'panneau', largeurs: [5, 10, 15], groupe: 'Fileurs et finitions', aide: 'Comble un espace entre un meuble bas et un mur ou un appareil.' },
  { id: 'fcol', nom: 'Fileur de colonne', type: 'colonne', equip: 'fileur', largeurs: [5, 10, 15], groupe: 'Fileurs et finitions', aide: 'Comble l’espace entre une colonne et le mur.' },
  { id: 'fhaut39', nom: 'Fileur de meuble haut, H.39', type: 'haut', faces: 'fileur', h: 0.39, largeurs: [5, 10, 15], groupe: 'Fileurs et finitions', aide: 'Comble l’espace à côté d’un meuble haut de 39 cm.' },
  { id: 'fhaut52', nom: 'Fileur de meuble haut, H.52', type: 'haut', faces: 'fileur', h: 0.52, largeurs: [5, 10, 15], groupe: 'Fileurs et finitions', aide: 'Comble l’espace à côté d’un meuble haut de 52 cm.' },
  { id: 'fhaut65', nom: 'Fileur de meuble haut, H.65', type: 'haut', faces: 'fileur', h: 0.65, largeurs: [5, 10, 15], groupe: 'Fileurs et finitions', aide: 'Comble l’espace à côté d’un meuble haut de 65 cm.' },
  { id: 'fhaut78', nom: 'Fileur de meuble haut, H.78', type: 'haut', faces: 'fileur', h: 0.78, largeurs: [5, 10, 15], groupe: 'Fileurs et finitions', aide: 'Comble l’espace à côté d’un meuble haut de 78 cm.' },
  { id: 'jouebas', nom: 'Joue de finition, bas', type: 'bas', faces: 'joue', largeurs: [3], groupe: 'Fileurs et finitions', aide: 'Habille le côté visible d’un meuble bas en bout de cuisine.' },
  { id: 'jouecol', nom: 'Joue de finition, colonne', type: 'colonne', equip: 'joue', largeurs: [3], groupe: 'Fileurs et finitions', aide: 'Habille le côté visible d’une colonne en bout de cuisine.' },
  { id: 'jouehaut', nom: 'Joue de finition, meuble haut', type: 'haut', faces: 'joue', largeurs: [3], groupe: 'Fileurs et finitions', aide: 'Habille le côté visible d’un meuble haut en bout de cuisine.' },
];
export const MEUBLES = {};
for (const t of TYPES) for (const cm of t.largeurs) {
  const { largeurs, id, ...d } = t;
  MEUBLES[`${id}-${cm}`] = { ...d, famille: id, l: cm / 100 };
}
// catégorie (meubles bas, colonnes…) puis sous-catégorie (évier, cuisson…), pour le catalogue
const CATEGORIES = { bas: 'Meubles bas', colonne: 'Colonnes', haut: 'Meubles hauts', ilot: 'Îlots et tables', table: 'Îlots et tables' };
const SOUS = { 'Meubles bas': 'Rangements', 'Colonnes': 'Four et rangements', 'Meubles hauts': 'Rangements', 'Îlots et tables': 'Îlots et tables' };
const SOUS_PAR_ID = { hotte: 'Hottes', hotteint: 'Hottes', cfrigo: 'Froid et cave', cfrigocong: 'Froid et cave', camericain: 'Froid et cave', ccave: 'Froid et cave', ccongel: 'Froid et cave',
  evier: 'Évier et lavage', evier2: 'Évier et lavage', evierego: 'Évier et lavage', lvtiroir: 'Évier et lavage', lv: 'Évier et lavage', tri: 'Évier et lavage', bpoub: 'Évier et lavage',
  plaque: 'Cuisson', plaque4: 'Cuisson', plaqueport: 'Cuisson', fourplan: 'Cuisson', fourbas: 'Cuisson', micro: 'Cuisson', cfour: 'Four et rangements', cfourmo: 'Four et rangements', cfour2: 'Four et rangements',
  frigoplan: 'Froid et cave', cpivot: 'Passages', caveplan: 'Froid et cave', congplan: 'Froid et cave', table: 'Tables', ilotbar: 'Îlots', peninsule: 'Îlots', ilot: 'Îlots', ilotnu: 'Îlots', ilotplaque: 'Îlots', ilotevier: 'Îlots',
  hang: 'Angles', hang2: 'Angles', habat: 'Ouvrants et vitrines', habat2: 'Ouvrants et vitrines', hvit: 'Ouvrants et vitrines', houv: 'Étagères et ouverts', etag: 'Étagères et ouverts', hegout: 'Étagères et ouverts',
  bouv: 'Étagères et ouverts', couv: 'Étagères et ouverts', bang: 'Angles', bcar: 'Angles', bcoul: 'Rangements' };
export const FAMILLES_MEUBLES = TYPES.map(({ id, nom, type, groupe, largeurs, aide }) => {
  const fin = groupe === 'Fileurs et finitions';
  const cat = fin ? groupe : CATEGORIES[type];
  return { id, nom, cat, groupe: fin ? 'Fileurs et joues' : (SOUS_PAR_ID[id] || SOUS[cat]), largeurs, aide };
});
// anciens identifiants (liens et sessions enregistrés avant l'élargissement du catalogue)
export const ALIAS = { 'tiroirs-60': 'b3t-60', 'tiroirs-90': 'b3t-90', 'porte-45': 'b1p-45', 'porte-60': 'b1p-60',
  'col-four-60': 'cfour-60', 'col-frigo-60': 'cfrigo-60', 'col-rgt-45': 'crgt-45', 'col-rgt-60': 'crgt-60',
  'haut-60': 'h1p-60', 'haut-90': 'h2p-90', 'ilot-300': 'ilotbar-300' };

export const PROFONDEUR = { bas: 0.6, colonne: 0.6, haut: 0.36, ilot: 1.0, table: 0.9 };
export const accentParDefaut = (type) => type === 'colonne' || type === 'ilot';
export const HAUTEURS_COLONNE = [2.05, 2.25, 2.45];

// Hauteur occupée par un meuble (bas et haut), selon la hauteur des colonnes choisie
export function vertical(def, hc = 2.25) {
  if (def.type === 'colonne') return [0, hc];
  if (def.type === 'haut') {
    if (def.faces === 'etagere') return [1.5, 1.55];
    if (def.equip === 'hotte') return [1.58, hc];
    return [hc - (def.h || 0.72), hc];
  }
  if (def.type === 'ilot') return [0, 0.96];
  if (def.type === 'table') return [0, 0.78];
  return [0, 0.92];
}

// ---------- matériaux ----------
const chargeur = new THREE.TextureLoader();
const cacheTex = new Map();
function texture(id, surCharge) {
  if (!cacheTex.has(id)) {
    const t = chargeur.load(`assets/img/finitions/${id}.jpg`, () => surCharge?.());
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 16; t.minFilter = THREE.LinearMipmapLinearFilter;
    cacheTex.set(id, t);
  }
  return cacheTex.get(id);
}
let bosses = null;
function texRainures() {
  if (bosses) return bosses;
  const c = document.createElement('canvas'); c.width = 64; c.height = 4;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 4);
  g.fillStyle = '#000'; g.fillRect(0, 0, 12, 4);
  bosses = new THREE.CanvasTexture(c); bosses.wrapS = bosses.wrapT = THREE.RepeatWrapping;
  return bosses;
}

export class Materiaux {
  constructor(surCharge) { this.cache = new Map(); this.surCharge = surCharge; }
  get(cle, fab) { if (!this.cache.has(cle)) this.cache.set(cle, fab()); return this.cache.get(cle); }

  finition(id, { largeur = 0.6, hauteur = 0.7, rainure = false, pivote = false } = {}) {
    const f = FIN[id] || FINITIONS[0];
    const kx = Math.round(largeur * 20) / 20, ky = Math.round(hauteur * 10) / 10;
    return this.get(`f:${f.id}:${kx}:${ky}:${rainure}:${pivote}`, () => {
      // laques brillantes et verres : vernis transparent ; bois et matières : relief tiré de l'échantillon
      const brillant = f.r <= 0.25;
      const mat = new THREE.MeshPhysicalMaterial({ color: f.tex ? '#ffffff' : f.couleur, roughness: f.r, metalness: f.m,
        clearcoat: brillant ? 1 : f.r <= 0.45 ? 0.25 : 0, clearcoatRoughness: brillant ? 0.04 : 0.3 });
      if (f.tex) {
        const t = texture(f.id, this.surCharge).clone();
        // l'échantillon fait environ 3 × 1 : on le répète pour garder un grain réaliste
        t.repeat.set(Math.max(0.35, kx / 0.6), Math.max(0.35, ky / 0.7)); t.needsUpdate = true;
        if (pivote && /bois|chêne|noyer|châtaignier/i.test(f.famille)) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
        mat.map = t; mat.bumpMap = t; mat.bumpScale = 0.25;
      }
      if (rainure) {
        const b = texRainures().clone(); b.needsUpdate = true; b.repeat.set(Math.max(1, Math.round(kx / 0.025)), 1);
        mat.bumpMap = b; mat.bumpScale = 1.2;
      }
      return mat;
    });
  }

  plan(id, longueur) {
    const f = FIN[id] || FINITIONS[0];
    const k = Math.round(longueur * 10) / 10;
    return this.get(`p:${f.id}:${k}`, () => {
      const mat = new THREE.MeshPhysicalMaterial({ color: f.tex ? '#ffffff' : f.couleur, roughness: Math.min(f.r, 0.5), metalness: f.m || 0,
        clearcoat: PLAN_POLI.includes(f.fid) ? 0.4 : 0, clearcoatRoughness: 0.3 });
      if (f.tex) { const t = texture(f.id, this.surCharge).clone(); t.repeat.set(Math.max(0.5, k / 1.2), 1); t.needsUpdate = true; mat.map = t; mat.bumpMap = t; mat.bumpScale = 0.12; }
      return mat;
    });
  }

  poignee(id) {
    const p = TEINTES_POIGNEE[id] || TEINTES_POIGNEE.noir;
    return this.get('h:' + id, () => new THREE.MeshStandardMaterial({ color: p.couleur, roughness: p.r, metalness: p.m }));
  }

  fixe(nom) {
    const defs = {
      ombre: () => new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.9 }),
      vitre: () => new THREE.MeshPhysicalMaterial({ color: '#cfd6d4', roughness: 0.05, metalness: 0, transmission: 0, transparent: true, opacity: 0.28 }),
      verre: () => new THREE.MeshPhysicalMaterial({ color: '#0a0a0b', roughness: 0.08, metalness: 0.2, clearcoat: 1 }),
      inox: () => new THREE.MeshStandardMaterial({ color: '#c9cacb', roughness: 0.25, metalness: 1 }),
      alu: () => new THREE.MeshStandardMaterial({ color: '#8d8c88', roughness: 0.35, metalness: 1 }),
      led: () => new THREE.MeshBasicMaterial({ color: '#ffe2b0' }),
      cuir: () => new THREE.MeshStandardMaterial({ color: '#2a2420', roughness: 0.7 }),
      selection: () => new THREE.MeshBasicMaterial({ color: '#a8935a', transparent: true, opacity: 0.22, depthWrite: false }),
      conflit: () => new THREE.MeshBasicMaterial({ color: '#c0603a', transparent: true, opacity: 0.25, depthWrite: false }),
    };
    return this.get('x:' + nom, defs[nom]);
  }
}

// ---------- géométrie ----------
const GEO = new THREE.BoxGeometry(1, 1, 1);
function boite(parent, mat, w, h, d, x, y, z, ombre = true) {
  const m = new THREE.Mesh(GEO, mat);
  m.scale.set(w, h, d); m.position.set(x, y, z);
  m.castShadow = ombre; m.receiveShadow = true;
  parent.add(m); return m;
}
// façades et plans aux arêtes légèrement adoucies : elles accrochent la lumière comme les vraies
const GEO_ARRONDIES = new Map();
function boiteArrondie(parent, mat, w, h, d, x, y, z, r = 0.0025) {
  const cle = [w, h, d].map((v) => Math.round(v * 1000)).join(':');
  if (!GEO_ARRONDIES.has(cle)) GEO_ARRONDIES.set(cle, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, d / 2 - 0.0005, h / 2 - 0.0005)));
  const m = new THREE.Mesh(GEO_ARRONDIES.get(cle), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}
const PLINTHE = 0.1, CAISSON = 0.76, JEU = 0.003, EP = 0.022;

// Une façade (porte ou tiroir) centrée en (x, y), posée sur le plan z, tournée vers +z.
function facade(g, c, w, h, x, y, z, { horizontale = false } = {}) {
  const { mats, porte } = c;
  const mat = mats.finition(c.fin, { largeur: w, hauteur: h, rainure: porte === 'rainure' });
  if (porte === 'cadre' || porte === 'alu') {
    // cadre périmétral et panneau en retrait ; sur un bois, les traverses ont le fil horizontal comme le massif
    const { b, recul } = c.cadre || { b: 0.05, recul: 0.008 };
    const mb = porte === 'alu' ? mats.fixe('alu') : mat;
    const mt = porte === 'alu' ? mb : mats.finition(c.fin, { largeur: w, hauteur: b, pivote: true });
    boite(g, mt, w - JEU, b, EP, x, y + h / 2 - b / 2, z + EP / 2);
    boite(g, mt, w - JEU, b, EP, x, y - h / 2 + b / 2, z + EP / 2);
    boite(g, mb, b, h - 2 * b, EP, x - w / 2 + b / 2, y, z + EP / 2);
    boite(g, mb, b, h - 2 * b, EP, x + w / 2 - b / 2, y, z + EP / 2);
    boite(g, mat, w - 2 * b + 0.002, h - 2 * b + 0.002, EP - recul, x, y, z + (EP - recul) / 2);
    // joint d'ombre au pied du cadre : il dessine le retrait du panneau
    if (porte !== 'alu') {
      const wi = w - 2 * b, hi = h - 2 * b, e = 0.004, zr = z + EP - recul + 0.0006, om = mats.fixe('ombre');
      boite(g, om, wi, e, 0.0012, x, y + hi / 2 - e / 2, zr, false); boite(g, om, wi, e, 0.0012, x, y - hi / 2 + e / 2, zr, false);
      boite(g, om, e, hi - 2 * e, 0.0012, x - wi / 2 + e / 2, y, zr, false); boite(g, om, e, hi - 2 * e, 0.0012, x + wi / 2 - e / 2, y, zr, false);
    }
  } else {
    boiteArrondie(g, mat, w - JEU, h - JEU, EP, x, y, z + EP / 2);
  }
  if (porte === 'chant') boite(g, mats.fixe('ombre'), w - JEU, 0.012, 0.004, x, y + h / 2 - 0.008, z + EP, false);
  if (porte === 'profil') {
    const pm = mats.poignee(c.teinte); const t = 0.012;
    boite(g, pm, t, h - JEU, EP + 0.004, x - w / 2 + t / 2, y, z + EP / 2, false);
    boite(g, pm, t, h - JEU, EP + 0.004, x + w / 2 - t / 2, y, z + EP / 2, false);
    boite(g, pm, w - JEU, 0.03, EP + 0.004, x, y + h / 2 - 0.015, z + EP / 2, false);
    return;
  }
  // poignées rapportées
  const pm = mats.poignee(c.teinte);
  if (c.poignee === 'maniglia') {
    if (horizontale) boite(g, pm, Math.min(0.42, w * 0.6), 0.012, 0.025, x, y + h / 2 - 0.05, z + EP + 0.0125);
    else boite(g, pm, 0.012, Math.min(0.32, h * 0.4), 0.025, x + w / 2 - 0.05, y + (h > 1 ? -h / 2 + 0.95 - y + y : 0), z + EP + 0.0125);
  } else if (c.poignee === 'logica') {
    boite(g, pm, Math.min(0.24, w * 0.5), 0.016, 0.03, x, y + h / 2 - 0.02, z + EP + 0.004);
  }
}

function gorgeHorizontale(g, c, w, y, z) {
  if (c.poignee !== 'gorge' || c.porte === 'profil') return;
  boite(g, c.mats.poignee(c.teinte), w, 0.03, 0.012, 0, y, z - 0.008, false);
}

function caissonBas(g, c, l, P) {
  boite(g, c.mats.fixe('ombre'), l, PLINTHE, P - 0.06, 0, PLINTHE / 2, (P - 0.06) / 2);
  boite(g, c.mats.finition(c.fin, { largeur: P, hauteur: CAISSON }), l, CAISSON, P - EP, 0, PLINTHE + CAISSON / 2, (P - EP) / 2);
}

function planDeTravail(g, c, l, P, x = 0, z = 0) {
  const ep = EP_PLAN[FIN[c.plan]?.fid] || 0.03;
  if (c.sansPlan) return PLINTHE + CAISSON + ep;
  boiteArrondie(g, c.mats.plan(c.plan, l), l, ep, P + 0.02, x, PLINTHE + CAISSON + ep / 2, z + (P + 0.02) / 2, 0.004);
  return PLINTHE + CAISSON + ep;
}

// Façades d'un meuble bas, de bas en haut, selon le découpage demandé
const TIROIRS = { tiroirs1: [1], tiroirs2: [0.36, 0.64], tiroirs3: [0.28, 0.36, 0.36], tiroirs4: [0.22, 0.22, 0.28, 0.28] };
function frontsBas(g, c, def, l, P) {
  const gorge = c.poignee === 'gorge' && c.porte !== 'profil';
  const hF = CAISSON - (gorge ? 0.035 : 0);
  const zF = P - EP;
  const y0 = PLINTHE;
  if (def.faces === 'joue') return;
  if (def.faces !== 'ouvert') gorgeHorizontale(g, c, l, PLINTHE + CAISSON - 0.018, zF);
  if (TIROIRS[def.faces]) {
    let y = y0 + hF;
    TIROIRS[def.faces].forEach((k) => { const h = hF * k; y -= h; facade(g, c, l, h, 0, y + h / 2, zF, { horizontale: true }); });
  } else if (def.faces === 'portes') {
    facade(g, c, l / 2, hF, -l / 4, y0 + hF / 2, zF); facade(g, c, l / 2, hF, l / 4, y0 + hF / 2, zF);
  } else if (def.faces === 'ouvert') {
    niche(g, c, l, y0, CAISSON, P, 2);
  } else if (def.faces === 'angle') {
    // partie aveugle (cachée par le meuble voisin) à droite, porte à gauche
    const lp = l - 0.6;
    facade(g, c, lp, hF, -l / 2 + lp / 2, y0 + hF / 2, zF);
    boite(g, c.mats.finition(c.fin, { largeur: 0.6, hauteur: hF }), 0.6 - JEU, hF - JEU, EP, l / 2 - 0.3, y0 + hF / 2, zF - 0.01);
  } else if (def.faces === 'four') {
    const hFour = 0.6;
    facade(g, c, l, hF - hFour, 0, y0 + (hF - hFour) / 2, zF, { horizontale: true });
    four(g, c, l, y0 + hF - hFour, hFour, zF);
  } else if (def.faces === 'vitre') {
    vitrine(g, c, l, hF, 0, y0 + hF / 2, zF, true);
  } else {
    facade(g, c, l, hF, 0, y0 + hF / 2, zF, { horizontale: def.faces === 'panneau' });
  }
}

// Intérieur visible d'un meuble ouvert : fond sombre et étagères dans la finition
function niche(g, c, l, y0, h, P, n) {
  const ep = 0.018;
  boite(g, c.mats.fixe('ombre'), l - 2 * ep, h - 2 * ep, 0.01, 0, y0 + h / 2, 0.02, false);
  const m = c.mats.finition(c.fin, { largeur: l, hauteur: 0.1 });
  for (let i = 0; i <= n; i++) boite(g, m, l - 2 * ep, ep, P - 0.03, 0, y0 + ep / 2 + (h - ep) * (i / n), (P - 0.03) / 2);
  for (const s of [-1, 1]) boite(g, m, ep, h, P, s * (l / 2 - ep / 2), y0 + h / 2, P / 2);
}
function four(g, c, l, y, h, zF) {
  boite(g, c.mats.fixe('verre'), l - 0.01, h - 0.01, 0.025, 0, y + h / 2, zF + 0.0125);
  boite(g, c.mats.fixe('inox'), l * 0.75, 0.012, 0.02, 0, y + h - 0.06, zF + 0.035, false);
}
function vitrine(g, c, l, h, x, y, zF, cave = false) {
  const b = 0.03; const m = c.mats.finition(c.fin, { largeur: l, hauteur: h });
  boite(g, cave ? c.mats.fixe('ombre') : c.mats.fixe('ombre'), l - 0.04, h - 0.04, 0.01, x, y, zF - 0.3, false);
  for (const s of [-1, 1]) { boite(g, m, l - JEU, b, EP, x, y + s * (h / 2 - b / 2), zF + EP / 2); boite(g, m, b, h - 2 * b, EP, x + s * (l / 2 - b / 2), y, zF + EP / 2); }
  boite(g, c.mats.fixe('vitre'), l - 2 * b, h - 2 * b, 0.006, x, y, zF + EP / 2, false);
  if (cave) for (let i = 1; i < 5; i++) boite(g, c.mats.fixe('led'), l - 0.08, 0.004, 0.3, x, y - h / 2 + (h * i) / 5, zF - 0.15, false);
}

function equiper(g, c, def, l, P, yPlan, zc = P / 2) {
  if (def.equip === 'plaque') boite(g, c.mats.fixe('verre'), Math.min(l - 0.04, 0.86), 0.006, 0.5, 0, yPlan + 0.003, zc);
  if (def.equip === 'evier' || def.equip === 'evier2') {
    const bacs = def.equip === 'evier2' ? [-0.22, 0.22] : [-l * 0.12];
    for (const x of bacs) boite(g, c.mats.fixe('ombre'), Math.min(0.42, l * 0.5), 0.004, 0.4, x, yPlan + 0.001, zc + 0.03, false);
    const xm = bacs[0] + (bacs.length > 1 ? 0.22 : 0);
    const pm = c.teinte === 'antique-gold' ? c.mats.poignee('antique-gold') : c.mats.fixe('inox');
    const dz = zc - P / 2;
    const fut = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.34, 20), pm); fut.position.set(xm, yPlan + 0.17, 0.1 + dz); fut.castShadow = true;
    const bec = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 16), pm); bec.rotation.x = Math.PI / 2; bec.position.set(xm, yPlan + 0.33, 0.2 + dz);
    g.add(fut, bec);
  }
}

// Une colonne : façades découpées selon l'électroménager qu'elle reçoit
function colonne(g, c, def, l, P, H) {
  const { mats } = c; const zF = P - EP;
  if (def.equip === 'joue') { boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H, P + 0.02, 0, H / 2, (P + 0.02) / 2); return; }
  if (def.equip === 'pivot') {
    // porte de passage : un vantail à la finition des façades, devant un fond sombre
    boite(g, mats.fixe('ombre'), l, H, 0.02, 0, H / 2, zF - 0.1);
    facade(g, c, l - 0.01, H - 0.02, 0, H / 2, zF);
    return;
  }
  if (def.equip === 'fileur') { boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H, P - EP, 0, H / 2, (P - EP) / 2); return; }
  boite(g, mats.fixe('ombre'), l, PLINTHE, P - 0.06, 0, PLINTHE / 2, (P - 0.06) / 2);
  boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H - PLINTHE, P - EP, 0, PLINTHE + (H - PLINTHE) / 2, (P - EP) / 2);
  // découpe verticale des portes : liste de [bas, haut]
  const portes = (coupes) => { const ys = [PLINTHE, ...coupes, H]; for (let i = 0; i < ys.length - 1; i++) facade(g, c, l, ys[i + 1] - ys[i], 0, (ys[i] + ys[i + 1]) / 2, zF, { horizontale: i === 0 && ys[1] < 1 }); };
  if (def.equip === 'four') {
    facade(g, c, l, 0.95 - PLINTHE, 0, PLINTHE + (0.95 - PLINTHE) / 2, zF, { horizontale: true });
    four(g, c, l, 0.95, 0.6, zF);
    facade(g, c, l, H - 1.55, 0, (1.55 + H) / 2, zF);
  } else if (def.equip === 'four2') {
    facade(g, c, l, 0.75 - PLINTHE, 0, PLINTHE + (0.75 - PLINTHE) / 2, zF, { horizontale: true });
    four(g, c, l, 0.75, 0.6, zF);
    boite(g, mats.fixe('verre'), l - 0.01, 0.38, 0.025, 0, 1.36 + 0.19, zF + 0.0125);
    facade(g, c, l, H - 1.74, 0, (1.74 + H) / 2, zF);
  } else if (def.equip === 'frigocong') {
    portes([0.85, 1.85]);
  } else if (def.equip === 'americain') {
    const hf = Math.min(1.8, H - 0.3);
    boite(g, mats.fixe('ombre'), l - 0.02, hf + 0.02, 0.02, 0, PLINTHE + hf / 2, zF - 0.02, false);
    for (const s of [-1, 1]) boite(g, mats.fixe('inox'), (l - 0.06) / 2, hf - 0.02, 0.05, s * (l - 0.06) / 4 + s * 0.005, PLINTHE + hf / 2, zF - 0.01);
    for (const s of [-1, 1]) boite(g, mats.fixe('alu'), 0.012, 0.8, 0.03, s * 0.03, PLINTHE + hf * 0.55, zF + 0.035, false);
    facade(g, c, l, H - PLINTHE - hf - 0.02, 0, (PLINTHE + hf + 0.02 + H) / 2, zF);
  } else if (def.equip === 'cave') {
    vitrine(g, c, l, H - PLINTHE, 0, (PLINTHE + H) / 2, zF, true);
  } else if (def.equip === 'ouvert') {
    niche(g, c, l, PLINTHE, H - PLINTHE, P, 5);
  } else if (def.equip === 'deux') {
    for (const s of [-1, 1]) for (const [a, b] of [[PLINTHE, 1.35], [1.35, H]]) facade(g, c, l / 2, b - a, s * l / 4, (a + b) / 2, zF);
  } else {
    portes([1.35]);
  }
  if (c.poignee === 'gorge' && c.porte !== 'profil' && !['ouvert', 'cave'].includes(def.equip)) boite(g, mats.poignee(c.teinte), 0.008, H - PLINTHE, 0.006, l / 2 - 0.004, PLINTHE + (H - PLINTHE) / 2, zF + 0.002, false);
}

// Un meuble haut, accroché sous la hauteur des colonnes
function meubleHaut(g, c, def, l, P, hc) {
  const { mats } = c;
  if (def.equip === 'hotte') {
    boite(g, mats.poignee(c.teinte), l, 0.06, 0.5, 0, 1.62, 0.25);
    boite(g, mats.poignee(c.teinte), 0.32, hc - 1.65, 0.26, 0, (1.65 + hc) / 2, 0.13);
    boite(g, mats.fixe('led'), l - 0.1, 0.004, 0.04, 0, 1.588, 0.4, false);
    return;
  }
  if (def.faces === 'etagere') {
    boiteArrondie(g, mats.finition(c.accentFin, { largeur: l, hauteur: 0.1 }), l, 0.04, 0.25, 0, 1.52, 0.125, 0.003);
    return;
  }
  const H = def.h || 0.72, y0 = hc - H;
  if (def.faces === 'joue' || def.faces === 'fileur') { boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H, def.faces === 'joue' ? P : P - EP, 0, y0 + H / 2, (def.faces === 'joue' ? P : P - EP) / 2); return; }
  if (def.equip === 'hotte-integree') {
    boite(g, mats.fixe('inox'), l - 0.04, 0.05, 0.3, 0, y0 - 0.025, 0.17);
    boite(g, mats.fixe('led'), l - 0.12, 0.004, 0.04, 0, y0 - 0.052, 0.26, false);
  }
  if (def.faces === 'ouvert') { niche(g, c, l, y0, H, P, 2); return; }
  boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), l, H, P - EP, 0, y0 + H / 2, (P - EP) / 2);
  const zF = P - EP;
  if (def.faces === 'vitrine') vitrine(g, c, l, H, 0, y0 + H / 2, zF);
  else if (def.faces === 'angle') {
    // partie aveugle (cachée par le meuble voisin) à droite, porte à gauche
    const lp = l - P;
    facade(g, c, lp, H, -l / 2 + lp / 2, y0 + H / 2, zF);
    boite(g, mats.finition(c.fin, { largeur: P, hauteur: H }), P - JEU, H - JEU, EP, l / 2 - P / 2, y0 + H / 2, zF - 0.01);
  }
  else if (def.faces === 'abattant') facade(g, c, l, H, 0, y0 + H / 2, zF, { horizontale: true });
  else if (def.faces === 'abattant2') { facade(g, c, l, H / 2, 0, y0 + H / 4, zF, { horizontale: true }); facade(g, c, l, H / 2, 0, y0 + H * 3 / 4, zF, { horizontale: true }); }
  else if (l > 0.65) { facade(g, c, l / 2, H, -l / 4, y0 + H / 2, zF); facade(g, c, l / 2, H, l / 4, y0 + H / 2, zF); }
  else facade(g, c, l, H, 0, y0 + H / 2, zF);
  if (def.equip !== 'hotte-integree') boite(g, mats.fixe('led'), l - 0.04, 0.006, 0.02, 0, y0 - 0.004, P - 0.06, false);
}

function tabouret(g, c, x, z) {
  const { mats } = c; const t = new THREE.Group(); t.position.set(x, 0, z);
  const assise = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.06, 32), mats.fixe('cuir')); assise.position.y = 0.7; assise.castShadow = true;
  const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.68, 12), mats.poignee(c.teinte)); pied.position.y = 0.34;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.015, 32), mats.poignee(c.teinte)); base.position.y = 0.008;
  t.add(assise, pied, base); g.add(t);
}
function chaise(g, c, x, z, r) {
  const { mats } = c; const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = r;
  boite(t, mats.fixe('cuir'), 0.44, 0.05, 0.44, 0, 0.46, 0);
  boite(t, mats.fixe('cuir'), 0.44, 0.42, 0.04, 0, 0.7, -0.2);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) boite(t, mats.poignee(c.teinte), 0.02, 0.44, 0.02, a * 0.2, 0.22, b * 0.2);
  g.add(t);
}

// Construit un meuble. m = { type: clé de MEUBLES, accent: bool } ; cfg = finitions et hauteur des colonnes.
export function construireMeuble(m, cfg, mats) {
  const def = MEUBLES[m.type];
  const g = new THREE.Group();
  const c = { mats, porte: MODELES[cfg.modele]?.porte || 'lisse', cadre: MODELES[cfg.modele]?.cadre, fin: m.accent ? cfg.accent : cfg.facade, accentFin: cfg.accent,
    plan: cfg.plan, poignee: cfg.poignee, teinte: cfg.teinte, sansPlan: true };
  const l = def.l, P = PROFONDEUR[def.type], hc = cfg.hc || 2.25;

  if (def.type === 'bas') {
    if (def.faces === 'joue') {
      boite(g, mats.finition(c.fin, { largeur: P, hauteur: 0.93 }), l, PLINTHE + CAISSON + 0.03, P + 0.02, 0, (PLINTHE + CAISSON + 0.03) / 2, (P + 0.02) / 2);
    } else {
      caissonBas(g, c, l, P);
      frontsBas(g, c, def, l, P);
      const yPlan = planDeTravail(g, c, l, P, 0, 0);
      equiper(g, c, def, l, P, yPlan);
    }
  }
  if (def.type === 'colonne') colonne(g, c, def, l, P, hc);
  if (def.type === 'haut') meubleHaut(g, c, def, l, P, hc);

  if (def.type === 'ilot') {
    // côté travail vers -z (dos de l'îlot = côté salon, +z)
    const Pw = 0.6;
    const cote = new THREE.Group();
    caissonBas(cote, c, l, Pw);
    frontsBas(cote, c, { faces: 'tiroirs3' }, l, Pw);
    cote.rotation.y = Math.PI; cote.position.z = Pw / 2;
    g.add(cote);
    const ep = Math.max(0.03, (EP_PLAN[FIN[c.plan]?.fid] || 0.03) * 2);
    const hBase = PLINTHE + CAISSON;
    const prof = def.bar ? 1.0 : 0.66;
    if (c.porte === 'cadre' || c.porte === 'alu') facade(g, { ...c, poignee: 'push' }, l, hBase - PLINTHE, 0, PLINTHE + (hBase - PLINTHE) / 2, Pw / 2);
    else boite(g, mats.finition(c.fin, { largeur: l, hauteur: hBase }), l, hBase - PLINTHE, 0.02, 0, PLINTHE + (hBase - PLINTHE) / 2, Pw / 2 + 0.01);
    const zc = -Pw / 2 - 0.03 + prof / 2;
    boiteArrondie(g, mats.plan(c.plan, l), l + 0.04, ep, prof, 0, hBase + ep / 2, zc, 0.004);
    for (const s of [-1, 1]) boite(g, mats.plan(c.plan, 1), ep, hBase + ep, prof, s * (l / 2 + 0.02 + ep / 2), (hBase + ep) / 2, zc);
    if (def.equip === 'evier') {
      const evier = new THREE.Group(); evier.rotation.y = Math.PI; evier.position.z = 0.2;
      equiper(evier, c, { equip: 'evier' }, l, Pw, hBase + ep, Pw / 2);
      g.add(evier);
    } else if (def.equip !== 'nu') {
      boite(g, mats.fixe('verre'), 0.8, 0.006, 0.5, 0, hBase + ep + 0.003, -0.02);
    }
    if (def.bar) {
      const nb = Math.max(2, Math.floor(l / 0.65));
      for (let i = 0; i < nb; i++) tabouret(g, c, -l / 2 + (l / nb) * (i + 0.5), Pw / 2 + 0.3);
    }
  }

  if (def.type === 'table') {
    // origine au centre de la table
    const ep = 0.04, h = 0.75;
    boiteArrondie(g, mats.plan(c.plan, l), l, ep, 0.9, 0, h - ep / 2, 0, 0.006);
    for (const s of [-1, 1]) boite(g, mats.poignee(c.teinte), 0.06, h - ep, 0.7, s * (l / 2 - 0.2), (h - ep) / 2, 0);
    const nb = Math.max(2, Math.floor(l / 0.6));
    for (let i = 0; i < nb; i++) for (const s of [-1, 1]) chaise(g, c, -l / 2 + (l / nb) * (i + 0.5), s * 0.62, s > 0 ? Math.PI : 0);
  }
  g.userData.meuble = m;
  if (m.miroir && def.faces === 'angle') g.scale.x = -1;
  return g;
}

// Emprise au sol d'un meuble (rectangle en coordonnées locales) : pour les sélections et les collisions.
export function emprise(type) {
  const def = MEUBLES[type]; const P = PROFONDEUR[def.type];
  if (def.type === 'ilot') return { x0: -def.l / 2 - 0.05, x1: def.l / 2 + 0.05, z0: -0.33, z1: def.bar ? 0.72 : 0.36 };
  if (def.type === 'table') return { x0: -def.l / 2, x1: def.l / 2, z0: -0.86, z1: 0.86 };
  if (def.faces === 'etagere') return { x0: -def.l / 2, x1: def.l / 2, z0: 0, z1: 0.25 };
  if (def.faces === 'joue' || def.equip === 'joue') return { x0: -def.l / 2, x1: def.l / 2, z0: 0, z1: P + 0.02 };
  return { x0: -def.l / 2, x1: def.l / 2, z0: 0, z1: P };
}

// Plan de travail continu : les meubles bas alignés et bord à bord partagent une seule dalle, sans coupure entre eux,
// et les rangées qui se rejoignent à angle droit forment une dalle en L.
export function construirePlans(liste, cfg, mats) {
  const g = new THREE.Group();
  const ep = EP_PLAN[FIN[cfg.plan]?.fid] || 0.03;
  const P = PROFONDEUR.bas + 0.02;
  const lignes = new Map();
  for (const m of liste) {
    const d = MEUBLES[m.type];
    if (d.type !== 'bas' || d.faces === 'joue') continue;
    const u = [Math.cos(m.r), -Math.sin(m.r)], n = [Math.sin(m.r), Math.cos(m.r)];
    const t = m.x * u[0] + m.z * u[1], dist = m.x * n[0] + m.z * n[1];
    const cle = `${Math.round(m.r * 100)}|${Math.round(dist * 50)}`;
    if (!lignes.has(cle)) lignes.set(cle, []);
    lignes.get(cle).push({ t, l: d.l, r: m.r, dist, u, n });
  }
  // 1. rangées : meubles alignés et bord à bord
  const rangees = [];
  for (const items of lignes.values()) {
    items.sort((a, b) => a.t - b.t);
    let run = [items[0]];
    const fermer = () => { const a = run[0], z = run[run.length - 1]; rangees.push({ r: a.r, u: a.u, n: a.n, dist: a.dist, t0: a.t - a.l / 2, t1: z.t + z.l / 2 }); };
    for (let i = 1; i < items.length; i++) {
      const p = items[i - 1], q = items[i];
      if (Math.abs((q.t - q.l / 2) - (p.t + p.l / 2)) < 0.02) run.push(q); else { fermer(); run = [q]; }
    }
    fermer();
  }
  // emprise d'une rangée, dans le repère (u, n) d'un angle donné
  const rectDans = (rg, r0) => {
    const e0 = [Math.cos(r0), -Math.sin(r0)], z0 = [Math.sin(r0), Math.cos(r0)];
    const pts = [[rg.t0, rg.dist], [rg.t1, rg.dist], [rg.t0, rg.dist + P], [rg.t1, rg.dist + P]].map(([t, b]) => {
      const x = t * rg.u[0] + b * rg.n[0], z = t * rg.u[1] + b * rg.n[1];
      return [x * e0[0] + z * e0[1], x * z0[0] + z * z0[1]];
    });
    const as = pts.map((q) => q[0]), bs = pts.map((q) => q[1]);
    return [Math.min(...as), Math.max(...as), Math.min(...bs), Math.max(...bs)];
  };
  // 2. rangées qui se touchent à angle droit : une seule dalle
  const comp = rangees.map((_, i) => i);
  const racine = (i) => (comp[i] === i ? i : (comp[i] = racine(comp[i])));
  for (let i = 0; i < rangees.length; i++) for (let j = i + 1; j < rangees.length; j++) {
    if (Math.abs(Math.cos(rangees[i].r - rangees[j].r)) > 0.01) continue;
    const A = rectDans(rangees[i], rangees[i].r), B = rectDans(rangees[j], rangees[i].r), tol = 0.03;
    if (A[0] - tol <= B[1] && B[0] - tol <= A[1] && A[2] - tol <= B[3] && B[2] - tol <= A[3]) comp[racine(j)] = racine(i);
  }
  const groupes = new Map();
  rangees.forEach((rg, i) => { const k = racine(i); if (!groupes.has(k)) groupes.set(k, []); groupes.get(k).push(rg); });
  const y = PLINTHE + CAISSON + ep / 2;
  for (const rgs of groupes.values()) {
    const r0 = rgs[0].r;
    const grp = new THREE.Group(); grp.rotation.y = r0; g.add(grp);
    if (rgs.length === 1) {
      const [a0, a1, b0, b1] = rectDans(rgs[0], r0);
      boiteArrondie(grp, mats.plan(cfg.plan, a1 - a0), a1 - a0, ep, b1 - b0, (a0 + a1) / 2, y, (b0 + b1) / 2, 0.004);
      continue;
    }
    // union de rectangles alignés : bandes horizontales sans recouvrement
    const rects = rgs.map((rg) => rectDans(rg, r0));
    const bs = [...new Set(rects.flatMap((q) => [q[2], q[3]].map((v) => Math.round(v * 1000) / 1000)))].sort((p, q) => p - q);
    for (let k = 0; k < bs.length - 1; k++) {
      const bm = (bs[k] + bs[k + 1]) / 2;
      const ints = rects.filter((q) => q[2] <= bm && bm <= q[3]).map((q) => [q[0], q[1]]).sort((p, q) => p[0] - q[0]);
      const fus = [];
      for (const it of ints) { const l = fus[fus.length - 1]; if (l && it[0] <= l[1] + 0.03) l[1] = Math.max(l[1], it[1]); else fus.push([...it]); }
      for (const [a0, a1] of fus) boite(grp, mats.plan(cfg.plan, a1 - a0), a1 - a0, ep, bs[k + 1] - bs[k], (a0 + a1) / 2, y, bm);
    }
  }
  return g;
}
