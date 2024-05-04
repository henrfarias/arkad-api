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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

export class BacenSelicIndex {
  range: { initialDate: string; finalDate: string }
  constructor(private repository: IndexRepository) {
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.tz.setDefault('America/Sao_Paulo')
    this.range = {
      initialDate: this.dateToString(new Date('2004-12-31T03:00')),
      finalDate: this.dateToString(new Date())
    }
  }

  public async download(): Promise<Readable> {
    const lastIndex = await this.repository.getLast(Indexes.SELIC)
    if (lastIndex) {
      this.range.initialDate = this.dateToString(
        dayjs(lastIndex.refDate).add(1, 'day')
      )
    }
    logger.info('download starting...')
    const endpoint = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json&dataInicial=${this.range.initialDate}&dataFinal=${this.range.finalDate}`
    const readable = await axios.get(endpoint, { responseType: 'stream' })
    logger.info('processing...')
    return readable.data
  }

  public format(rawSelic: RawSelic, frequency: Frequency): IndexEntity {
    const [day, month, year] = rawSelic.data.split('/')
    const refDate = dayjs(`${year}-${month}-${day}`).toDate()
    const rate = Number((parseFloat(rawSelic.valor) / 100).toFixed(8))
    return {
      index: Indexes.SELIC,
      rate,
      refDate,
      frequency
    }
  }

  public async persist(index: IndexEntity): Promise<void> {
    logger.debug({ index }, 'persisting index...')
    await this.repository.save(index)
    return
  }

  private dateToString(date: dayjs.ConfigType): string {
    return dayjs(date).format('DD/MM/YYYY')
  }
}
