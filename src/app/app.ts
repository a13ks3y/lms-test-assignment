import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { EnrolmentQueueService } from './enrolment-queue.service';
import { RequestItem } from './request-item/request-item';
import { User } from './user.service';

@Component({
  selector: 'app-root',
  imports: [NgIf, NgFor, RequestItem],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly queueService = inject(EnrolmentQueueService);
  protected readonly queue = this.queueService.queue;
  protected readonly stats = this.queueService.stats;
  protected readonly isLoaded = this.queueService.isLoaded;

  protected readonly testUsers: User[] = [
    {
      "id": 701,
      "name": "Maya Admin",
      "role": "admin",
      "collegeId": 17,
      "email": "admin@mailinator.com",
      "permissions": ["enroll_requests_page", "enroll_requests_approve"],
      "allowedBranches": ["Licensing", "Retirement"]
    },
    {
      "id": 555,
      "name": "College 88 Admin",
      "role": "admin",
      "collegeId": 88,
      "email": "admin-88@mailinator.com",
      "permissions": ["enroll_requests_page", "enroll_requests_approve"],
      "allowedBranches": ["Licensing", "Retirement"]
    },
    {
      "id": 501,
      "name": "Dana Learner",
      "email": "dana.learner@example.com",
      "role": "student",
      "collegeId": 17,
      "permissions": ["enroll_requests_page"],
      "allowedBranches": ["Licensing"]
    },
    {
      "id": 666,
      "name": "Lucifer Morningstar",
      "email": "satan@hell.com",
      "role": "lecturer",
      "collegeId": 17,
      "permissions": ["enroll_requests_page", "enroll_requests_approve"],
      "allowedBranches": ["Licensing", "Legal", "Religion"]
    },
  ];

  protected readonly selectedUser = signal<User>(this.testUsers[0]);

  protected readonly currentUser = this.selectedUser;

  protected readonly loadQueueOnUser = effect(() => {
    this.queueService.loadQueue(this.selectedUser());
  });

  protected readonly statusFilter = signal<'all' | 'pending' | 'approved' | 'rejected'>('all');
  protected readonly typeFilter = signal<'all' | 'course' | 'bundle'>('all');
  protected readonly branchFilter = signal<string>('all');

  protected readonly branches = computed(() =>
    Array.from(new Set(this.queue().map((request) => request.branch))),
  );

  protected readonly filteredQueue = computed(() =>
    this.queue().filter((request) => {
      const statusMatches = this.statusFilter() === 'all' || request.status === this.statusFilter();
      const typeMatches = this.typeFilter() === 'all' || request.type === this.typeFilter();
      const branchMatches = this.branchFilter() === 'all' || request.branch === this.branchFilter();
      return statusMatches && typeMatches && branchMatches;
    }),
  );

  protected readonly visibleStats = computed(() => {
    const items = this.filteredQueue();
    return {
      total: items.length,
      pending: items.filter((request) => request.status === 'pending').length,
      approved: items.filter((request) => request.status === 'approved').length,
      rejected: items.filter((request) => request.status === 'rejected').length,
      course: items.filter((request) => request.type === 'course').length,
      bundle: items.filter((request) => request.type === 'bundle').length,
    };
  });

  protected readonly approve = (id: number): void => {
    const resolvedBy = this.selectedUser().name;
    this.queueService.updateRequestStatus(id, 'approved', resolvedBy);
  };

  protected readonly reject = (id: number): void => {
    const resolvedBy = this.selectedUser().name;
    this.queueService.updateRequestStatus(id, 'rejected', resolvedBy);
  };

  protected readonly setSelectedUser = (userId: string | number): void => {
    const selected = this.testUsers.find((user) => user.id === Number(userId));
    if (selected) {
      this.selectedUser.set(selected);
    }
  };

  protected readonly viewDetails = (id: number): void => {
    // todo: route to /request/id or show popup or just open details drawer?
    console.log('View enrolment request', id);
  };

  ngOnInit(): void {}
}

