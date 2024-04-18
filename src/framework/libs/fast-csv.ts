import * as csv from 'fast-csv'

const csvConfig = { delimiter: ';', headers: true, objectMode: false }

export const csvStream = csv.parse(csvConfig)
