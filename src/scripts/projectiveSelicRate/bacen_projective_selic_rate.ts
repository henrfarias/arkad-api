import { Indexes } from '@domain/interfaces/entity'
import {
  ProjectiveRate,
  ProjectiveRateEntity,
  RawProjectiveSelicRate
} from '@domain/interfaces/entity/projective_rate'
import { ProjectiveRateRepository } from '@domain/interfaces/repositories/projective_rate.repository'
import axios from 'axios'

export class BacenProjectiveSelicRate {
  protected currentRates: ProjectiveRate[] | null = null
  readonly newRates: RawProjectiveSelicRate[] = []
  constructor(private repository: ProjectiveRateRepository) {}

  async download(): Promise<RawProjectiveSelicRate[]> {
    const endpoint =
      'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$top=5&$filter=Indicador%20eq%20%27Selic%27&$orderby=Data%20desc&$format=json&$select=Indicador,Data,DataReferencia,Media'
    const result = await axios.get<{
      ['@odata.context']: string
      value: RawProjectiveSelicRate[]
    }>(endpoint)
    return result.data.value
  }
  public async filter(input: RawProjectiveSelicRate): Promise<RawProjectiveSelicRate | null> {
    if (this.currentRates === null) {
      this.currentRates = await this.repository.getNextYears({
        howManyYears: 5,
        where: { index: Indexes.SELIC }
      })
    }
    const currentRateIndex = this.currentRates.findIndex(
      (rate) => rate.refYear === Number(input.DataReferencia)
    )
    if (
      currentRateIndex !== -1 &&
      this.currentRates[currentRateIndex].calculationDate.getTime() > new Date(input.Data).getTime()
    ) {
      return null
    }
    const newRateJustObtainedIndex = this.newRates.findIndex(
      (rate) => rate.DataReferencia === input.DataReferencia
    )
    if (newRateJustObtainedIndex !== -1) {
      const newRateJustObtainedValue = Number(
        this.newRates[newRateJustObtainedIndex].Data.replace(/-/g, '')
      )
      const inputValue = Number(input.Data.replace(/-/g, ''))
      const inputGreatherThanNewRate = inputValue > newRateJustObtainedValue
      if (!inputGreatherThanNewRate) {
        return null
      }
      this.newRates.splice(newRateJustObtainedIndex, 1)
    }
    this.newRates.push(input)
    return input
  }
  public format(input: RawProjectiveSelicRate): ProjectiveRateEntity {
    return {
      calculationDate: new Date(input.Data),
      annualRate: Number((input.Media / 100).toFixed(8)),
      index: Indexes.SELIC,
      refYear: Number(input.DataReferencia)
    }
  }
  public async persist(input: ProjectiveRateEntity): Promise<void> {
    await this.repository.save(input)
    return
  }
}
