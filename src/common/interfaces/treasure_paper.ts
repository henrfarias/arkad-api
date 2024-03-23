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

export interface TreasurePaper {
  titulo: string
  data_ref: Date
  vencimento: Date
  indice: 'selic'
  taxa_compra: number
  pu_compra: number
  pu_venda: number
}
