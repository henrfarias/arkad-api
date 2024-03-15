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

export interface ParsedTreasure {
  titulo: string
  data_ref: Date
  vencimento: Date
  indice: 'selic'
  taxa_compra: number
  pu_compra: number
  pu_venda: number
}

export function filterSelicTreasure(treasure: RawTreasure): RawTreasure | null {
  if (treasure['Tipo Titulo'] === 'Tesouro Selic') {
    return treasure
  }
  return null
}

export function parseTreasure(treasure: RawTreasure): ParsedTreasure {
  const formatDateRef = treasure['Data Base'].split('/').reverse().join('-')
  const dateRef = new Date(`${formatDateRef}T03:00:00Z`)
  const formatDueDate = treasure['Data Vencimento']
    .split('/')
    .reverse()
    .join('-')
  const dueDate = new Date(`${formatDueDate}T03:00:00Z`)
  return {
    titulo: `${treasure['Tipo Titulo']} ${dueDate.getFullYear()}`,
    data_ref: dateRef,
    vencimento: dueDate,
    indice: 'selic',
    taxa_compra: parseFloat(treasure['Taxa Compra Manha']) / 100,
    pu_compra: parseFloat(treasure['PU Compra Manha']) * 100,
    pu_venda: parseFloat(treasure['PU Venda Manha']) * 100
  }
}
