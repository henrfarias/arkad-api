import { Indexes } from '@domain/interfaces/entity'
import {
  TreasurePaper,
  TreasurePaperEntity
} from '@domain/interfaces/entity/treasure_paper'
import { TreasurePaperRepository } from '@domain/interfaces/repositories/treasure_paper.repository'
import prisma from '@framework/libs/prisma-client'
import { PrismaClient } from '@prisma/client'

export class PrismaTreasurePaperRepository implements TreasurePaperRepository {
  prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  async save(treasure: TreasurePaperEntity): Promise<void> {
    await this.prisma.treasurePaper.create({ data: treasure })
    return
  }

  async getLast(index: Indexes): Promise<TreasurePaper | null> {
    return this.prisma.treasurePaper.findFirst({
      where: { index },
      orderBy: { refDate: 'desc' }
    })
  }
}
