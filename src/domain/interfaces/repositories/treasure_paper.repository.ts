import { TreasurePaperEntity } from '../entity/treasure_paper'

export interface TreasurePaperRepository {
  save(treasure: TreasurePaperEntity): Promise<void>
}
