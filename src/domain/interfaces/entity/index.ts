export interface RawSelic {
  data: string
  valor: string
}

export interface RawSaving {
  data: string
  datafim: string
  valor: string
}

export enum Indexes {
  SELIC = 'selic',
  SAVING = 'poup'
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
