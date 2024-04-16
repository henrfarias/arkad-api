import { downloadTreasurePapers } from 'src/scripts/seed_treasure_paper/download_treasure_papers'
import { jest } from '@jest/globals'
jest.setTimeout(65000)

describe('download_treasure_papers', () => {
  test('should download the file from the website', async () => {
    // Arrange
    const fileName =
      'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'
    // Act
    const result = await downloadTreasurePapers(fileName)
    // Assert
    expect(result).toEqual(expect.stringMatching('OK'))
  })
})
