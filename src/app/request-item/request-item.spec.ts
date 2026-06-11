import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Request } from '../queue.service';
import { RequestItem } from './request-item';
import { User, UserService } from '../user.service';

const sampleRequest: Request = {
  id: 1,
  type: 'course',
  status: 'pending',
  collegeId: 17,
  branch: 'Licensing',
  submittedAt: '2026-06-10T00:00:00.000Z',
  source: 'web',
  paymentState: 'paid',
  requester: {
    id: 10,
    name: 'Alice',
    email: 'alice@example.com',
  },
  target: {
    id: 100,
    title: 'Introduction to Testing',
  },
  adminNote: 'Urgent request',
};
const branchMismatchRequest: Request = {
  id: 2,
  type: 'course',
  status: 'pending',
  collegeId: 17,
  branch: 'Healthcare',
  submittedAt: '2026-06-10T00:00:00.000Z',
  source: 'web',
  paymentState: 'paid',
  requester: {
    id: 10,
    name: 'Alice',
    email: 'alice@example.com',
  },
  target: {
    id: 100,
    title: 'Introduction to Testing',
  },
  adminNote: 'Urgent request',
};


describe('RequestItem', () => {
  let component: RequestItem;
  let fixture: ComponentFixture<RequestItem>;

  const userSignal = signal<User | null>({
    id: 1,
    collegeId: 17,
    permissions: ['enroll_requests_approve'],
    allowedBranches: ["Science", "Licensing", "Retirement"]
  } as User);

  const mockUserService = {
    user: userSignal,
    loadUsers: () => { }
  };

  beforeEach(async () => {
    const module = await TestBed.configureTestingModule({
      imports: [RequestItem],
      providers: [
        { provide: UserService, useValue: mockUserService }
      ]
    });

    module.inject(UserService)

    module.compileComponents();

    fixture = TestBed.createComponent(RequestItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return true for canApprove if user can approve', () => {
    expect(component.canApprove(sampleRequest)).toEqual(true);
  });

  it('should return false for canApprove if user can not approve', () => {
    expect(component.canApprove(branchMismatchRequest)).toEqual(false);
  })

});
