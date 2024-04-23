import axios from 'axios'
import {
  Indexes,
  RawTreasure,
  TreasurePaper
} from '@interfaces/entity/treasure_paper'
import { Readable } from 'node:stream'
import { TreasurePaperRepository } from '@domain/interfaces/repositories/treasure_paper.repository'

export class BacenTreasurePaper {
  constructor(
    readonly name: string,
    private treasurePaperRepository: TreasurePaperRepository
  ) {
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
    const refDate = new Date(`${formatDateRef}T03:00:00Z`)
    const formatDueDate = treasure['Data Vencimento']
      .split('/')
      .reverse()
      .join('-')
    const purchaseFee =
      parseFloat(treasure['Taxa Compra Manha'].replace(',', '.')) / 100
    const puCompra = parseFloat(treasure['PU Compra Manha'].replace(',', '.'))
    const puVenda = parseFloat(treasure['PU Venda Manha'].replace(',', '.'))
    const dueDate = new Date(`${formatDueDate}T03:00:00Z`)
    return {
      title: `${treasure['Tipo Titulo']} ${dueDate.getFullYear()}`,
      refDate,
      dueDate,
      index: Indexes.SELIC,
      purchaseFee: purchaseFee,
      purchasePrice: Math.ceil(puCompra * 100),
      salePrice: Math.ceil(puVenda * 100)
    }
  }

  public async persist(treasure: TreasurePaper): Promise<void> {
    this.treasurePaperRepository.save(treasure)
    return
  }
}
