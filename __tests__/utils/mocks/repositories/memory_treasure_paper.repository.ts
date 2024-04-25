import {
  TreasurePaperEntity,
  Indexes,
  TreasurePaper
} from '@domain/interfaces/entity/treasure_paper'
import { TreasurePaperRepository } from '@domain/interfaces/repositories/treasure_paper.repository'

export class MemoryTreasurePaperRepository implements TreasurePaperRepository {
  public papers: TreasurePaperEntity[] = []
  constructor() {}

  async save(treasure: TreasurePaperEntity): Promise<void> {
    this.papers.push(treasure)
    return
  }

  async getLast(index: Indexes): Promise<TreasurePaper | null> {
    const paper = this.papers
      .filter((paper) => paper.index === index)
      .sort((a, b) => {
        return b.refDate.getTime() - a.refDate.getTime()
      })[0]
    return paper || null
  }
}
