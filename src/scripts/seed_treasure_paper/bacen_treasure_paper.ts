import axios from 'axios'
import { Readable } from 'node:stream'
import {
  TreasurePaper,
  RawTreasure
} from 'src/common/interfaces/treasure_paper'
import logger from 'src/common/logger'

export class BacenTreasurePaper {
  constructor(readonly name: string) {
    this.name = name
  }

  public async download(): Promise<Readable> {
    const endpoint =
      'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'
    const readable = await axios.get(endpoint, { responseType: 'stream' })
    return readable.data
  }

  public filter(treasure: RawTreasure): RawTreasure | null {
    if (treasure['Tipo Titulo'] === this.name) {
      return treasure
    }
    return null
  }

  public parse(treasure: RawTreasure): TreasurePaper {
    const formatDateRef = treasure['Data Base'].split('/').reverse().join('-')
    const dateRef = new Date(`${formatDateRef}T03:00:00Z`)
    const formatDueDate = treasure['Data Vencimento']
      .split('/')
      .reverse()
      .join('-')
    const taxaCompra = parseFloat(
      treasure['Taxa Compra Manha'].replace(',', '.')
    )
    const puCompra = parseFloat(treasure['PU Compra Manha'].replace(',', '.'))
    const puVenda = parseFloat(treasure['PU Venda Manha'].replace(',', '.'))
    const dueDate = new Date(`${formatDueDate}T03:00:00Z`)
    return {
      titulo: `${treasure['Tipo Titulo']} ${dueDate.getFullYear()}`,
      data_ref: dateRef,
      vencimento: dueDate,
      indice: 'selic',
      taxa_compra: taxaCompra / 100,
      pu_compra: Math.ceil(puCompra * 100),
      pu_venda: Math.ceil(puVenda * 100)
    }
  }

  public async persist(treasure: TreasurePaper): Promise<void> {
    logger.debug(JSON.stringify(treasure))
  }
}
