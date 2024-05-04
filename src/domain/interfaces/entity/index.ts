export interface RawSelic {
  data: string
  valor: string
}

export enum Indexes {
  SELIC = 'selic',
  POUP = 'poup'
}

export enum Frequency {
  DAILY = 'diaria',
  MONTHLY = 'mensal',
  YEARLY = 'anual'
}

export interface IndexEntity {
  index: `${Indexes}`
  rate: number
  refDate: Date
  frequency: `${Frequency}`
}

export interface Index extends IndexEntity {
  id?: string
}
