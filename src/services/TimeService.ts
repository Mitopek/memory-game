export class TimeService {
  formatTime(value: number): string {
    if(value < 10) {
      return `0${value}`
    }
    return `${value}`
  }

  getFormattedDateTextFromIsoString(isoString: string): string {
    const date = new Date(isoString)
    return `${this.formatTime(date.getDate())}.${this.formatTime(date.getMonth() + 1)}.${date.getFullYear()} ${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}`
  }
}