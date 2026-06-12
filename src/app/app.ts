import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { QueueService } from './queue.service';
import { UserService } from './user.service';
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
  protected readonly userService = inject(UserService);
  protected readonly queue = this.queueService.queue;
  protected readonly isLoaded = this.queueService.isLoaded;
  protected readonly users = this.userService.users;

  protected readonly modalAction = signal<'approve' | 'reject' | null>(null);
  protected readonly modalRequestId = signal<number | null>(null);
  protected readonly modalReason = signal('');
  protected readonly modalError = signal<string | null>(null);
  protected readonly notificationMessage = signal<string | null>(null);
  protected readonly notificationMessageType = signal<string>('info');

  protected readonly selectedUser: Signal<User | null>;
  protected readonly modalRequest = computed(() =>
    this.queue().find((request) => request.id === this.modalRequestId()),
  );

  protected readonly loadQueueOnUser = effect(() => {
    const user = this.userService.user();
    if (user) {
      this.queueService.loadQueue(user);
    }
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

  protected readonly confirmModal = async (): Promise<void> => {
    const action = this.modalAction();
    const request = this.modalRequest();

    if (!action || !request) {
      this.cancelModal();
      return;
    }

    let status: string;
    if (action === 'reject') {
      const reason = this.modalReason().trim();
      if (!reason) {
        this.modalError.set('Rejection reason is required.');
        return;
      }
      const user = this.userService.user();
      if (!user) return;
      status = await this.queueService.updateRequestStatus(request.id, 'rejected', user, reason);
    } else {
      const user = this.userService.user();
      if (!user) return;
      status = await this.queueService.updateRequestStatus(request.id, 'approved', user);
    }

    if (status !== 'OK') {
      this.notify(status, 'error');
    } else {
      this.notify('Success!');
    }

    this.cancelModal();
  };

  protected readonly setSelectedUser = (userId: string | number): void => {
    const selected = this.users().find((user) => user.id === Number(userId));
    if (selected) {
      this.userService.user.set(selected);
    }
  };

  protected readonly viewDetails = (id: number): void => {
    console.log('View enrolment request', id);
  };
  protected readonly notify = (message: string, messageType: string = 'info'): void => {
    const timeout = messageType === 'error' ? 4800 : 2400;
    this.notificationMessageType.set(messageType);
    this.notificationMessage.set(message);
    window.setTimeout(() => {
      if (this.notificationMessage() === message) {
        this.notificationMessage.set(null);
      }
    }, timeout);
  };

  constructor() {
    this.userService.loadUsers();
    this.selectedUser = this.userService.user;
  }
}
