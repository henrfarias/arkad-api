import { Readable, Transform, Writable } from 'node:stream'
import csvtojson from 'csvtojson'

import logger from 'src/common/logger'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

export function getBrazilianTreasurePapers(input: {
  readable: Readable
  paperHandler: BacenTreasurePaper
}): void {
  logger.debug('Reading chunks from readable stream...')
  const transformer = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, callback) => {
      const data = JSON.parse(chunk)
      const treasure = input.paperHandler.filter(data)
      if (treasure) {
        const formatted = input.paperHandler.parse(treasure)
        return callback(null, JSON.stringify(formatted))
      }
      return callback()
    }
  })
  const writableStream = new Writable({
    write: (chunk, _, callback) => {
      Promise.resolve(input.paperHandler.persist(JSON.parse(chunk))).then(
        () => {
          callback(null)
        }
      )
    }
  })
  const chunks: string[] = []
  input.readable.on('readable', (chunk: string) => {
    // logger.info(chunk.toString())
    chunks.push(chunk.toString())
  })

  csvtojson({ delimiter: ';' })
    .fromString(chunks.join(''))
    .pipe(transformer)
    .pipe(writableStream)
  // .pipe(csvtojson())
  // .pipe(transformer)
  // .pipe(writableStream)
  // .on('readable', () => {
  //   // logger.info(chunk.toString())
  // }).pipe(csvtojson()).pipe(transformer).pipe(writableStream)
  return
}
