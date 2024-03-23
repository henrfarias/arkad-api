import { Transform, Writable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import csvtojson from 'csvtojson'

import logger from 'src/common/logger'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

export async function getBrazilianTreasurePapersFromFile(
  filePath: string
): Promise<void> {
  const paperHandler = new BacenTreasurePaper('Tesouro Selic')
  const readStream = paperHandler.readFile(filePath)
  logger.debug(`Reading file ${filePath}`)
  if (readStream === null) {
    throw new Error('File not found')
  }
  const transformer = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: (chunk, _, callback) => {
      const data = JSON.parse(chunk)
      const treasure = paperHandler.filter(data)
      if (treasure) {
        const formatted = paperHandler.parse(treasure)
        return callback(null, JSON.stringify(formatted))
      }
      return callback()
    }
  })
  const writableStream = new Writable({
    write: (chunk, _, callback) => {
      Promise.resolve(paperHandler.persist(JSON.parse(chunk))).then(() => {
        callback(null)
      })
    }
  })
  await pipeline(
    readStream,
    csvtojson({ delimiter: ';' }),
    transformer,
    writableStream
  ).catch(logger.error.bind(logger))
  return
}
