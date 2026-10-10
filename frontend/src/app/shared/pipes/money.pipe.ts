import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
  standalone: true
})
export class MoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showUnit = true): string {
    if (value === null || value === undefined || value === '') return '0.00' + (showUnit ? ' บาท' : '');
    const num = Number(value);
    if (isNaN(num)) return '0.00' + (showUnit ? ' บาท' : '');
    const formatted = num.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showUnit ? `${formatted} บาท` : formatted;
  }
}
