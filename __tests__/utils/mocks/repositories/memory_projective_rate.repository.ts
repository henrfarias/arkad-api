import { ProjectiveRate, ProjectiveRateEntity } from '@domain/interfaces/entity/projective_rate'
import {
  InputGetNextYearsProjectiveRate,
  ProjectiveRateRepository
} from '@domain/interfaces/repositories/projective_rate.repository'
import { randomUUID } from 'node:crypto'

export class MemoryProjectiveRateRepository implements ProjectiveRateRepository {
  public projectiveRates: ProjectiveRate[]
  constructor() {
    this.projectiveRates = []
  }
  public async save(input: ProjectiveRateEntity): Promise<void> {
    this.projectiveRates.push({ ...input, id: randomUUID() })
    return
  }

  public async getNextYears({
    howManyYears = 1,
    where
  }: InputGetNextYearsProjectiveRate): Promise<ProjectiveRate[]> {
    const result = []
    const { index } = where
    const currentYear = new Date().getFullYear()
    for (let i = 1; i < howManyYears; i++) {
      const nextYear = currentYear + i
      const rate = this.projectiveRates
        .filter((rate) => rate.index === index && rate.refYear === nextYear)
        .sort((a, b) => a.calculationDate.getTime() - b.calculationDate.getTime())[0]
      if (rate) {
        result.push(rate)
      }
    }
    return result
  }
}
