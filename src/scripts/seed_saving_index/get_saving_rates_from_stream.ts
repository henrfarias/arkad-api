import { Controller } from '@domain/controller'
import { Readable, Transform, Writable, Duplex } from 'stream'
import { pipeline } from 'stream/promises'
import logger from '@common/logger'
import { Frequency, RawSaving } from '@domain/interfaces/entity'
import { BacenSavingIndex } from './bacen_saving_index'

export class GetSavingRatesFromStream extends Controller {
  count = 0
  constructor(
    public stream: Readable,
    private jsonStream: Duplex,
    private handler: BacenSavingIndex
  ) {
    super()
  }

  async execute(): Promise<void> {
    await pipeline(
      this.stream,
      this.jsonStream,
      this.filter,
      this.format,
      this.persist
    )
      .finally(() => logger.info(`New saving rates: ${this.count}`))
      .catch((error) => logger.error(error))
    return
  }

  private filter = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: async (chunk, _, cb) => {
      const rate = this.handler.filter(chunk.value)
      if (rate) {
        return cb(null, chunk)
      }
      return cb()
    }
  })

  private format = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: async (chunk, _, cb) => {
      const data = chunk.value as RawSaving
      const savingRate = this.handler.format(data, Frequency.DAILY)
      return cb(null, JSON.stringify(savingRate))
    }
  })

  private persist = new Writable({
    write: async (chunk, _, cb) => {
      this.count++
      await this.handler.persist(JSON.parse(chunk))
      cb(null)
    }
  })

  public done(): void {
    this.stream.destroy()
    this.persist.end()
  }
}
