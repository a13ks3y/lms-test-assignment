import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'lecturer';
  collegeId: number;
  permissions: string[];
  allowedBranches: string[];
}


@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  readonly users = signal<User[]>([]);
  readonly user = signal<User | null>(null);

  loadUsers(): void {
    if (this.user() !== null) {
      return;
    }
    const dataUrl = './test_input.json';
    this.http
      .get<{ currentUserId: number; users: User[] }>(dataUrl)
      .subscribe({
        next: (data) => {
          this.users.set(data.users || []);
          const defaultUser = data.users?.find(u => u.id === data.currentUserId) || data.users?.[0] || null;
          this.user.set(defaultUser);
        },
        error: (error) => {
          console.error(`Error loading ${dataUrl}:`, error);
          this.users.set([]);
          this.user.set(null);
        },
    });
  }
}

