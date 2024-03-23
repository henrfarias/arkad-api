import { ReadStream, createReadStream, createWriteStream } from 'node:fs'
import { dirname } from 'node:path'
import { Readable } from 'node:stream'
import { finished } from 'node:stream/promises'
import {
  TreasurePaper,
  RawTreasure
} from 'src/common/interfaces/treasure_paper'
import logger from 'src/common/logger'

export class BacenTreasurePaper {
  constructor(readonly name: string) {
    this.name = name
  }

  public async download(fileName: string): Promise<string | null> {
    const response = await fetch(
      'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'
    )
    if (response.status !== 200 || response.body === null) return null
    const { pathname: currentPath } = new URL(import.meta.url)
    const outputPath = `${dirname(currentPath)}/temp/${fileName}`
    const writableStream = createWriteStream(outputPath)
    await finished(
      Readable.fromWeb(response.body).on('data', (chunk) => {
        logger.debug(Buffer.from(chunk, 'utf-8').toString())
        writableStream.write(chunk)
      })
    )
    return outputPath
  }

  public readFile(path: string): ReadStream | null {
    if (!path) return null
    return createReadStream(path, { encoding: 'utf-8' })
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

  public persist(treasure: TreasurePaper): void {
    logger.info(JSON.stringify(treasure))
  }
}
