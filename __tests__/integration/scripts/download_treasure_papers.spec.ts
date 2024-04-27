import { csvStream } from '@framework/libs/fast-csv'
import { PrismaTreasurePaperRepository } from '@framework/repositories/prisma_treasure_paper.repository'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'
import { GetTreasurePapersFromStream } from 'src/scripts/seed_treasure_paper/get_treasure_papers_from_stream'
import { describe, test } from 'vitest'

describe('download_treasure_papers', () => {
  test('should download the file from the website passing through the pipeline', async () => {
    const repository = new PrismaTreasurePaperRepository()
    const treasureHandler = new BacenTreasurePaper('Tesouro Selic', repository)
    const getBrazilianTreasurePapers = new GetTreasurePapersFromStream(
      await treasureHandler.download(),
      csvStream,
      treasureHandler
    )
    await getBrazilianTreasurePapers.execute()
  }, 60000)
})
