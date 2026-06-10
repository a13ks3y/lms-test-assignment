import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'lecturer';
  permissions: string[];
  allowedBranches: string[];
}


@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(null);

  loadUser(): void {
    const dataUrl = './data.json';
    this.http
      .get<{ currentUser: User }>(dataUrl)
      .subscribe({
        next: (data) => this.user.set(data.currentUser),
        error: (error) => {
          console.error(`Error loading ${dataUrl}:`, error);
          this.user.set(null);
        },
    });
  }
}

