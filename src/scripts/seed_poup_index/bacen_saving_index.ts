import axios from 'axios'
import logger from '@common/logger'
import { Readable } from 'stream'
import {
  Frequency,
  IndexEntity,
  Indexes,
  RawSaving
} from '@domain/interfaces/entity'
import { IndexRepository } from '@domain/interfaces/repositories/index.repository'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

export class BacenSavingIndex {
  range: { initialDate: string; finalDate: string }
  lastIndex?: IndexEntity
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
    const lastIndex = await this.repository.getLast(Indexes.SAVING)
    if (lastIndex) {
      this.lastIndex = lastIndex
      this.range.initialDate = this.dateToString(
        dayjs(lastIndex.refDate).add(1, 'day')
      )
    }
    logger.info('download starting...')
    const endpoint = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.25/dados?formato=json&dataInicial=${this.range.initialDate}&dataFinal=${this.range.finalDate}`
    const readable = await axios.get(endpoint, { responseType: 'stream' })
    logger.info('processing...')
    return readable.data
  }

  public filter(rawSaving: RawSaving): RawSaving | null {
    if (this.lastIndex) {
      const isRepeatedRate =
        this.diffInDays(
          this.dateConversion(rawSaving.data),
          this.lastIndex.refDate
        ) <= 0
      if (isRepeatedRate) {
        return null
      }
    }
    const [day] = rawSaving.data.split('/')
    if (day != '01') {
      return null
    }
    return rawSaving
  }

  public format(rawSaving: RawSaving, frequency: Frequency): IndexEntity {
    const refDate = this.dateConversion(rawSaving.data)
    const rate = Number((parseFloat(rawSaving.valor) / 100).toFixed(8))
    return {
      index: Indexes.SAVING,
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

  private dateConversion(dateString: string): Date {
    const [day, month, year] = dateString.split('/')
    return dayjs(`${year}-${month}-${day}`).toDate()
  }

  private dateToString(date: dayjs.ConfigType): string {
    return dayjs(date).format('DD/MM/YYYY')
  }

  private diffInDays(refDate: Date, compareDate: Date): number {
    const diff = dayjs(refDate).diff(compareDate, 'day')
    return diff
  }
}
