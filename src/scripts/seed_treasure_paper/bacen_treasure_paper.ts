import axios from 'axios'
import {
  Indexes,
  RawTreasure,
  TreasurePaper
} from '@interfaces/entity/treasure_paper'
import { Readable } from 'node:stream'
import { TreasurePaperRepository } from '@domain/interfaces/repositories/treasure_paper.repository'

export class BacenTreasurePaper {
  last?: TreasurePaper | null
  constructor(
    readonly name: string,
    private treasurePaperRepository: TreasurePaperRepository
  ) {
    this.name = name
    this.last = undefined
  }

  public async download(): Promise<Readable> {
    const endpoint =
      'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'
    const readable = await axios.get(endpoint, { responseType: 'stream' })
    return readable.data
  }

  public async filter(treasure: RawTreasure): Promise<RawTreasure | null> {
    if (this.last === undefined) {
      this.last = await this.treasurePaperRepository.getLast(Indexes.SELIC)
    }
    if (treasure['Tipo Titulo'] === this.name) {
      if (
        this.last &&
        this.formatDate(treasure['Data Base']).getTime() <=
          this.last.refDate.getTime()
      ) {
        return null
      }
      return treasure
    }
    return null
  }

  public parse(treasure: RawTreasure): TreasurePaper {
    const refDate = this.formatDate(treasure['Data Base'])
    const purchaseFee =
      parseFloat(treasure['Taxa Compra Manha'].replace(',', '.')) / 100
    const puCompra = parseFloat(treasure['PU Compra Manha'].replace(',', '.'))
    const puVenda = parseFloat(treasure['PU Venda Manha'].replace(',', '.'))
    const dueDate = this.formatDate(treasure['Data Vencimento'])
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
    treasure.refDate = new Date(treasure.refDate)
    treasure.dueDate = new Date(treasure.dueDate)
    // console.debug(treasure)
    this.treasurePaperRepository.save(treasure)
    return
  }

  private formatDate(date: string): Date {
    return new Date(`${date.split('/').reverse().join('-')}T03:00:00Z`)
  }
}
