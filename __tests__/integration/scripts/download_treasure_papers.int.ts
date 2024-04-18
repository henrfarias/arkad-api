import { jest } from '@jest/globals'
import { getBrazilianTreasurePapers } from 'src/scripts/seed_treasure_paper/get_treasure_papers_from_file'
jest.setTimeout(60000)

describe('download_treasure_papers', () => {
  test('should download the file from the website passing through the pipeline', async () => {
    await getBrazilianTreasurePapers()
  })
})
