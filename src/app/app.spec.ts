import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { UserService } from './user.service';

describe('App', () => {
  beforeEach(async () => {
    const userSignal = signal<User>({
      "id": 701,
      "name": "Maya Admin",
      "role": "admin",
      "collegeId": 17,
      "email": "admin@mailinator.com",
      "permissions": ["enroll_requests_page", "enroll_requests_approve", "enroll_requests_reject"],
      "allowedBranches": ["Licensing", "Retirement"]
    });
    const mockUserService = {
      loadUsers: () => {},
      user: userSignal
    }
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: UserService, useValue: mockUserService
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
