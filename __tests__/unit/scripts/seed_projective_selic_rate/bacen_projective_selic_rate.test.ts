import { Indexes } from '@domain/interfaces/entity'
import { ProjectiveRate, ProjectiveRateEntity } from '@domain/interfaces/entity/projective_rate'
import { MemoryProjectiveRateRepository } from '@test/utils/mocks/repositories/memory_projective_rate.repository'
import axios from 'axios'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { BacenProjectiveSelicRate } from 'src/scripts/projective_selic_rate/bacen_projective_selic_rate'
import { beforeEach, describe, expect, test, vi } from 'vitest'
vi.mock('axios')

describe('Bacen Projective Selic Rate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const { pathname } = new URL(import.meta.url)
  const __dirname = dirname(pathname)
  const ratePayload = [
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
  ]
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
      expect(result).toEqual(ratePayload)
    })
  })
  describe('download -> FILTER -> format -> persist', () => {
    test('should consult last date persisted and pass through only the rates after this date to each ref year', async () => {
      const expected = [
        {
          Data: '2024-05-10',
          DataReferencia: '2024',
          Indicador: 'Selic',
          Media: 9.808
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
      ]
      const result = []
      const repository = new MemoryProjectiveRateRepository()
      await repository.save({
        index: Indexes.SELIC,
        annualRate: 0.09808,
        refYear: 2025,
        calculationDate: new Date('2024-05-11')
      })
      const sut = new BacenProjectiveSelicRate(repository)
      for (const rate of ratePayload) {
        const currentRate = await sut.filter(rate)
        currentRate !== null && result.push(currentRate)
      }
      expect(result).toEqual(expected)
    })

    test('should avoid older rate when the return send same ref date but with different calculation dates', async () => {
      const ratePayload = [
        {
          Data: '2024-05-10',
          DataReferencia: '2025',
          Indicador: 'Selic',
          Media: 9.808
        },
        {
          Data: '2024-05-15',
          DataReferencia: '2025',
          Indicador: 'Selic',
          Media: 9.1091
        }
      ]
      const expected = [
        {
          Data: '2024-05-15',
          DataReferencia: '2025',
          Indicador: 'Selic',
          Media: 9.1091
        }
      ]
      const repository = new MemoryProjectiveRateRepository()
      await repository.save({
        index: Indexes.SELIC,
        annualRate: 0.09808,
        refYear: 2025,
        calculationDate: new Date('2024-05-09')
      })
      const sut = new BacenProjectiveSelicRate(repository)
      for (const rate of ratePayload) {
        await sut.filter(rate)
      }
      expect(sut.newRates).toEqual(expected)
    })
  })

  describe('download -> filter -> FORMAT -> persist', () => {
    test('should format the rate object and return the formatted object', async () => {
      const result = []
      const expected: ProjectiveRateEntity[] = [
        {
          calculationDate: new Date('2024-05-10'),
          refYear: 2024,
          index: Indexes.SELIC,
          annualRate: 0.09808
        },
        {
          calculationDate: new Date('2024-05-10'),
          refYear: 2025,
          index: Indexes.SELIC,
          annualRate: 0.091091
        },
        {
          calculationDate: new Date('2024-05-10'),
          refYear: 2026,
          index: Indexes.SELIC,
          annualRate: 0.089521
        },
        {
          calculationDate: new Date('2024-05-10'),
          refYear: 2027,
          index: Indexes.SELIC,
          annualRate: 0.088778
        },
        {
          calculationDate: new Date('2024-05-10'),
          refYear: 2028,
          index: Indexes.SELIC,
          annualRate: 0.088182
        }
      ]
      const repository = new MemoryProjectiveRateRepository()
      const sut = new BacenProjectiveSelicRate(repository)
      for (const rate of ratePayload) {
        result.push(sut.format(rate))
      }
      expect(result).toStrictEqual(expected)
    })
  })

  describe('download -> filter -> format -> PERSIST', () => {
    test('should persist the formatted rate object', async () => {
      const expected: ProjectiveRate[] = [
        {
          id: expect.any(String),
          calculationDate: new Date('2024-05-10'),
          refYear: 2024,
          index: Indexes.SELIC,
          annualRate: 0.09808
        },
        {
          id: expect.any(String),
          calculationDate: new Date('2024-05-10'),
          refYear: 2025,
          index: Indexes.SELIC,
          annualRate: 0.091091
        },
        {
          id: expect.any(String),
          calculationDate: new Date('2024-05-10'),
          refYear: 2026,
          index: Indexes.SELIC,
          annualRate: 0.089521
        },
        {
          id: expect.any(String),
          calculationDate: new Date('2024-05-10'),
          refYear: 2027,
          index: Indexes.SELIC,
          annualRate: 0.088778
        },
        {
          id: expect.any(String),
          calculationDate: new Date('2024-05-10'),
          refYear: 2028,
          index: Indexes.SELIC,
          annualRate: 0.088182
        }
      ]
      const repository = new MemoryProjectiveRateRepository()
      const sut = new BacenProjectiveSelicRate(repository)
      for (const rate of ratePayload) {
        await sut.persist(sut.format(rate))
      }
      const result = repository.projectiveRates
      expect(result).toStrictEqual(expected)
    })
  })
})
