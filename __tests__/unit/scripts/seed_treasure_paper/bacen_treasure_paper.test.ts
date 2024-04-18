import {
  TreasurePaper,
  RawTreasure
} from 'src/common/interfaces/treasure_paper'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

describe('Script to download, filter, format and persist treasure paper registers as "Tesouro Selic"', () => {
  const sut = new BacenTreasurePaper('Tesouro Selic')
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
  describe('readStream -> FILTER -> format -> persist', () => {
    test('should return a list of "Tesouro Selic" treasure papers', () => {
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
      treasures.forEach((treasure) => {
        if (sut.filter(treasure)) {
          expect(treasure['Tipo Titulo']).toBe('Tesouro Selic')
          result.push(treasure)
        }
      })
      expect(result).toStrictEqual(expected)
      expect.assertions(4)
    })
  })
  describe('readStream -> filter -> FORMAT -> persist', () => {
    test('should format the treasure paper to a new format', () => {
      const treasure: RawTreasure = {
        'Tipo Titulo': 'Tesouro Selic',
        'Data Vencimento': '01/03/2029',
        'Data Base': '13/03/2024',
        'Taxa Compra Manha': '0.15',
        'Taxa Venda Manha': '0.17',
        'PU Compra Manha': '14473.14',
        'PU Venda Manha': '14459.8',
        'PU Base Manha': '14459.8'
      }
      const expected: TreasurePaper = {
        titulo: 'Tesouro Selic 2029',
        data_ref: new Date('2024-03-13T03:00:00Z'), // '13/03/2024'
        vencimento: new Date('2029-03-01T03:00:00Z'), // '01/03/2029'
        indice: 'selic',
        taxa_compra: 0.0015,
        pu_compra: 1447314,
        pu_venda: 1445980
      }
      const result = sut.parse(treasure)
      expect(result).toStrictEqual(expected)
    })
  })
})
