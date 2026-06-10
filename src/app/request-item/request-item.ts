import { Component, EventEmitter, input, output } from '@angular/core';
import { DatePipe, NgIf, TitleCasePipe } from '@angular/common';
import { FormatPaymentStatusPipe } from '../format-payment-status.pipe';
import { Request } from '../enrolment-queue.service';

@Component({
  selector: 'app-request-item',
  imports: [DatePipe, NgIf, TitleCasePipe, FormatPaymentStatusPipe],
  templateUrl: './request-item.html',
  styleUrl: './request-item.css',
})
export class RequestItem {
  readonly request = input<Request>();
  readonly approve = output<number>();
  readonly reject = output<number>();
  readonly view = output<number>();
}
