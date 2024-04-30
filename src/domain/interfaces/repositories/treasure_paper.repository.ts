import {
  TreasurePaper,
  TreasurePaperEntity
} from '@interfaces/entity/treasure_paper'
import { Indexes } from '../entity'

export interface TreasurePaperRepository {
  save(treasure: TreasurePaperEntity): Promise<void>
  getLast(index: Indexes): Promise<TreasurePaper | null>
}
