import precise from '@shared/helpers/precise'
import IDateService from '@domain/interface/date-service'

export default class DateService implements IDateService {
  readonly YEAR_IN_MILISECONDS: number
  readonly MONTHS_IN_ONE_YEAR: number

  constructor(readonly startDate: Date, readonly endDate: Date) {
    this.YEAR_IN_MILISECONDS = 3.17098 * 10 ** -11
    this.MONTHS_IN_ONE_YEAR = 12
  }

  public timeInYears(): number {
    const timeInMiliseconds = this.endDate.getTime() - this.startDate.getTime()
    const timeInYears = precise(timeInMiliseconds * this.YEAR_IN_MILISECONDS, 2)
    return timeInYears
  }

  public timeInMonths(): number {
    const timeInMonths = this.timeInYears() * this.MONTHS_IN_ONE_YEAR
    return timeInMonths
  }

  public isInvalidRangeOfDate(): boolean {
    const dateDiff = this.endDate.getTime() - this.startDate.getTime()
    return dateDiff < 0
  }
}
