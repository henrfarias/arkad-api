import { IndexEntity } from '@domain/interfaces/entity'
import { IndexRepository } from '@domain/interfaces/repositories/index.repository'
import prisma from '@framework/libs/prisma-client'
import { Indexes, PrismaClient } from '@prisma/client'

export class PrismaIndexRepository implements IndexRepository {
  prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  async save(index: IndexEntity): Promise<void> {
    await this.prisma.index.create({ data: index })
    return
  }

  async getLast(index: Indexes): Promise<IndexEntity | null> {
    return this.prisma.index.findFirst({
      where: { index },
      orderBy: { refDate: 'desc' }
    })
  }
}
