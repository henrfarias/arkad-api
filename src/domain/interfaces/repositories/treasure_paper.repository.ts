import {
  Indexes,
  TreasurePaper,
  TreasurePaperEntity
} from '@interfaces/entity/treasure_paper'

export interface TreasurePaperRepository {
  save(treasure: TreasurePaperEntity): Promise<void>
  getLast(index: Indexes): Promise<TreasurePaper | null>
}
