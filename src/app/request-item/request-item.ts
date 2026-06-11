import { Component, EventEmitter, input, output, inject } from '@angular/core';
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

  constructor() {
    this.userService.loadUsers();
  }

  private canManageRequest(
    request: Request,
    permission: string
  ): boolean {
    const user = this.userService.user();
    console.log(!user ? '😭' : '😮');
    console.log(user, user?.name);
    console.log(user?.collegeId, request.collegeId);
    const hasPermission =
      user?.permissions.includes(permission) ?? false;

    const isPending =
      request.status === 'pending';

    const isCurrentCollege =
      request.collegeId === request.collegeId;

    const isAllowedBranch =
      user?.allowedBranches.length === 0 ||
      (user?.allowedBranches.includes(request.branch) ?? false);
    console.log({
      isPending,hasPermission,isCurrentCollege,isAllowedBranch
    });
    return (
      isPending &&
      hasPermission &&
      isCurrentCollege &&
      isAllowedBranch
    );
  }

  currentCollegeId():number {
    return this.userService.user()?.collegeId ?? -1;
  }

  canApprove(request: Request): boolean {
    return this.canManageRequest(
      request,
      'enroll_requests_approve'
    );
  }

  canReject(request: Request): boolean {
    return this.canManageRequest(
      request,
      'enroll_requests_reject'
    );
  }
}
