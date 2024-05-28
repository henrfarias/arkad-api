import { ProjectiveRate, ProjectiveRateEntity } from '../entity/projective_rate'

export interface ProjectiveRateRepository {
  save(input: ProjectiveRateEntity): Promise<void>
  getNextYears(input: InputGetNextYearsProjectiveRate): Promise<ProjectiveRate[]>
}

export interface InputGetNextYearsProjectiveRate {
  where: Partial<Pick<ProjectiveRate, 'index'>>
  howManyYears: number
}
