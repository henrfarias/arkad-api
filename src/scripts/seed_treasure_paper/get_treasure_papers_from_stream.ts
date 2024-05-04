import logger from '@common/logger'
import { Controller } from '@domain/controller'
import { PassThrough, Readable, Transform, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'
export class GetTreasurePapersFromStream extends Controller {
  constructor(
    public stream: Readable,
    private csvStream: PassThrough,
    private handler: BacenTreasurePaper
  ) {
    super()
  }

  async execute(): Promise<void> {
    await pipeline(
      this.stream,
      this.csvStream,
      this.filter,
      this.parse,
      this.persist
    ).catch((error) => logger.error(error))
    return
  }

  private filter = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: async (chunk, _, cb) => {
      const data = JSON.parse(chunk)
      const treasure = await this.handler.filter(data)
      if (treasure) {
        return cb(null, chunk)
      }
      return cb()
    }
  })

  private parse = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, cb) => {
      const treasure = JSON.parse(chunk)
      const formatted = this.handler.parse(treasure)
      return cb(null, JSON.stringify(formatted))
    }
  })

  private persist = new Writable({
    write: async (chunk, _, cb) => {
      this.handler.persist(JSON.parse(chunk))
      cb(null)
    }
  })

  public done() {
    this.stream.destroy()
    this.persist.end()
  }
}
