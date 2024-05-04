import { IndexEntity, Indexes } from '../entity'

export interface IndexRepository {
  save(index: IndexEntity): Promise<void>
  getLast(index: Indexes): Promise<IndexEntity | null>
}
