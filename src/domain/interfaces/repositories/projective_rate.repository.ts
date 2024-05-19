import { ProjectiveRate } from '../entity/projective_rate'

export interface ProjectiveRateRepository {
  get(input: InputGetProjectiveRate): Promise<ProjectiveRate[]>
}

export interface InputGetProjectiveRate {
  where: Partial<Pick<ProjectiveRate, 'index' | 'refYear' | 'calculationDate'>>
  orderby: {
    [key in keyof Partial<
      Pick<ProjectiveRate, 'calculationDate' | 'refYear'>
    >]: 'asc' | 'desc'
  }
}
