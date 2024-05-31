import { Controller } from '@domain/controller'
import { BacenProjectiveSelicRate } from './bacen_projective_selic_rate'
import logger from '@common/logger'

export class GetProjectiveSelicRate extends Controller {
  constructor(private handler: BacenProjectiveSelicRate) {
    super()
  }

  async execute(): Promise<void> {
    let count = 0
    const rates = await this.handler.download()
    for (const rate of rates) {
      const filteredRate = await this.handler.filter(rate)
      if (filteredRate) {
        count++
        const formattedRate = this.handler.format(filteredRate)
        await this.handler.persist(formattedRate)
        logger.debug('New projective rate:', formattedRate)
      }
    }
    logger.info(`New projective rates: ${count}`)
  }

  done(): void {
    throw new Error('Method not implemented.')
  }
}
