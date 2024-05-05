import { PrismaIndexRepository } from '@framework/repositories/prisma_index.repository'
import logger from '@common/logger'
import { jsonStream } from '@framework/libs/stream-json'
import { exit } from 'process'
import { BacenSavingIndex } from '../bacen_saving_index'
import { GetSavingRatesFromStream } from '../get_saving_rates_from_stream'

export async function seedSavingIndex(): Promise<void> {
  logger.info('Starting seed...')
  const repository = new PrismaIndexRepository()
  const handler = new BacenSavingIndex(repository)
  const stream = await handler.download()
  const getIndexes = new GetSavingRatesFromStream(stream, jsonStream, handler)
  await getIndexes.execute()
  logger.info('Finishing seed...')
  exit(0)
}

seedSavingIndex()
