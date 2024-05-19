import { RawProjectiveSelicRate } from '@domain/interfaces/entity/projective_rate'
import { ProjectiveRateRepository } from '@domain/interfaces/repositories/projective_rate.repository'
import axios from 'axios'

export class BacenProjectiveSelicRate {
  constructor(private repository: ProjectiveRateRepository) {}

  async download(): Promise<RawProjectiveSelicRate[]> {
    // download das 5 últimas taxas
    const endpoint =
      'https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$top=5&$filter=Indicador%20eq%20%27Selic%27&$orderby=Data%20desc&$format=json&$select=Indicador,Data,DataReferencia,Media'
    const result = await axios.get<{
      ['@odata.context']: string
      value: RawProjectiveSelicRate[]
    }>(endpoint)
    return result.data.value
  }
  filter() {
    // Comparar com as taxas já persistidas e passar apenas a mais atual do ano de referência
    throw new Error('Method not implemented.')
  }
  format() {
    // formatar a taxa para o formato da interface
    throw new Error('Method not implemented.')
  }
  persist() {
    // persistir a taxa formatada
    throw new Error('Method not implemented.')
  }
}
