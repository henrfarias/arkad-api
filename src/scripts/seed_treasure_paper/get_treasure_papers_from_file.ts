import { Transform, Writable } from 'node:stream'

import csvtojson from 'csvtojson'

import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

export async function getBrazilianTreasurePapers(): Promise<void> {
  const paperHandler = new BacenTreasurePaper('Tesouro Selic')

  const filter = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, cb) => {
      const data = JSON.parse(chunk)
      const treasure = paperHandler.filter(data)
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
        const formatted = paperHandler.parse(treasure)
        return cb(null, JSON.stringify(formatted))
      }
      return cb()
    }
  })

  const persist = new Writable({
    write: async (chunk, _, cb) => {
      paperHandler.persist(JSON.parse(chunk))
      cb(null)
    }
  })

  const stream = await paperHandler.download()
  stream
    .pipe(csvtojson({ delimiter: ';' }))
    .pipe(filter)
    .pipe(parse)
    .pipe(persist)
}
