import { PrismaIndexRepository } from '@framework/repositories/prisma_index.repository'
import { BacenSelicIndex } from '../bacen_selic_index'
import logger from '@common/logger'
import { GetSelicRatesFromStream } from '../get_selic_rates_from_stream'
import { jsonStream } from '@framework/libs/stream-json'
import { exit } from 'process'

export async function seedSelicIndex(): Promise<void> {
  logger.info('Starting seed...')
  const repository = new PrismaIndexRepository()
  const handler = new BacenSelicIndex(repository)
  const stream = await handler.download()
  const getIndexes = new GetSelicRatesFromStream(stream, jsonStream, handler)
  await getIndexes.execute()
  logger.info('Finishing seed...')
  exit(0)
}

seedSelicIndex()
