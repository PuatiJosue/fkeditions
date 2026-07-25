/** Données statiques de la page FLYSYS : formules d'abonnement et opérateurs Mobile Money. */

export interface Operator {
  value: string
  label: string
  number: string
  prefixes: string[]
  placeholder: string
}

export function buildOperators(mpesa: string, airtel: string): Operator[] {
  return [
    { value: 'M_PESA', label: 'M-Pesa', number: mpesa, prefixes: ['081', '082'], placeholder: 'ex: 0810000000 ou 0820000000' },
    { value: 'AIRTEL', label: 'Airtel Money', number: airtel, prefixes: ['099'], placeholder: 'ex: 0990000000' },
  ]
}

export const DEFAULT_OPERATORS = buildOperators('0829082048', '0991316128')

export interface RevueIssue {
  id: string
  title: string
  month: number
  year: number
  description: string | null
  pdfFile: string | null
  epubFile: string | null
}

export interface Plan {
  id: string
  name: string
  price: number
  tagline: string
  features: string[]
  popular?: boolean
  best?: boolean
}

/**
 * Formules FLYSYS — chaque abonnement donne accès à l'exclusivité des contenus
 * pendant 1 mois entier. Les prix DOIVENT rester alignés avec les routes de
 * paiement côté serveur (app/api/checkout/**), qui font foi pour le montant facturé.
 */
export const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 5,
    tagline: 'Pour bien démarrer',
    features: ['Accès à tous les cours', 'Exercices pratiques', 'Accès mobile et ordinateur'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 10,
    tagline: 'Le plus complet',
    features: ['Accès à tous les cours', 'Exercices pratiques', 'Analyses détaillées', 'Accès mobile et ordinateur'],
    popular: true,
  },
  {
    id: 'flysys_x',
    name: 'FLYSYS X',
    price: 30,
    tagline: 'Universités & institutions',
    features: ['Cours, exercices et analyses', 'Pensé pour les établissements', 'Accompagnement dédié', 'Accès mobile et ordinateur'],
    best: true,
  },
]
