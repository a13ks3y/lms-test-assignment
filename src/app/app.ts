import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { EnrolmentQueueService } from './enrolment-queue.service';
import { RequestItem } from './request-item/request-item';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  imports: [NgIf, NgFor, RequestItem],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly queueService = inject(EnrolmentQueueService);
  protected readonly userService = inject(UserService);
  protected readonly queue = this.queueService.queue;
  protected readonly stats = this.queueService.stats;
  protected readonly user = this.userService.user;

  protected readonly approve = (id: number): void => {
    const resolvedBy = this.user()?.name ?? 'System';
    this.queueService.updateRequestStatus(id, 'approved', resolvedBy);
  };

  protected readonly reject = (id: number): void => {
    const resolvedBy = this.user()?.name ?? 'System';
    this.queueService.updateRequestStatus(id, 'rejected', resolvedBy);
  };

  protected readonly viewDetails = (id: number): void => {
    // todo: route to /request/id or show popup or just open details drawer?
    console.log('View enrolment request', id);
  };

  ngOnInit(): void {
    this.userService.loadUser();
    this.queueService.loadQueue();
  }
}

