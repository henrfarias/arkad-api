import logger from '@common/logger'
import { csvStream } from '@framework/libs/fast-csv'
import { PrismaTreasurePaperRepository } from '@framework/repositories/prisma_treasure_paper.repository'
import { exit } from 'process'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'
import { GetTreasurePapersFromStream } from 'src/scripts/seed_treasure_paper/get_treasure_papers_from_stream'

export async function seedTreasure(): Promise<void> {
  logger.debug('Starting seed...')
  const repository = new PrismaTreasurePaperRepository()
  const handler = new BacenTreasurePaper('Tesouro Selic', repository)
  const stream = await handler.download()
  const csvToJson = csvStream
  const getTreasures = new GetTreasurePapersFromStream(
    stream,
    csvToJson,
    handler
  )
  await getTreasures.execute()
  logger.debug('Finishing seed...')
  exit(0)
}

seedTreasure()
