import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { EnrolmentQueueService } from './enrolment-queue.service';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  imports: [NgIf, NgFor, DatePipe],
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

  ngOnInit(): void {
    this.userService.loadUser();
    this.queueService.loadQueue();
  }
}

