/** Constantes partagées de l'application. */

/** Mois en français, indexés sur 1 (janvier = 1). L'index 0 reste vide. */
export const MONTHS_FR = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const

/** Mois abrégés, indexés sur 0 (compatibles avec `Date.getMonth()`). */
export const MONTHS_SHORT_FR = [
  'Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.',
] as const

/** Numéros Mobile Money par défaut (repli si les réglages serveur sont absents). */
export const DEFAULT_MPESA_NUMBER = '0829082048'
export const DEFAULT_AIRTEL_NUMBER = '0991316128'
