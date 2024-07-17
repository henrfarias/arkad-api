import logger from '@common/logger'
import { PrismaProjectiveRateRepository } from '@framework/repositories/prisma_projective_rate.repository'
import { exit } from 'process'
import { BacenProjectiveSelicRate } from '../bacen_projective_selic_rate'
import { GetProjectiveSelicRate } from '../get_projective_selic_rate'

export async function seedProjectiveSelicRate(): Promise<void> {
  logger.info('Starting seed...')
  const repository = new PrismaProjectiveRateRepository()
  const handler = new BacenProjectiveSelicRate(repository)
  const getIndexes = new GetProjectiveSelicRate(handler)
  await getIndexes.execute()
  logger.info('Finishing seed...')
  exit(0)
}

seedProjectiveSelicRate()
