import { BacenTreasurePaper } from 'src/scripts/seed_treasure_paper/bacen_treasure_paper'

export async function downloadTreasurePapers(
  fileName: string
): Promise<string | null> {
  const paperHandler = new BacenTreasurePaper('Tesouro Selic')
  const outputPath = await paperHandler.download(fileName)
  return outputPath
}
