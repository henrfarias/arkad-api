import { MemoryProjectiveRateRepository } from '@test/utils/mocks/repositories/memory_projective_rate.repository'
import axios from 'axios'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { BacenProjectiveSelicRate } from 'src/scripts/projectiveSelicRate/bacen_projective_selic_rate'
import { beforeEach, describe, expect, test, vi } from 'vitest'
vi.mock('axios')

describe('Bacen Projective Selic Rate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const { pathname } = new URL(import.meta.url)
  const __dirname = dirname(pathname)
  describe('DOWNLOAD -> filter -> format -> persist', () => {
    test('should do download and return only the rate object values (ignore all other fields)', async () => {
      const repository = new MemoryProjectiveRateRepository()
      const sut = new BacenProjectiveSelicRate(repository)
      const jsonPath = join(
        __dirname,
        '..',
        '..',
        '..',
        'utils',
        'mocks',
        'json',
        'projective_rate.json'
      )
      vi.spyOn(axios, 'get').mockResolvedValue({
        data: JSON.parse(readFileSync(jsonPath).toString())
      })
      const result = await sut.download()
      expect(result).toEqual([
        {
          Data: '2024-05-10',
          DataReferencia: '2024',
          Indicador: 'Selic',
          Media: 9.808
        },
        {
          Data: '2024-05-10',
          DataReferencia: '2025',
          Indicador: 'Selic',
          Media: 9.1091
        },
        {
          Data: '2024-05-10',
          DataReferencia: '2026',
          Indicador: 'Selic',
          Media: 8.9521
        },
        {
          Data: '2024-05-10',
          DataReferencia: '2027',
          Indicador: 'Selic',
          Media: 8.8778
        },
        {
          Data: '2024-05-10',
          DataReferencia: '2028',
          Indicador: 'Selic',
          Media: 8.8182
        }
      ])
    })
  })
})
