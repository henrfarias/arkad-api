import { Readable, Transform, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { csvStream } from 'src/framework/libs/fast-csv'

import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

export async function getBrazilianTreasurePapers(
  handler: BacenTreasurePaper,
  stream: Readable
): Promise<void> {
  const filter = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, cb) => {
      const data = JSON.parse(chunk)
      const treasure = handler.filter(data)
      if (treasure) {
        return cb(null, chunk)
      }
      return cb()
    }
  })

  const parse = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, cb) => {
      const treasure = JSON.parse(chunk)
      if (treasure) {
        const formatted = handler.parse(treasure)
        return cb(null, JSON.stringify(formatted))
      }
      return cb()
    }
  })

  const persist = new Writable({
    write: async (chunk, _, cb) => {
      handler.persist(JSON.parse(chunk))
      cb(null)
    }
  })
  await pipeline(stream, csvStream, filter, parse, persist)
  return
}
