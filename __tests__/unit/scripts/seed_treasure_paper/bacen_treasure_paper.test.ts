import { csvStream } from '@framework/libs/fast-csv'
import {
  RawTreasure,
  TreasurePaper
} from '@domain/interfaces/entity/treasure_paper'
import { TreasurePaperRepository } from '@domain/interfaces/repositories/treasure_paper.repository'
import { MemoryTreasurePaperRepository } from '@test/utils/mocks/repositories/memory_treasure_paper.repository'
import { waitStream } from '__tests__/utils/wait_stream'
import { createReadStream } from 'fs'
import { dirname, join } from 'path'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'
import { GetTreasurePapersFromStream } from 'src/scripts/seed_treasure_paper/get_treasure_papers_from_stream'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Indexes } from '@domain/interfaces/entity'
import axios from 'axios'

describe('Script to download, filter, format and persist treasure paper registers as "Tesouro Selic"', () => {
  const readStream: RawTreasure[] = [
    {
      'Tipo Titulo': 'Tesouro Prefixado com Juros Semestrais',
      'Data Vencimento': '01/01/2017',
      'Data Base': '23/11/2009',
      'Taxa Compra Manha': '13.14',
      'Taxa Venda Manha': '13.2',
      'PU Compra Manha': '903.23',
      'PU Venda Manha': '900.88',
      'PU Base Manha': '900.44'
    },
    {
      'Tipo Titulo': 'Tesouro Prefixado com Juros Semestrais',
      'Data Vencimento': '01/01/2010',
      'Data Base': '23/11/2009',
      'Taxa Compra Manha': '8.64',
      'Taxa Venda Manha': '8.67',
      'PU Compra Manha': '1039.53',
      'PU Venda Manha': '1039.5',
      'PU Base Manha': '1039.16'
    },
    {
      'Tipo Titulo': 'Tesouro Selic',
      'Data Vencimento': '16/03/2011',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '0',
      'Taxa Venda Manha': '0.02',
      'PU Compra Manha': '4061.28',
      'PU Venda Manha': '4060.22',
      'PU Base Manha': '4058.87'
    },
    {
      'Tipo Titulo': 'Tesouro Selic',
      'Data Vencimento': '17/03/2010',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '0',
      'Taxa Venda Manha': '0.01',
      'PU Compra Manha': '4061.28',
      'PU Venda Manha': '4061.16',
      'PU Base Manha': '4059.8'
    },
    {
      'Tipo Titulo': 'Tesouro Selic',
      'Data Vencimento': '07/03/2012',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '0',
      'Taxa Venda Manha': '0.03',
      'PU Compra Manha': '4061.28',
      'PU Venda Manha': '4058.5',
      'PU Base Manha': '4057.15'
    },
    {
      'Tipo Titulo': 'Tesouro Prefixado',
      'Data Vencimento': '01/01/2012',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '11.69',
      'Taxa Venda Manha': '11.75',
      'PU Compra Manha': '792.53',
      'PU Venda Manha': '791.63',
      'PU Base Manha': '791.28'
    },
    {
      'Tipo Titulo': 'Tesouro Prefixado',
      'Data Vencimento': '01/01/2010',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '8.64',
      'Taxa Venda Manha': '8.67',
      'PU Compra Manha': '990.83',
      'PU Venda Manha': '990.8',
      'PU Base Manha': '990.47'
    },
    {
      'Tipo Titulo': 'Tesouro IPCA+ com Juros Semestrais',
      'Data Vencimento': '15/05/2017',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '6.75',
      'Taxa Venda Manha': '6.81',
      'PU Compra Manha': '1782.13',
      'PU Venda Manha': '1776.05',
      'PU Base Manha': '1775.02'
    },
    {
      'Tipo Titulo': 'Tesouro IPCA+ com Juros Semestrais',
      'Data Vencimento': '15/05/2015',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '6.77',
      'Taxa Venda Manha': '6.83',
      'PU Compra Manha': '1797.05',
      'PU Venda Manha': '1792.28',
      'PU Base Manha': '1791.24'
    },
    {
      'Tipo Titulo': 'Tesouro IPCA+',
      'Data Vencimento': '15/08/2024',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '6.53',
      'Taxa Venda Manha': '6.61',
      'PU Compra Manha': '733.38',
      'PU Venda Manha': '725.34',
      'PU Base Manha': '724.92'
    },
    {
      'Tipo Titulo': 'Tesouro IPCA+',
      'Data Vencimento': '15/05/2015',
      'Data Base': '20/11/2009',
      'Taxa Compra Manha': '6.82',
      'Taxa Venda Manha': '6.88',
      'PU Compra Manha': '1294.23',
      'PU Venda Manha': '1290.26',
      'PU Base Manha': '1289.51'
    }
  ]
  const { pathname } = new URL(import.meta.url)
  const __dirname = dirname(pathname)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DOWNLOAD -> filter -> format -> persist', () => {
    test('should do download of treasure paper csv', async () => {
      const endpoint =
        'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'csv',
          'treasure_sample.csv'
        )
      )
      const repository = new MemoryTreasurePaperRepository()
      const sut = new BacenTreasurePaper('Tesouro Direto', repository)
      const getSpy = vi.spyOn(axios, 'get')
      getSpy.mockResolvedValue({ data: mockStream })
      await sut.download()
      expect(getSpy).toHaveBeenCalledWith(endpoint, {
        responseType: 'stream'
      })
    })
  })
  describe('download -> FILTER -> format -> persist', () => {
    test('should return a list of "Tesouro Selic" treasure papers', async () => {
      const repository: TreasurePaperRepository =
        new MemoryTreasurePaperRepository()
      const sut = new BacenTreasurePaper('Tesouro Selic', repository)
      const treasures: RawTreasure[] = readStream
      const expected: RawTreasure[] = [
        {
          'Tipo Titulo': 'Tesouro Selic',
          'Data Vencimento': '16/03/2011',
          'Data Base': '20/11/2009',
          'Taxa Compra Manha': '0',
          'Taxa Venda Manha': '0.02',
          'PU Compra Manha': '4061.28',
          'PU Venda Manha': '4060.22',
          'PU Base Manha': '4058.87'
        },
        {
          'Tipo Titulo': 'Tesouro Selic',
          'Data Vencimento': '17/03/2010',
          'Data Base': '20/11/2009',
          'Taxa Compra Manha': '0',
          'Taxa Venda Manha': '0.01',
          'PU Compra Manha': '4061.28',
          'PU Venda Manha': '4061.16',
          'PU Base Manha': '4059.8'
        },
        {
          'Tipo Titulo': 'Tesouro Selic',
          'Data Vencimento': '07/03/2012',
          'Data Base': '20/11/2009',
          'Taxa Compra Manha': '0',
          'Taxa Venda Manha': '0.03',
          'PU Compra Manha': '4061.28',
          'PU Venda Manha': '4058.5',
          'PU Base Manha': '4057.15'
        }
      ]
      const result: RawTreasure[] = []
      for (const treasure of treasures) {
        if (await sut.filter(treasure)) {
          expect(treasure['Tipo Titulo']).toBe('Tesouro Selic')
          result.push(treasure)
        }
      }
      expect(result).toStrictEqual(expected)
      expect.assertions(4)
    })
  })
  describe('download -> filter -> FORMAT -> persist', () => {
    test('should format the treasure paper to a new format', () => {
      const repository: TreasurePaperRepository =
        new MemoryTreasurePaperRepository()
      const sut = new BacenTreasurePaper('Tesouro Selic', repository)
      const treasure: RawTreasure = {
        'Tipo Titulo': 'Tesouro Selic',
        'Data Vencimento': '01/03/2029',
        'Data Base': '13/03/2024',
        'Taxa Compra Manha': '0.15',
        'Taxa Venda Manha': '0.17',
        'PU Compra Manha': '14473,14',
        'PU Venda Manha': '14459,8',
        'PU Base Manha': '14459,8'
      }
      const expected: TreasurePaper = {
        title: 'Tesouro Selic 2029',
        refDate: new Date('2024-03-13T03:00:00Z'), // '13/03/2024'
        dueDate: new Date('2029-03-01T03:00:00Z'), // '01/03/2029'
        index: Indexes.SELIC,
        purchaseFee: 0.0015,
        purchasePrice: 1447314,
        salePrice: 1445980
      }
      const result = sut.parse(treasure)
      expect(result).toStrictEqual(expected)
    })
  })

  describe('all flow', () => {
    test('should pass data from csv through the stream filtering each row', async () => {
      const mockStream = createReadStream(
        join(
          __dirname,
          '..',
          '..',
          '..',
          'utils',
          'mocks',
          'csv',
          'treasure_sample.csv'
        )
      )
      const repository = new MemoryTreasurePaperRepository()
      repository.save({
        title: 'Tesouro Selic 2006',
        index: Indexes.SELIC,
        dueDate: new Date('2006-01-18T03:00:00Z'),
        refDate: new Date('2005-10-31T03:00:00Z'),
        purchaseFee: 0.0002,
        purchasePrice: 249757,
        salePrice: 249752
      })
      repository.save({
        title: 'Tesouro Selic 2006',
        index: Indexes.SELIC,
        dueDate: new Date('2006-01-18T03:00:00Z'),
        refDate: new Date('2005-10-30T03:00:00Z'),
        purchaseFee: 0.0002,
        purchasePrice: 249757,
        salePrice: 249752
      })
      const treasureHandler = new BacenTreasurePaper(
        'Tesouro Selic',
        repository
      )
      const filterSpy = vi.spyOn(treasureHandler, 'filter')
      const parseSpy = vi.spyOn(treasureHandler, 'parse')
      const persistSpy = vi.spyOn(treasureHandler, 'persist')
      const sut = new GetTreasurePapersFromStream(
        mockStream,
        csvStream,
        treasureHandler
      )
      const result = await sut.execute()
      await waitStream(25)
      sut.done()
      expect(result).toBe(undefined)
      expect(filterSpy).toHaveBeenCalledTimes(100)
      // 13 "Tesouro Selic registers"
      expect(parseSpy).toHaveBeenCalledTimes(9)
      expect(persistSpy).toHaveBeenCalledTimes(9)
      expect.assertions(4)
    })
  })
})
