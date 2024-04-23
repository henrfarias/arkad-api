import {
  TreasurePaperEntity,
  Indexes,
  TreasurePaper
} from '@domain/interfaces/entity/treasure_paper'
import { TreasurePaperRepository } from '@domain/interfaces/repositories/treasure_paper.repository'

export class MemoryTreasurePaperRepository implements TreasurePaperRepository {
  papers: TreasurePaperEntity[] = []
  constructor() {
    this.papers = []
  }

  async save(treasure: TreasurePaperEntity): Promise<void> {
    this.papers.push(treasure)
    return
  }

  async getLast(index: Indexes): Promise<TreasurePaper | null> {
    const paper = this.papers
      .filter((paper) => paper.index === index)
      .sort((a, b) => b.refDate.getTime() - a.refDate.getTime())
    return paper[0] || null
  }
}
