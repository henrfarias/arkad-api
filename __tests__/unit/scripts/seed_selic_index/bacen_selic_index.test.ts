import {
  Frequency,
  IndexEntity,
  Indexes,
  RawSelic
} from '@domain/interfaces/entity'
import { MemoryIndexRepository } from '@test/utils/mocks/repositories/memory_index.repository'
import { createReadStream } from 'fs'
import { dirname, join } from 'path'
import { BacenSelicIndex } from 'src/scripts/seed_selic_index/bacen_selic_index'
import { GetSelicRatesFromStream } from 'src/scripts/seed_selic_index/get_selic_rates_from_stream'
import { beforeAll, describe, expect, test, vi } from 'vitest'
import { jsonStream } from '@framework/libs/stream-json'
import axios from 'axios'
import logger from '@common/logger'
vi.mock('axios')

describe('Script to download, format and persist selic index registers as "Bacen Selic Index"', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-04-15T10:00:00Z'))
  })
  const { pathname } = new URL(import.meta.url)
  const __dirname = dirname(pathname)

  describe('DOWNLOAD -> format -> persist', () => {
    test('should do download with all rates since 31/12/2004 when does not have anyone selic rate persisted', async () => {
      const endpoint = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados'
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'json',
          'selic_daily.json'
        )
      )
      const repository = new MemoryIndexRepository()
      const sut = new BacenSelicIndex(repository)
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

    test('should do download to rates since 30/04/2010 when does have selic rate persisted', async () => {
      const endpoint = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados'
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'json',
          'selic_daily.json'
        )
      )
      const repository = new MemoryIndexRepository()
      repository.save({
        index: Indexes.SELIC,
        rate: 0.00043,
        frequency: Frequency.DAILY,
        refDate: new Date('2010-04-30T03:00:00Z')
      })
      repository.save({
        index: Indexes.SELIC,
        rate: 0.00043,
        frequency: Frequency.DAILY,
        refDate: new Date('2010-04-29T03:00:00Z')
      })
      const sut = new BacenSelicIndex(repository)
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

  describe('download -> FORMAT -> persist', () => {
    const selicRates: {
      input: RawSelic
      expected: Pick<IndexEntity, 'rate' | 'refDate'>
    }[] = [
      {
        input: {
          data: '29/11/2023',
          valor: '0.045513'
        },
        expected: {
          refDate: new Date('2023-11-29T03:00:00Z'),
          rate: 0.00045513
        }
      },
      {
        input: {
          data: '31/01/2024',
          valor: '0.043739'
        },
        expected: {
          refDate: new Date('2024-01-31T03:00:00Z'),
          rate: 0.00043739
        }
      },
      {
        input: {
          data: '15/02/2024',
          valor: '0.041957'
        },
        expected: {
          refDate: new Date('2024-02-15T03:00:00Z'),
          rate: 0.00041957
        }
      },
      {
        input: {
          data: '23/04/2024',
          valor: '0.040168'
        },
        expected: {
          refDate: new Date('2024-04-23T03:00:00Z'),
          rate: 0.00040168
        }
      }
    ]
    test.each(selicRates)(
      'should format $input.data as $expected.refDate and $input.valor as $expected.rate',
      ({ input, expected }) => {
        const repository = new MemoryIndexRepository()
        const sut = new BacenSelicIndex(repository)
        const result = sut.format(input, Frequency.DAILY)
        logger.info(result)
        expect(result).toStrictEqual({
          index: 'selic',
          rate: expected.rate,
          refDate: expected.refDate,
          frequency: Frequency.DAILY
        })
      }
    )
  })

  describe.todo('download -> format -> PERSIST')

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
          'selic_daily.json'
        )
      )
      const indexRepository = new MemoryIndexRepository()
      const selicHandler = new BacenSelicIndex(indexRepository)
      const sut = new GetSelicRatesFromStream(
        mockStream,
        jsonStream,
        selicHandler
      )
      const persistSpy = vi.spyOn(selicHandler, 'persist')
      await sut.execute()
      sut.done()
      expect(persistSpy).toBeCalledTimes(100)
    })
  })
})
