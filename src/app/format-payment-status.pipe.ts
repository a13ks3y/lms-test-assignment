import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'FormatPaymentStatus',
  standalone: true,
})
export class FormatPaymentStatusPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const formatted = value.replace(/_/g, ' ').toLowerCase();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
