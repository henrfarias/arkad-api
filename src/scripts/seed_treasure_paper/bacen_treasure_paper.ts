import { ReadStream, createReadStream } from 'node:fs'
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

  public async download(
    path: string,
    stream: Readable
  ): Promise<undefined | null> {
    const response = await fetch(path)
    if (response.status !== 200 || response.body === null) return null
    await finished(
      Readable.fromWeb(response.body).on('data', (chunk) => {
        stream.emit('readable', chunk)
      })
    )
    return undefined
  }

  public readFile(path: string): ReadStream | null {
    if (!path) return null
    return createReadStream(path, { encoding: 'utf-8' })
  }

  public filter(treasure: RawTreasure): RawTreasure | null {
    logger.debug({ method: '[FILTER]', type: treasure['Tipo Titulo'] })
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
    logger.info({ method: '[PERSIST]', treasure })
  }
}
