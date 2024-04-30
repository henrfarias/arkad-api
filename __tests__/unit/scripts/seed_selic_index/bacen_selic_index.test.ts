import { Frequency, IndexEntity, RawSelic } from '@domain/interfaces/entity'
import { MemoryIndexRepository } from '@test/utils/mocks/repositories/memory_index.repository'
import { createReadStream } from 'fs'
import { dirname, join } from 'path'
import { BacenSelicIndex } from 'src/scripts/seed_selic_index/bacen_selic_index'
import { GetSelicRatesFromStream } from 'src/scripts/seed_selic_index/get_selic_rates_from_stream'
import { describe, expect, test, vi } from 'vitest'
import { jsonStream } from '@framework/libs/stream-json'

describe('Script to download, format and persist selic index registers as "Bacen Selic Index"', () => {
  const { pathname } = new URL(import.meta.url)
  const __dirname = dirname(pathname)

  const selicRates: {
    input: RawSelic
    expected: Pick<IndexEntity, 'rate' | 'refDate'>
  }[] = [
    {
      input: {
        data: '29/11/2023',
        valor: '0.045513'
      },
      expected: { refDate: new Date('2023-11-29'), rate: 0.00045513 }
    },
    {
      input: {
        data: '31/01/2024',
        valor: '0.043739'
      },
      expected: { refDate: new Date('2024-01-31'), rate: 0.00043739 }
    },
    {
      input: {
        data: '15/02/2024',
        valor: '0.041957'
      },
      expected: { refDate: new Date('2024-02-15'), rate: 0.00041957 }
    },
    {
      input: {
        data: '23/04/2024',
        valor: '0.040168'
      },
      expected: { refDate: new Date('2024-04-23'), rate: 0.00040168 }
    }
  ]
  test.each(selicRates)(
    'should format $input.data as $expected.refDate and $input.valor as $expected.rate',
    ({ input, expected }) => {
      const repository = new MemoryIndexRepository()
      const sut = new BacenSelicIndex(repository)
      const result = sut.format(input, Frequency.DAILY)
      expect(result).toStrictEqual({
        index: 'selic',
        rate: expected.rate,
        refDate: expected.refDate,
        frequency: Frequency.DAILY
      })
    }
  )

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
