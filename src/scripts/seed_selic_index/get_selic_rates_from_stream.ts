import { Controller } from '@domain/controller'
import { Readable, Transform, Writable, Duplex } from 'stream'
import { BacenSelicIndex } from './bacen_selic_index'
import { pipeline } from 'stream/promises'
import logger from '@common/logger'
import { Frequency, RawSelic } from '@domain/interfaces/entity'

export class GetSelicRatesFromStream extends Controller {
  count = 0
  constructor(
    public stream: Readable,
    private jsonStream: Duplex,
    private handler: BacenSelicIndex
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
      .finally(() => logger.info(`New selic rates: ${this.count}`))
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
      const data = chunk.value as RawSelic
      const selicRate = this.handler.format(data, Frequency.DAILY)
      return cb(null, JSON.stringify(selicRate))
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
