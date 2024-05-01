import logger from '@common/logger'
import { IndexEntity, Indexes } from '@domain/interfaces/entity'
import { IndexRepository } from '@domain/interfaces/repositories/index.repository'

export class MemoryIndexRepository implements IndexRepository {
  public indexes: IndexEntity[] = []
  constructor() {}

  public async save(index: IndexEntity): Promise<void> {
    logger.debug(index, 'persisting index...')
    this.indexes.push(index)
    return
  }

  public async getLast(index: Indexes): Promise<IndexEntity | null> {
    const idx = this.indexes
      .filter((paper) => paper.index === index)
      .sort((a, b) => {
        return b.refDate.getTime() - a.refDate.getTime()
      })[0]
    return idx || null
  }
}
