import { Component, EventEmitter, input, output } from '@angular/core';
import { DatePipe, NgIf, TitleCasePipe } from '@angular/common';
import { FormatPaymentStatusPipe } from '../format-payment-status.pipe';
import { Request } from '../queue.service';

@Component({
  selector: 'li[app-request-item]',
  imports: [DatePipe, NgIf, TitleCasePipe, FormatPaymentStatusPipe],
  templateUrl: './request-item.html',
  styleUrl: './request-item.css',
})
export class RequestItem {
  readonly request = input<Request>();
  readonly currentCollegeId = input<number>();
  readonly currentAllowedBranches = input<string[]>([]);
  readonly approve = output<number>();
  readonly reject = output<number>();

  canApprove(requestData: Request): boolean {
    return !(requestData.status !== 'pending' || requestData.collegeId !== this.currentCollegeId() || (this.currentAllowedBranches().length > 0 && !this.currentAllowedBranches().includes(requestData.branch)));
  }
  canReject(requestData: Request): boolean {
    return !(requestData.status !== 'pending' || requestData.collegeId !== this.currentCollegeId() || (this.currentAllowedBranches().length > 0 && !this.currentAllowedBranches().includes(requestData.branch)));
  }
}
