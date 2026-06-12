import { Component, EventEmitter, input, output, inject, signal, computed } from '@angular/core';
import { DatePipe, NgIf, TitleCasePipe } from '@angular/common';
import { FormatPaymentStatusPipe } from '../format-payment-status.pipe';
import { Request } from '../queue.service';
import { UserService } from '../user.service';

@Component({
  selector: 'li[app-request-item]',
  imports: [DatePipe, NgIf, TitleCasePipe, FormatPaymentStatusPipe],
  templateUrl: './request-item.html',
  styleUrl: './request-item.css',
})
export class RequestItem {
  readonly userService = inject(UserService);
  readonly request = input<Request>();
  readonly approve = output<number>();
  readonly reject = output<number>();

  readonly requestState = computed(() => {
    const request = this.request();
    const user = this.userService.user();

    if (!request || !user) {
      return {
        isPending: false,
        hasPermission: false,
        isCurrentCollege: false,
        isAllowedBranch: false,
      };
    }
    const hasApprovePermission = user.permissions.includes('enroll_requests_approve');
    const hasRejectPermission = user.permissions.includes('enroll_requests_reject');
    return {
      isPending: request.status === 'pending',

      isCurrentCollege:
        request.collegeId === user.collegeId,

      isAllowedBranch:
        user.allowedBranches.length === 0 ||
        user.allowedBranches.includes(request.branch),

      hasApprovePermission,
      hasRejectPermission,
      hasPermission: hasApprovePermission || hasRejectPermission
    };
  });

  readonly canApprove = computed(() => {
    const state = this.requestState();

    return (
      state.isPending &&
      state.isCurrentCollege &&
      state.isAllowedBranch &&
      state.hasApprovePermission
    );
  });
  readonly canReject = computed(() => {
    const state = this.requestState();

    return (
      state.isPending &&
      state.isCurrentCollege &&
      state.isAllowedBranch &&
      state.hasRejectPermission
    );
  });
}
