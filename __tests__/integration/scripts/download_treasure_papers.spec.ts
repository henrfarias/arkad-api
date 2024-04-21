import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'
import { getBrazilianTreasurePapers } from 'src/scripts/seed_treasure_paper/get_treasure_papers_from_file'
import { describe, test } from 'vitest'

describe('download_treasure_papers', () => {
  test('should download the file from the website passing through the pipeline', async () => {
    const treasureHandler = new BacenTreasurePaper('Tesouro Selic')
    await getBrazilianTreasurePapers(
      treasureHandler,
      await treasureHandler.download()
    )
  }, 60000)
})
