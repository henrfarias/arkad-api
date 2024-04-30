import { IndexEntity } from '../entity'

export interface IndexRepository {
  save(index: IndexEntity): Promise<void>
}
