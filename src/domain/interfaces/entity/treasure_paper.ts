import { Indexes } from '.'

export interface RawTreasure {
  'Tipo Titulo': string
  'Data Vencimento': string
  'Data Base': string
  'Taxa Compra Manha': string
  'Taxa Venda Manha': string
  'PU Compra Manha': string
  'PU Venda Manha': string
  'PU Base Manha': string
}

export interface TreasurePaperEntity {
  title: string
  refDate: Date
  dueDate: Date
  index: `${Indexes}`
  purchaseFee: number
  purchasePrice: number
  salePrice: number
}

export interface TreasurePaper extends TreasurePaperEntity {
  id?: string
}
