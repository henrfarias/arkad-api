import { Readable } from 'node:stream'
import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'
import { getBrazilianTreasurePapers } from './get_treasure_papers'

export async function downloadTreasurePapers(
  fileName: string
): Promise<string | null> {
  const paperHandler = new BacenTreasurePaper('Tesouro Selic')
  const readable = new Readable({
    objectMode: true,
    read: () => {}
  })
  getBrazilianTreasurePapers({ readable, paperHandler })
  await paperHandler.download(fileName, readable)
  return 'OK'
}
