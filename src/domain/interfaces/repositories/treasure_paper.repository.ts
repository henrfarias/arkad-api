import { TreasurePaperEntity } from '@interfaces/entity/treasure_paper'

export interface TreasurePaperRepository {
  save(treasure: TreasurePaperEntity): Promise<void>
}
