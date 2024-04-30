import { Controller } from '@domain/controller'
import { Readable, Transform, Writable, Duplex } from 'stream'
import { BacenSelicIndex } from './bacen_selic_index'
import { pipeline } from 'stream/promises'
import logger from '@common/logger'
import { Frequency, RawSelic } from '@domain/interfaces/entity'

export class GetSelicRatesFromStream extends Controller {
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
      this.format,
      this.persist
    ).catch((error) => logger.error(error))
    return
  }

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
      await this.handler.persist(JSON.parse(chunk))
      cb(null)
    }
  })

  public done(): void {
    this.stream.destroy()
    this.persist.end()
  }
}
