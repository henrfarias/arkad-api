import { ProjectiveRateEntity, ProjectiveRate } from '@domain/interfaces/entity/projective_rate'
import {
  InputGetNextYearsProjectiveRate,
  ProjectiveRateRepository
} from '@domain/interfaces/repositories/projective_rate.repository'
import prisma from '@framework/libs/prisma-client'
import { PrismaClient } from '@prisma/client'

export class PrismaProjectiveRateRepository implements ProjectiveRateRepository {
  prisma: PrismaClient
  constructor() {
    this.prisma = prisma
  }

  async save(input: ProjectiveRateEntity): Promise<void> {
    await this.prisma.projectiveRate.create({ data: input })
    return
  }

  async getNextYears(input: InputGetNextYearsProjectiveRate): Promise<ProjectiveRate[]> {
    const currentYear = new Date().getFullYear()
    const { where } = input
    return this.prisma.projectiveRate.findMany({
      where: { ...where, refYear: { gte: currentYear, lte: currentYear + input.howManyYears } },
      orderBy: { refYear: 'asc' }
    })
  }
}
