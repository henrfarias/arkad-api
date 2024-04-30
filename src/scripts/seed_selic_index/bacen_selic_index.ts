import axios from 'axios'
import logger from '@common/logger'
import { Readable } from 'stream'
import {
  Frequency,
  IndexEntity,
  Indexes,
  RawSelic
} from '@domain/interfaces/entity'
import { IndexRepository } from '@domain/interfaces/repositories/index.repository'

export class BacenSelicIndex {
  constructor(private repository: IndexRepository) {}

  public async download(): Promise<Readable> {
    logger.debug('download starting...')
    const endpoint =
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/500?formato=json'
    const readable = await axios.get(endpoint, { responseType: 'stream' })
    return readable.data
  }

  public format(rawSelic: RawSelic, frequency: Frequency): IndexEntity {
    const [day, month, year] = rawSelic.data.split('/')
    const refDate = new Date(`${year}-${month}-${day}T00:00:00Z`)
    const rate = parseFloat(rawSelic.valor) / 100
    return {
      index: Indexes.SELIC,
      rate,
      refDate,
      frequency
    }
  }

  public async persist(index: IndexEntity): Promise<void> {
    await this.repository.save(index)
    return
  }
}
