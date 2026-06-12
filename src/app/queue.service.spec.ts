import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QueueService, Request } from './queue.service';
import { User } from './user.service';

describe('QueueService', () => {
  let service: QueueService;
  let httpMock: HttpTestingController;

  const adminUser: User = {
      "id": 701,
      "name": "Maya Admin",
      "role": "admin",
      "collegeId": 17,
      "email": "admin@mailinator.com",
      "permissions": ["enroll_requests_page", "enroll_requests_approve", "enroll_requests_reject"],
      "allowedBranches": ["Licensing", "Retirement"]
  };

  const studentUser: User = {
    id: 2,
    name: 'Student User',
    email: 'student@example.com',
    role: 'student',
    collegeId: 17,
    permissions: ['view'],
    allowedBranches: ['Licensing'],
  };

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
const collegeMismatchRequest: Request = {
    id: 3,
    type: 'course',
    status: 'pending',
    collegeId: 88,
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QueueService],
    });

    service = TestBed.inject(QueueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requires a user and loads queue data', () => {
    service.loadQueue(adminUser);

    const request = httpMock.expectOne('./test_input.json');
    request.flush({ requests: [sampleRequest] });

    expect(service.queue()).toEqual([sampleRequest]);
  });

  it('masks adminNote for non-admin users', () => {
    service.loadQueue(studentUser);

    const request = httpMock.expectOne('./test_input.json');
    request.flush({ requests: [sampleRequest] });

    expect(service.queue()[0].adminNote).toBeNull();
  });
  it('updateRequestStatus should check user permissions', async () => {
    let status;
    service.loadQueue(adminUser);
    const request = httpMock.expectOne('./test_input.json');
    request.flush({ requests: [sampleRequest, branchMismatchRequest, collegeMismatchRequest ] });


    status = await service.updateRequestStatus(1, 'approved', adminUser);
    expect(service.queue()[0].status).toEqual('approved');
    expect(status).toEqual('OK');

    status = await service.updateRequestStatus(2, 'approved', adminUser);
    expect(service.queue()[1].status).toEqual('pending');
    expect(status).toEqual('User Maya Admin Do not allowed to approve or reject branch Healthcare');
    status = await service.updateRequestStatus(3, 'approved', adminUser);
    expect(service.queue()[2].status).toEqual('pending');
    expect(status).toEqual('Wrong college');

    status = await service.updateRequestStatus(-1, 'approved', adminUser);
    expect(status).toEqual('No request with id: #-1');
  });
  it('updateRequest status should check user permissions 2, the last Jedie', async () => {
    let status;
    service.loadQueue(adminUser);
    const request = httpMock.expectOne('./test_input.json');
    request.flush({ requests: [sampleRequest, branchMismatchRequest, collegeMismatchRequest ] });

    status = await service.updateRequestStatus(1, 'approved', studentUser);
    expect(service.queue()[0].status).toEqual('pending');
    expect(status).toEqual('User Student User has no permission to approve requests');

    status = await service.updateRequestStatus(1, 'rejected', studentUser);
    expect(service.queue()[0].status).toEqual('pending');
    expect(status).toEqual('User Student User has no permission to reject requests');

  });
});
