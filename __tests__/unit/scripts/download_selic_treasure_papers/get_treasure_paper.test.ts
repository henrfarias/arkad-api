import path from 'path'
import xlsx from 'xlsx'

describe('Script to download and persist treasure paper registers', () => {
  test('should read xlsx with 10 treasure paper registers and return 3 of selic papers', () => {
    const workbook = xlsx.readFile(
      path.join('__tests__', 'unit', 'scripts', 'mocks', 'treasure_sample.xlsx')
    )
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawContent = xlsx.utils.sheet_to_json(worksheet)
    console.log(rawContent)
  })
})
