import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiDate',
  standalone: true
})
export class ThaiDatePipe implements PipeTransform {
  private thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  transform(value: string | Date | null | undefined): string {
    if (!value) return '-';
    let date: Date;
    if (typeof value === 'string') {
      const parts = value.slice(0, 10).split('-');
      if (parts.length === 3) {
        date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        date = new Date(value);
      }
    } else {
      date = value;
    }

    if (isNaN(date.getTime())) return '-';

    const day = date.getDate();
    const month = this.thaiMonthsShort[date.getMonth()];
    const yearBe = date.getFullYear() + 543;

    return `${day} ${month} ${yearBe}`;
  }
}
