import logger from '@common/logger'
import { IndexEntity } from '@domain/interfaces/entity'
import { IndexRepository } from '@domain/interfaces/repositories/index.repository'

export class MemoryIndexRepository implements IndexRepository {
  public indexes: IndexEntity[] = []
  constructor() {}

  public async save(index: IndexEntity): Promise<void> {
    logger.debug(index, 'persisting index...')
    this.indexes.push(index)
    return
  }
}
