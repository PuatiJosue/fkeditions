import { DEFAULT_MPESA_NUMBER, DEFAULT_AIRTEL_NUMBER } from './constants'

/** Opérateur Mobile Money (M-Pesa / Airtel) et ses contraintes de numéro. */
export interface Operator {
  value: string
  label: string
  number: string
  prefixes: string[]
  placeholder: string
}

/** Construit la liste des opérateurs à partir des numéros de réception. */
export function buildOperators(mpesa: string, airtel: string): Operator[] {
  return [
    { value: 'M_PESA', label: 'M-Pesa', number: mpesa, prefixes: ['081', '082'], placeholder: 'ex: 0810000000 ou 0820000000' },
    { value: 'AIRTEL', label: 'Airtel Money', number: airtel, prefixes: ['099'], placeholder: 'ex: 0990000000' },
  ]
}

/** Opérateurs avec les numéros par défaut (repli avant chargement des réglages). */
export const DEFAULT_OPERATORS = buildOperators(DEFAULT_MPESA_NUMBER, DEFAULT_AIRTEL_NUMBER)
