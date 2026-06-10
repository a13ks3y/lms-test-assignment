import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EnrolmentQueueService, Request } from './queue.service';
import { User } from './user.service';

describe('EnrolmentQueueService', () => {
  let service: EnrolmentQueueService;
  let httpMock: HttpTestingController;

  const adminUser: User = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['manage'],
    allowedBranches: ['Science'],
  };

  const studentUser: User = {
    id: 2,
    name: 'Student User',
    email: 'student@example.com',
    role: 'student',
    permissions: ['view'],
    allowedBranches: ['Arts'],
  };

  const sampleRequest: Request = {
    id: 1,
    type: 'course',
    status: 'pending',
    collegeId: 42,
    branch: 'Science',
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EnrolmentQueueService],
    });

    service = TestBed.inject(EnrolmentQueueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requires a user and loads queue data', () => {
    service.loadQueue(adminUser);

    const request = httpMock.expectOne('./data.json');
    request.flush({ requests: [sampleRequest] });

    expect(service.queue()).toEqual([sampleRequest]);
  });

  it('masks adminNote for non-admin users', () => {
    service.loadQueue(studentUser);

    const request = httpMock.expectOne('./data.json');
    request.flush({ requests: [sampleRequest] });

    expect(service.queue()[0].adminNote).toBeNull();
  });
});
