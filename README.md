# Yeda LMS - Enrollment Request Queue

A small admin-facing enrollment request queue built with **Angular 21** using standalone components, signals, and strict type safety.

## What Was Implemented

1. **Queue UI & Display**
   - Load enrollment requests from `test_input.json` via `HttpClient`
   - Display requester info, request type (course/bundle), target title, branch, date, status, source, payment state, and admin notes
   - Real-time filtered list with empty state

2. **Filtering & Counters**
   - Filter by status (all, pending, approved, rejected)
   - Filter by request type (all, course, bundle)
   - Filter by branch (dynamically extracted from queue)
   - Live counters for total, pending, approved, rejected, course, bundle—update with every filter change

3. **Local Approve/Reject Actions**
   - Modal confirmation workflow for approve and reject
   - Rejection requires a reason
   - Status updates propagate immediately to UI and counters
   - Approved/rejected requests have action buttons hidden (not just disabled)

4. **Permission Enforcement**
   - Current admin can only act on requests from their own `collegeId`
   - If `allowedBranches` is set, admin can only act on those branches
   - Cross-college and out-of-scope branch requests show disabled action buttons with clear warnings
   - Pending requests in scope show enabled, fully actionable buttons

5. **Test Coverage**
   - **Unit tests**: 9 passing (service logic, pipe, component inputs, queue operations)
   - **E2E tests**: 5 passing (filters + counters, approve action, cross-college deny, branch-scope deny, empty state)
   - Playwright browser automation with modern async/await flow

## What Was Intentionally Skipped

- Backend implementation (no persistence, no database)
- Authentication/login flow
- Real role/permission system beyond the fixture model
- Payment provider integration
- Salesforce integration
- Email/notification delivery
- Pixel-perfect UI design (focus on functionality and clarity)
- Advanced state libraries (signals + computed are sufficient)
- Database schema or migrations

## Tech Stack & Rationale

**Why Angular 21?**
- Mature, well-tested framework with strong TypeScript integration
- Modern standalone components eliminate boilerplate
- Signals provide a cleaner, more performant alternative to RxJS for this use case
- Strict type checking catches errors early
- Excellent developer experience with CLI scaffolding and testing tools

**Architecture Decisions:**
- **Signals over RxJS**: Local component state is simpler with signals; no need for observable chains here
- **Standalone Components**: Eliminated NgModules—cleaner, tree-shakeable, modern Angular 15+
- **ChangeDetectionStrategy.OnPush**: Explicit, performant change detection
- **Service-based state**: `QueueService` manages queue data; `UserService` provides user context
- **Computed filters**: Reactive computed properties auto-update when filters change
- **Modal inside root**: Simplifies wiring; avoids portal complexity for a small queue

## AI Usage

- **GitHub Copilot**: Used for code generation, test scaffolding, and refactoring suggestions
- **Approach**: Reviewed all AI-generated code, tested incrementally, and refined logic after initial implementation
- **Specific Changes**:
  - Generated initial service method stubs; rewrote to include rejection reason
  - Generated E2E test boilerplate; customized selectors and assertions
  - Generated CSS; tuned for layout and dark theme
  - Manually verified all state transitions and permission logic
- **Ownership**: Every core decision (filtering logic, permission enforcement, action flow) was deliberate and tested

## Backend Persistence & Authorization

### How to Persist Approve/Reject Actions

**POST /api/queue/requests/:id/action**
```json
{
  "action": "approve" | "reject",
  "approvedBy": "username",
  "rejectionReason": "optional, required if action is reject"
}
```

**Response**: Updated request object with new status and `lastUpdatedAt` timestamp.

### Backend Authorization Checks

1. **Authentication**: Verify JWT or session; extract `currentUser` context
2. **College Scope**: 
   - Check `request.collegeId === currentUser.collegeId`
   - Return 403 Forbidden if mismatch
3. **Branch Scope**: 
   - If `currentUser.allowedBranches.length > 0`, verify `request.branch in currentUser.allowedBranches`
   - Return 403 Forbidden if not allowed
4. **Status Guard**: 
   - Only allow approve/reject if `request.status === 'pending'`
   - Return 409 Conflict if already processed
5. **Idempotency**: 
   - Accept `Idempotency-Key` header; check if action already processed
   - Return 200 OK with cached result if duplicate detected (prevent double-charging, double-notifications)

### Duplicate Click Handling

1. **Frontend**: Disable buttons immediately after click; prevent re-submission via modal confirmation
2. **Backend**: 
   - Use `Idempotency-Key` header (UUID from client)
   - Store key + response in Redis/cache with 1-hour TTL
   - Idempotent operation: same key = same result, no side effects
3. **Database**: Use transaction to atomically update status + log action; constraints prevent race conditions

### Example Backend Flow

```
Client Request:
  POST /api/queue/requests/9001/action
  { action: "approve", approvedBy: "Maya Admin", Idempotency-Key: "uuid-123" }

Backend:
  1. Verify JWT, extract user
  2. Check cache: if uuid-123 exists, return cached response
  3. Load request 9001
  4. Verify: user.collegeId == request.collegeId ✓
  5. Verify: user.allowedBranches includes request.branch ✓
  6. Verify: request.status == "pending" ✓
  7. Update status = "approved", lastUpdatedAt = now()
  8. Log action (who, when, action type)
  9. Store idempotency key in cache
  10. Emit event for notifications (async queue)
  11. Return 200 OK with updated request

Retry (duplicate Idempotency-Key):
  Backend returns cached response immediately; no DB write; no notification re-sent
```

## Development & Testing

### Setup
```bash
npm install
npm start        # http://localhost:4200
npm run test     # Unit tests (Vitest)
npm run e2e      # E2E tests (Playwright)
npm run build    # Production build
```

### Verification Checklist

**Manual Checks:**
- [✓] Load page; queue displays with all fields
- [✓] Filters work independently and in combination
- [✓] Counters update when filter changes
- [✓] Click Approve on a pending request; confirm modal appears; confirm status changes and button disappears
- [✓] Click Reject; modal asks for reason; if blank, error shown; with reason, status changes
- [✓] Switch user to cross-college; buttons disabled with warning
- [✓] Switch user with branch restriction; out-of-scope branches show disabled buttons with warning

**Tests:**
```bash
npm run test     # 9 unit tests
npm run e2e      # 5 E2E tests
```

## Known Limitations & Future Improvements

1. **Search**: No full-text search on requester name, email, or title—could add input filter
2. **Sorting**: No column sorting; could add by date, status, branch
3. **Pagination**: Loads entire queue; could paginate for large datasets
4. **Undo**: No undo after approve/reject; could add with soft-delete or status-change log
5. **Bulk Actions**: Only one at a time; could add select-all and batch approve/reject
6. **Notifications**: No real-time updates from backend; could use WebSocket to sync changes
7. **Analytics**: No logging of admin actions for audit trail; backend logs should persist these
8. **Accessibility**: Should run full AXE audit and WCAG AA validation
9. **Performance**: Currently no lazy loading; virtualization for 1000+ items would help
10. **Error Handling**: No network retry logic; could add exponential backoff for transient failures

## Build & Deployment Notes

- CSS budget warning: `app.css` is ~330 bytes over 4 KB target (safe; remove unused styles to optimize)
- No environment config; uses `./test_input.json` for all runs
- Production build output: `dist/lms/`
- Run `npm run build` for prod bundle

