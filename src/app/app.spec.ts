import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { User, UserService } from './user.service';
import { QueueService } from './queue.service';

describe('App', () => {
  beforeEach(async () => {
    const adminUser = {
      "id": 701,
      "name": "Maya Admin",
      "role": "admin",
      "collegeId": 17,
      "email": "admin@mailinator.com",
      "permissions": ["enroll_requests_page", "enroll_requests_approve", "enroll_requests_reject"],
      "allowedBranches": ["Licensing", "Retirement"]
    };

    const mockUserService = {
      loadUsers: () => {},
      user: signal<User>(adminUser as User),
      users: signal([adminUser, adminUser, adminUser])
    };
    const mockQueueService = {
      isLoaded: signal(false),
      loadQueue: () => {}
    };
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: UserService, useValue: mockUserService,
        },
        {
          provide: QueueService, useValue: mockQueueService
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Enrolment Request Queue');
  });

  it.skip('should start with Admin User selected', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await fixture.whenStable();
    expect(app['selectedUser']()?.role).toBe('admin');
    expect(app['selectedUser']()?.name).toBe('Maya Admin');
  });
});
