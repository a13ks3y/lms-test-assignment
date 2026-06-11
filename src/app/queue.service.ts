import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User} from './user.service';

export interface Requester {
  id: number;
  name: string;
  email: string;
}

export interface Request {
  id: number;
  type: 'course' | 'bundle';
  status: 'pending' | 'approved' | 'rejected';
  collegeId: number;
  branch: string;
  submittedAt: string;
  source: string;
  paymentState: string;
  requester: Requester;
  target: {
    id: number;
    title: string;
  };
  resolvedAt?: string;
  resolvedBy?: string;
  rejectionReason?: string;
  adminNote?: string | null;
}

export interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  course: number;
  bundle: number;
}

@Injectable({ providedIn: 'root' })
export class QueueService {
  private readonly http = inject(HttpClient);
  private readonly requests = signal<Request[]>([]);
  private readonly loaded = signal(false);

  readonly queue = this.requests.asReadonly();
  readonly isLoaded = this.loaded.asReadonly();

  readonly stats = computed<QueueStats>(() => {
    const items = this.requests();

    const stats: QueueStats = {
      total: items.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      course: 0,
      bundle: 0,
    };

    items.forEach(item => {
      // Count by status
      if (item.status === 'pending') stats.pending++;
      else if (item.status === 'approved') stats.approved++;
      else if (item.status === 'rejected') stats.rejected++;

      // Count by type
      if (item.type === 'course') stats.course++;
      else if (item.type === 'bundle') stats.bundle++;
    });

    return stats;
  });

  async updateRequestStatus(id: number, status: 'approved' | 'rejected', resolvedByUser: User, rejectionReason?: string): Promise<string> {
    const request = this.requests().find(r=>id === r.id);
    if (!request) {
      return `No request with id: #${id}`;
    }

    if (!resolvedByUser.allowedBranches.includes(request.branch)) {
      return `User ${resolvedByUser.name} Do not allowed to approve or reject branch ${request.branch}`;
    }
    if (resolvedByUser.collegeId !== request.collegeId) {
      return `Wrong college`;
    }
    if (status === 'approved') {
      if (!resolvedByUser.permissions.includes('enroll_requests_approve')) {
        return `User ${resolvedByUser.name} has no permission to approve requests`;
      }
    } else if (status === 'rejected') {
      if (!resolvedByUser.permissions.includes('enroll_requests_reject')) {
        return `User ${resolvedByUser.name} has no permission to reject requests`;
      }
    }


    this.requests.update(requests =>
      requests.map(request =>
        request.id === id
          ? {
              ...request,
              status,
              resolvedAt: new Date().toISOString(),
              resolvedBy: resolvedByUser?.name ?? request.resolvedBy,
              rejectionReason: status === 'rejected' ? rejectionReason : undefined,
            }
          : request,
      ),
    );
    return 'OK';
  }

  loadQueue(user: User): void {
    const dataUrl = './test_input.json';
    this.http
      .get<{ requests?: Request[] }>(dataUrl)
      .subscribe({
        next: (data) => {
          const alteredRequests: Request[] = (data.requests ?? []).map(request => ({
            ...request,
            adminNote: user.role === 'admin' ? request.adminNote : null,
          }));
          this.requests.set(alteredRequests);
          this.loaded.set(true);
        },
        error: (error) => {
          console.error(`Error loading ${dataUrl}:`, error);
          this.requests.set([]);
          this.loaded.set(true);
        },
    });
  }
}

