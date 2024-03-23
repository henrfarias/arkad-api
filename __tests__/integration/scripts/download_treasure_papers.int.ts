import { downloadTreasurePapers } from 'src/scripts/seed_treasure_paper/download_treasure_papers'
import { jest } from '@jest/globals'
jest.setTimeout(60000)

describe('download_treasure_papers', () => {
  test('should download the file from the website', async () => {
    // Arrange
    const fileName = 'test.csv'
    // Act
    const result = await downloadTreasurePapers(fileName)
    // Assert
    expect(result).toEqual(expect.stringMatching(/\/temp\/test\.csv/))
  })
})
