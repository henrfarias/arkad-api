import { ProjectiveRate } from '@domain/interfaces/entity/projective_rate'
import {
  InputGetProjectiveRate,
  ProjectiveRateRepository
} from '@domain/interfaces/repositories/projective_rate.repository'

export class MemoryProjectiveRateRepository
  implements ProjectiveRateRepository
{
  get(_input: InputGetProjectiveRate): Promise<ProjectiveRate[]> {
    throw new Error('Method not implemented.')
  }
}
