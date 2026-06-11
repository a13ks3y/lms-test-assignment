import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { QueueService } from './queue.service';
import { RequestItem } from './request-item/request-item';
import { User } from './user.service';

@Component({
  selector: 'app-root',
  imports: [NgIf, NgFor, RequestItem],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly queueService = inject(QueueService);
  protected readonly queue = this.queueService.queue;
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
  protected readonly modalAction = signal<'approve' | 'reject' | null>(null);
  protected readonly modalRequestId = signal<number | null>(null);
  protected readonly modalReason = signal('');
  protected readonly modalError = signal<string | null>(null);

  protected readonly modalRequest = computed(() =>
    this.queue().find((request) => request.id === this.modalRequestId()),
  );

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
    this.openActionModal('approve', id);
  };

  protected readonly reject = (id: number): void => {
    this.openActionModal('reject', id);
  };

  protected readonly openActionModal = (action: 'approve' | 'reject', requestId: number): void => {
    this.modalAction.set(action);
    this.modalRequestId.set(requestId);
    this.modalReason.set('');
    this.modalError.set(null);
  };

  protected readonly cancelModal = (): void => {
    this.modalAction.set(null);
    this.modalRequestId.set(null);
    this.modalReason.set('');
    this.modalError.set(null);
  };

  protected readonly confirmModal = (): void => {
    const action = this.modalAction();
    const request = this.modalRequest();

    if (!action || !request) {
      this.cancelModal();
      return;
    }

    if (action === 'reject') {
      const reason = this.modalReason().trim();
      if (!reason) {
        this.modalError.set('Rejection reason is required.');
        return;
      }
      this.queueService.updateRequestStatus(request.id, 'rejected', this.selectedUser(), reason);
    } else {
      this.queueService.updateRequestStatus(request.id, 'approved', this.selectedUser());
    }

    this.cancelModal();
  };

  protected readonly setSelectedUser = (userId: string | number): void => {
    const selected = this.testUsers.find((user) => user.id === Number(userId));
    if (selected) {
      this.selectedUser.set(selected);
    }
  };

  protected readonly viewDetails = (id: number): void => {
    console.log('View enrolment request', id);
  };

  ngOnInit(): void {}
}

