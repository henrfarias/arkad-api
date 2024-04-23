import { Readable, Transform, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { csvStream } from '@framework/libs/fast-csv'

import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

export class GetTreasurePapersFromStream {
  constructor(
    public stream: Readable,
    private handler: BacenTreasurePaper
  ) {}

  async execute(): Promise<void> {
    await pipeline(
      this.stream,
      csvStream,
      this.filter,
      this.parse,
      this.persist
    )
    return
  }

  private filter = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, cb) => {
      const data = JSON.parse(chunk)
      const treasure = this.handler.filter(data)
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
      if (treasure) {
        const formatted = this.handler.parse(treasure)
        return cb(null, JSON.stringify(formatted))
      }
      return cb()
    }
  })

  private persist = new Writable({
    write: async (chunk, _, cb) => {
      this.handler.persist(JSON.parse(chunk))
      cb(null)
    }
  })
}
