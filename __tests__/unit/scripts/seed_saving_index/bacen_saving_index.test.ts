import {
  Frequency,
  IndexEntity,
  Indexes,
  RawSaving
} from '@domain/interfaces/entity'
import { MemoryIndexRepository } from '@test/utils/mocks/repositories/memory_index.repository'
import { createReadStream } from 'fs'
import { dirname, join } from 'path'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { jsonStream } from '@framework/libs/stream-json'
import axios from 'axios'
import logger from '@common/logger'
import { beforeEach } from 'node:test'
import { BacenSavingIndex } from 'src/scripts/seed_poup_index/bacen_saving_index'
import { GetSavingRatesFromStream } from 'src/scripts/seed_poup_index/get_saving_rates_from_stream'
vi.mock('axios')

describe('Script to download, format and persist saving index registers as "Bacen Saving Index"', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-04-15T10:00:00Z'))
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const { pathname } = new URL(import.meta.url)
  const __dirname = dirname(pathname)

  describe('DOWNLOAD -> filter -> format -> persist', () => {
    test('should do download with all rates since 31/12/2004 when does not have anyone saving rate persisted', async () => {
      const endpoint = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.25/dados'
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'json',
          'saving_daily.json'
        )
      )
      const repository = new MemoryIndexRepository()
      const sut = new BacenSavingIndex(repository)
      const getSpy = vi.spyOn(axios, 'get')
      getSpy.mockResolvedValue({ data: mockStream })
      await sut.download()
      expect(getSpy).toHaveBeenCalledWith(
        endpoint.concat(
          '?formato=json&dataInicial=31/12/2004&dataFinal=15/04/2024'
        ),
        {
          responseType: 'stream'
        }
      )
    })

    test('should do download to rates since 30/04/2010 when does have saving rate persisted', async () => {
      const endpoint = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.25/dados'
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'json',
          'saving_daily.json'
        )
      )
      const repository = new MemoryIndexRepository()
      repository.save({
        index: Indexes.SAVING,
        rate: 0.00043,
        frequency: Frequency.DAILY,
        refDate: new Date('2010-04-30T03:00:00Z')
      })
      repository.save({
        index: Indexes.SAVING,
        rate: 0.00043,
        frequency: Frequency.DAILY,
        refDate: new Date('2010-04-29T03:00:00Z')
      })
      const sut = new BacenSavingIndex(repository)
      const getSpy = vi.spyOn(axios, 'get')
      getSpy.mockResolvedValue({ data: mockStream })
      await sut.download()
      expect(getSpy).toHaveBeenCalledWith(
        endpoint.concat(
          '?formato=json&dataInicial=01/05/2010&dataFinal=15/04/2024'
        ),
        {
          responseType: 'stream'
        }
      )
    })
  })

  describe('download -> filter -> FORMAT -> persist', () => {
    const savingRates: {
      input: RawSaving
      expected: Pick<IndexEntity, 'rate' | 'refDate'>
    }[] = [
      {
        input: {
          data: '01/11/2023',
          datafim: '01/12/2023',
          valor: '0.045513'
        },
        expected: {
          refDate: new Date('2023-11-01T03:00:00Z'),
          rate: 0.00045513
        }
      },
      {
        input: {
          data: '01/01/2024',
          datafim: '01/02/2024',
          valor: '0.043739'
        },
        expected: {
          refDate: new Date('2024-01-01T03:00:00Z'),
          rate: 0.00043739
        }
      },
      {
        input: {
          data: '01/02/2024',
          datafim: '01/03/2024',
          valor: '0.041957'
        },
        expected: {
          refDate: new Date('2024-02-01T03:00:00Z'),
          rate: 0.00041957
        }
      },
      {
        input: {
          data: '01/04/2024',
          datafim: '01/05/2024',
          valor: '0.040168'
        },
        expected: {
          refDate: new Date('2024-04-01T03:00:00Z'),
          rate: 0.00040168
        }
      }
    ]
    test.each(savingRates)(
      'should format $input.data as $expected.refDate and $input.valor as $expected.rate',
      ({ input, expected }) => {
        const repository = new MemoryIndexRepository()
        const sut = new BacenSavingIndex(repository)
        const result = sut.format(input, Frequency.DAILY)
        logger.info(result)
        expect(result).toStrictEqual({
          index: 'poup',
          rate: expected.rate,
          refDate: expected.refDate,
          frequency: Frequency.DAILY
        })
      }
    )
  })

  describe.todo('download -> filter -> format -> PERSIST')

  describe('all flow', () => {
    test('should pass through all flow', async () => {
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'json',
          'saving_daily.json'
        )
      )
      const indexRepository = new MemoryIndexRepository()
      indexRepository.save({
        frequency: Frequency.DAILY,
        index: Indexes.SAVING,
        rate: 0.00045513,
        refDate: new Date('2023-11-20')
      })
      vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockStream })
      const savingHandler = new BacenSavingIndex(indexRepository)
      const sut = new GetSavingRatesFromStream(
        await savingHandler.download(),
        jsonStream,
        savingHandler
      )
      const persistSpy = vi.spyOn(savingHandler, 'persist')
      await sut.execute()
      sut.done()
      expect(persistSpy).toBeCalledTimes(5)
    })
  })
})
