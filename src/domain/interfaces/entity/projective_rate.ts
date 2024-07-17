import { Indexes } from '.'

export interface RawProjectiveSelicRate {
  Indicador: string // e.g. Selic
  Data: string // e.g. YYYY-MM-DD
  DataReferencia: string // e.g. YYYY
  Media: number // e.g. 0.0
}

export interface ProjectiveRateEntity {
  annualRate: number
  index: `${Indexes}`
  refYear: number
  calculationDate: Date
}

export interface ProjectiveRate extends ProjectiveRateEntity {
  id: string
}
