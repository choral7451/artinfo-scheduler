export class UtilDate {
  static logFormattedTime(): string {
    const koreanTime = new Date();

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    } as Intl.DateTimeFormatOptions;

    return koreanTime.toLocaleDateString('en-US', options);
  }
}
